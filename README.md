# VideoStream Pro

A modern, production-ready video hosting platform that allows users to upload, stream, and share videos up to 30GB in size. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Large File Support**: Upload videos up to 30GB
- **Universal Format Support**: MP4, WebM, OGG, AVI, MOV, WMV, FLV, **MKV**, 3GP, QuickTime
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Video Streaming**: Stream videos directly without downloading
- **Shareable Links**: Generate unique URLs for each video
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Video Management**: Search, organize, and delete videos
- **Thumbnail Generation**: Automatic video thumbnails
- **Modern UI**: Beautiful gradient design with glass-morphism effects

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: Browser LocalStorage (for demo purposes)

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd videostream-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🚀 Deployment

### GitHub Pages
1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to GitHub Pages

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration

## ⚠️ Important Notes

### Current Limitations
- **Storage**: Currently uses browser LocalStorage for demo purposes
- **File Persistence**: Files are stored locally and won't persist across devices
- **Sharing**: Share links work only on the same device/browser

### Production Deployment Requirements

For a fully functional public video hosting platform, you'll need:

1. **Backend Storage Service**:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Blob Storage
   - Or similar cloud storage solution

2. **Database**:
   - PostgreSQL, MySQL, or MongoDB
   - For storing video metadata and user information

3. **Video Processing**:
   - FFmpeg for video transcoding
   - Multiple resolution support
   - Thumbnail generation service

4. **CDN**:
   - Content Delivery Network for global video streaming
   - Reduced latency and improved performance

## 🔧 Configuration

### Supported Video Formats
The application supports the following video formats:
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- AVI (video/avi)
- MOV (video/mov)
- WMV (video/wmv)
- FLV (video/flv)
- **MKV (video/mkv, video/x-matroska)**
- 3GP (video/3gpp)
- QuickTime (video/quicktime)

### File Size Limits
- Maximum file size: 30GB per video
- Configurable in `src/App.tsx` (MAX_FILE_SIZE constant)

## 🎨 Customization

### Colors
The application uses a purple-blue gradient theme. You can customize colors in:
- Tailwind CSS classes throughout the components
- CSS custom properties for consistent theming

### Upload Limits
To change the upload limit, modify the `MAX_FILE_SIZE` constant in `src/App.tsx`:
```typescript
const MAX_FILE_SIZE = 30 * 1024 * 1024 * 1024; // 30GB in bytes
```

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include browser version and error messages

---

**Note**: This is a frontend-only demo application. For production use with public hosting and large file support, you'll need to implement a proper backend infrastructure with cloud storage services.