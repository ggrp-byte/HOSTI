import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Video = Database['public']['Tables']['videos']['Row']

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas ładowania filmów')
    } finally {
      setLoading(false)
    }
  }

  const uploadVideo = async (file: File): Promise<Video | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `videos/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // Generate share token
      const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

      // Save video metadata to database
      const videoData = {
        name: file.name,
        size: file.size,
        type: file.type,
        file_path: filePath,
        public_url: publicUrl,
        share_token: shareToken,
        upload_date: new Date().toISOString()
      }

      const { data, error: dbError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single()

      if (dbError) throw dbError

      // Refresh videos list
      await fetchVideos()
      
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd podczas wgrywania filmu')
    }
  }

  const deleteVideo = async (videoId: string) => {
    try {
      // Get video data first
      const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('file_path, thumbnail_path')
        .eq('id', videoId)
        .single()

      if (fetchError) throw fetchError

      // Delete file from storage
      if (video.file_path) {
        await supabase.storage
          .from('videos')
          .remove([video.file_path])
      }

      // Delete thumbnail if exists
      if (video.thumbnail_path) {
        await supabase.storage
          .from('videos')
          .remove([video.thumbnail_path])
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (deleteError) throw deleteError

      // Refresh videos list
      await fetchVideos()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd podczas usuwania filmu')
    }
  }

  const getVideoByShareToken = async (shareToken: string): Promise<Video | null> => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('share_token', shareToken)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  return {
    videos,
    loading,
    error,
    uploadVideo,
    deleteVideo,
    getVideoByShareToken,
    refetch: fetchVideos
  }
}