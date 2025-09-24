# FFmpeg Multimedia Suite

A comprehensive multimedia conversion platform supporting video, audio, and image processing with a React frontend and Node.js/Express backend using FFmpeg.

## Features

- Video conversion (MP4, AVI, MOV, WEBM)
- Audio conversion
- Image processing
- Drag-and-drop file uploads
- Progress tracking
- Responsive design

## Prerequisites

- Node.js >= 14.x
- FFmpeg installed and accessible in PATH
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ffmpeg-multimedia-suite
   ```

2. Install backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

3. Install frontend dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Ensure FFmpeg is installed and accessible in your system PATH

## Running Locally

### Development Mode

```
# Start backend server
cd server
npm run dev

# In another terminal, start frontend
cd client
npm start
```

Or use the provided batch script:
```
./start.bat
```

### Production Mode

1. Build the React frontend:
   ```
   cd client
   npm run build
   cd ..
   ```

2. Start the server in production mode:
   ```
   cd server
   NODE_ENV=production node server.js
   ```

## Deployment on Hostinger

### Prerequisites
- Hostinger VPS hosting plan
- SSH access to your server
- Domain name (optional but recommended)

### Deployment Steps

1. **Prepare the Application**
   ```bash
   # Build the React frontend
   cd client
   npm run build
   cd ..
   ```

2. **Upload Files to Hostinger**
   - Upload the entire `server/` directory
   - Upload the `client/build/` directory
   - Upload `ecosystem.config.js`

3. **SSH into Your Hostinger Server**
   ```bash
   ssh username@your-server-ip
   ```

4. **Install Dependencies**
   ```bash
   # Navigate to server directory
   cd /path/to/your/server
   
   # Install production dependencies
   npm ci --only=production
   ```

5. **Install PM2 for Process Management**
   ```bash
   npm install -g pm2
   ```

6. **Start the Application with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

7. **Configure NGINX**
   - Copy the nginx.conf configuration to `/etc/nginx/sites-available/your-domain`
   - Create a symlink to sites-enabled
   - Update the paths and domain name in the configuration
   - Restart NGINX

8. **Set Up SSL (Optional but Recommended)**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Environment Variables

Create a `.env.production` file in the server directory with:
```
NODE_ENV=production
PORT=3001
```

### Directory Structure on Server
```
/your-project/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── converted/
│   ├── node_modules/
│   ├── .env.production
│   ├── app.js
│   ├── server.js
│   └── package.json
└── client/
    └── build/
```

## API Endpoints

- `POST /api/upload/video` - Upload video files
- `POST /api/convert/video` - Convert videos
- `GET /api/formats` - Get supported formats
- `GET /api/qualities` - Get quality options
- `GET /api/progress/:fileId` - SSE endpoint for progress updates

## Troubleshooting

### FFmpeg Issues
- Ensure FFmpeg is installed and in PATH
- Check FFmpeg version compatibility

### File Upload Issues
- Check file size limits in NGINX and Node.js
- Verify upload directory permissions

### Performance Issues
- Monitor server resources
- Consider implementing job queues for heavy processing

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request