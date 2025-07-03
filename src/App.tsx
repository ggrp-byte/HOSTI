import React, { useState, useEffect } from 'react'
import { Film, Search, Copy, Check, AlertCircle, Download, Share2, Cloud } from 'lucide-react'
import { VideoUploader } from './components/VideoUploader'
import { VideoGrid } from './components/VideoGrid'
import { useVideos } from './hooks/useVideos'
import type { Database } from './lib/supabase'

type Video = Database['public']['Tables']['videos']['Row']

function App() {
  const { videos, loading, error, uploadVideo, deleteVideo, getVideoByShareToken } = useVideos()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [sharedVideoNotFound, setSharedVideoNotFound] = useState(false)

  useEffect(() => {
    // Check if there's a shared video in URL
    const urlParams = new URLSearchParams(window.location.search)
    const shareToken = urlParams.get('share')
    
    if (shareToken) {
      getVideoByShareToken(shareToken).then(video => {
        if (video) {
          setSelectedVideo(video)
          // Clean URL without refreshing page
          window.history.replaceState({}, document.title, window.location.pathname)
        } else {
          setSharedVideoNotFound(true)
          setTimeout(() => setSharedVideoNotFound(false), 5000)
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      })
    }
  }, [getVideoByShareToken])

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadError(null)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      await uploadVideo(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      setUploading(false)
      setUploadProgress(0)
      setUploadError(err instanceof Error ? err.message : 'Błąd podczas wgrywania')
      setTimeout(() => setUploadError(null), 5000)
    }
  }

  const handleShare = (video: Video) => {
    const baseUrl = window.location.origin + window.location.pathname
    const url = `${baseUrl}?share=${video.share_token}`
    setShareUrl(url)
    setShowShareModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo(videoId)
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null)
      }
    } catch (err) {
      console.error('Error deleting video:', err)
    }
  }

  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Film className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VideoStream Pro</h1>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-gray-300">Hosting w chmurze Oracle • Filmy do 30GB • Publiczne udostępnianie</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">{videos.length} filmów w chmurze</p>
              <p className="text-xs text-gray-400">
                Łącznie: {formatFileSize(videos.reduce((sum, v) => sum + v.size, 0))}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shared Video Not Found Error */}
        {sharedVideoNotFound && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-medium">Film nie został znaleziony</p>
              <p className="text-yellow-200 text-sm">Link może być nieprawidłowy lub film został usunięty.</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Upload Zone */}
        <VideoUploader
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          error={uploadError}
        />

        {/* Search Bar */}
        {videos.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj filmów w chmurze..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Video Grid */}
        <VideoGrid
          videos={filteredVideos}
          onVideoSelect={setSelectedVideo}
          onVideoShare={handleShare}
          onVideoDelete={handleDelete}
          loading={loading}
        />

        {/* No results */}
        {!loading && videos.length > 0 && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nie znaleziono filmów</h3>
            <p className="text-gray-400">Spróbuj zmienić wyszukiwane hasło</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate" title={selectedVideo.name}>
                  {selectedVideo.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-400">{formatFileSize(selectedVideo.size)}</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {getFileExtension(selectedVideo.name)}
                  </span>
                  <span className="text-xs bg-green-600 px-2 py-1 rounded flex items-center">
                    <Cloud className="h-3 w-3 mr-1" />
                    Chmura
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video">
              <video
                src={selectedVideo.public_url}
                controls
                autoPlay
                className="w-full h-full"
                preload="metadata"
              >
                Twoja przeglądarka nie obsługuje odtwarzania wideo.
              </video>
            </div>
            <div className="p-4 flex space-x-3">
              <button
                onClick={() => handleShare(selectedVideo)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij publicznie
              </button>
              <a
                href={selectedVideo.public_url}
                download={selectedVideo.name}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Pobierz
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Udostępnij film publicznie</h3>
            <p className="text-gray-300 mb-4">Skopiuj ten link aby udostępnić swój film:</p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mb-4">✓ Link skopiowany do schowka!</p>
            )}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
              <p className="text-green-300 text-sm">
                <strong>✓ Publiczny link:</strong> Działa na wszystkich urządzeniach i przeglądarkach na całym świecie!
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App