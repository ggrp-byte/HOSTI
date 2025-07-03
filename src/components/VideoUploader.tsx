import React, { useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'

interface VideoUploaderProps {
  onUpload: (file: File) => Promise<void>
  uploading: boolean
  uploadProgress: number
  error: string | null
}

const MAX_FILE_SIZE = 30 * 1024 * 1024 * 1024 // 30GB

const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/mkv',
  'video/x-matroska',
  'video/3gpp',
  'video/quicktime'
]

export function VideoUploader({ onUpload, uploading, uploadProgress, error }: VideoUploaderProps) {
  const [dragOver, setDragOver] = useState(false)

  const isVideoFile = (file: File) => {
    if (SUPPORTED_FORMATS.includes(file.type)) {
      return true
    }
    
    const extension = file.name.toLowerCase().split('.').pop()
    const supportedExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp', 'qt']
    return supportedExtensions.includes(extension || '')
  }

  const validateFile = (file: File): string | null => {
    if (!isVideoFile(file)) {
      return 'Proszę wybrać prawidłowy plik wideo. Obsługiwane formaty: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV, 3GP, QuickTime'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Rozmiar pliku przekracza maksymalny limit 30GB`
    }
    
    return null
  }

  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      return
    }

    await onUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="mb-8">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragOver
            ? 'border-purple-400 bg-purple-500/10 scale-105'
            : uploading
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-400 bg-white/5 hover:bg-white/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Wgrywanie do chmury...</h3>
              <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-300 mt-2">{Math.round(uploadProgress)}%</p>
              <p className="text-sm text-gray-400 mt-1">Wgrywanie do Oracle Cloud Storage...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {dragOver ? 'Upuść swój film tutaj!' : 'Wgraj film do chmury'}
              </h3>
              <p className="text-gray-300 mb-4">
                Przeciągnij i upuść plik wideo lub kliknij aby przeglądać
              </p>
              <input
                type="file"
                accept="video/*,.mkv"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 cursor-pointer"
              >
                <Upload className="h-5 w-5 mr-2" />
                Wybierz plik
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                <strong>Obsługiwane formaty:</strong> MP4, WebM, OGG, AVI, MOV, WMV, FLV, <span className="text-purple-300 font-semibold">MKV</span>, 3GP, QuickTime
              </p>
              <p className="text-sm text-gray-400">
                <strong>Maksymalny rozmiar:</strong> {formatFileSize(MAX_FILE_SIZE)}
              </p>
              <p className="text-sm text-green-400">
                <strong>✓ Publiczne udostępnianie</strong> - Linki działają na wszystkich urządzeniach
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}