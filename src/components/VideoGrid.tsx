import React from 'react'
import { Play, Share2, Trash2, Film } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoGridProps {
  videos: Video[]
  onVideoSelect: (video: Video) => void
  onVideoShare: (video: Video) => void
  onVideoDelete: (videoId: string) => void
  loading: boolean
}

export function VideoGrid({ videos, onVideoSelect, onVideoShare, onVideoDelete, loading }: VideoGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'VIDEO'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-700"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              <div className="flex space-x-2">
                <div className="flex-1 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Brak filmów w chmurze</h3>
        <p className="text-gray-400">Wgraj swój pierwszy film aby rozpocząć</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10"
        >
          <div className="aspect-video bg-gray-800 relative group cursor-pointer">
            {video.thumbnail_path ? (
              <img
                src={video.thumbnail_path}
                alt={video.name}
                className="w-full h-full object-cover"
                onClick={() => onVideoSelect(video)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Film className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {getFileExtension(video.name)}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={() => onVideoSelect(video)}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <Play className="h-8 w-8 text-white fill-current" />
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ☁️ Chmura
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white truncate mb-1" title={video.name}>
              {video.name}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>{formatFileSize(video.size)}</span>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                {getFileExtension(video.name)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {formatDate(video.created_at)}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => onVideoShare(video)}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Udostępnij
              </button>
              <button
                onClick={() => onVideoDelete(video.id)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}