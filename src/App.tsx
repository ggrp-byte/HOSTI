import React, { useState, useEffect } from 'react';
import { Upload, Play, Share2, Film, Search, Trash2, Download, Copy, Check, AlertCircle } from 'lucide-react';

interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  uploadDate: string;
}

function App() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Maximum file size: 30GB in bytes
  const MAX_FILE_SIZE = 30 * 1024 * 1024 * 1024;

  // Supported video formats including MKV
  const SUPPORTED_FORMATS = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv',
    'video/x-matroska', // Alternative MIME type for MKV
    'video/3gpp',
    'video/quicktime'
  ];

  useEffect(() => {
    const savedVideos = localStorage.getItem('uploadedVideos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }
  }, []);

  const saveVideos = (videoList: VideoFile[]) => {
    localStorage.setItem('uploadedVideos', JSON.stringify(videoList));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isVideoFile = (file: File) => {
    // Check MIME type
    if (SUPPORTED_FORMATS.includes(file.type)) {
      return true;
    }
    
    // Check file extension for MKV and other formats (fallback)
    const extension = file.name.toLowerCase().split('.').pop();
    const supportedExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', '3gp', 'qt'];
    return supportedExtensions.includes(extension || '');
  };

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadeddata', () => {
        canvas.width = 320;
        canvas.height = 180;
        video.currentTime = Math.min(1, video.duration * 0.1); // 10% into the video or 1 second
      });

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
        }
      });

      video.addEventListener('error', () => {
        // If thumbnail generation fails, resolve with empty string
        resolve('');
      });

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const validateFile = (file: File): string | null => {
    if (!isVideoFile(file)) {
      return 'Please select a valid video file. Supported formats: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV, 3GP, QuickTime';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    
    return null;
  };

  const handleFileUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate upload progress with more realistic timing for large files
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        // Slower progress for larger files
        const increment = file.size > 1024 * 1024 * 1024 ? Math.random() * 5 : Math.random() * 15;
        return prev + increment;
      });
    }, file.size > 1024 * 1024 * 1024 ? 500 : 200); // Slower updates for large files

    try {
      const thumbnail = await generateThumbnail(file);
      const videoUrl = URL.createObjectURL(file);
      
      const newVideo: VideoFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type || 'video/unknown',
        url: videoUrl,
        thumbnail,
        uploadDate: new Date().toISOString()
      };

      // Longer processing time for larger files
      const processingTime = Math.min(3000, Math.max(1000, file.size / (1024 * 1024))); // 1-3 seconds based on file size
      
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          const updatedVideos = [...videos, newVideo];
          setVideos(updatedVideos);
          saveVideos(updatedVideos);
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      }, processingTime);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setUploadError('Error processing video. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const generateShareUrl = (video: VideoFile) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?video=${video.id}`;
  };

  const handleShare = (video: VideoFile) => {
    const url = generateShareUrl(video);
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deleteVideo = (videoId: string) => {
    const updatedVideos = videos.filter(v => v.id !== videoId);
    setVideos(updatedVideos);
    saveVideos(updatedVideos);
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'VIDEO';
  };

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
                <p className="text-sm text-gray-300">Upload & Share Videos up to 30GB • All Formats Supported</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">{videos.length} videos uploaded</p>
              <p className="text-xs text-gray-400">
                Total: {formatFileSize(videos.reduce((sum, v) => sum + v.size, 0))}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Zone */}
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
                  <h3 className="text-xl font-semibold text-white mb-2">Processing Video...</h3>
                  <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 mt-2">{Math.round(uploadProgress)}%</p>
                  <p className="text-sm text-gray-400 mt-1">Large files may take longer to process</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {dragOver ? 'Drop your video here!' : 'Upload Your Video'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Drag and drop your video file or click to browse
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
                    Choose File
                  </label>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    <strong>Supported formats:</strong> MP4, WebM, OGG, AVI, MOV, WMV, FLV, <span className="text-purple-300 font-semibold">MKV</span>, 3GP, QuickTime
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Maximum size:</strong> 30GB per file
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{uploadError}</p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {videos.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10"
              >
                <div className="aspect-video bg-gray-800 relative group cursor-pointer">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedVideo(video)}
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
                      onClick={() => setSelectedVideo(video)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Play className="h-8 w-8 text-white fill-current" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-1" title={video.name}>
                    {video.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                    <span>{formatFileSize(video.size)}</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {getFileExtension(video.name)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShare(video)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
            <p className="text-gray-400">Upload your first video to get started</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
            <p className="text-gray-400">Try adjusting your search term</p>
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
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-full"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 flex space-x-3">
              <button
                onClick={() => handleShare(selectedVideo)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Video
              </button>
              <a
                href={selectedVideo.url}
                download={selectedVideo.name}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Share Video</h3>
            <p className="text-gray-300 mb-4">Copy this link to share your video:</p>
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
              <p className="text-green-400 text-sm mb-4">✓ Link copied to clipboard!</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;