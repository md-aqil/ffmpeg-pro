const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const convertRoutes = require('./routes/convertRoutes');
const fs = require('fs');

console.log('Initializing Express application');

// Load environment variables
// Create directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
    console.log('Created converted directory');
}
dotenv.config();

// Create Express app
console.log('Creating Express application instance');
const app = express();

// Middleware
console.log('Setting up middleware');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
console.log('Setting up static file serving for uploads directory');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the "converted" directory
console.log('Setting up static file serving for converted directory');
app.use('/converted', express.static(path.join(__dirname, 'converted')));

// API Routes
console.log('Setting up API routes');
app.use('/api/upload', uploadRoutes);

// Image routes
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/image', imageRoutes);

app.use('/api', convertRoutes);

// Audio routes
const audioRoutes = require('./routes/audioRoutes');
app.use('/api/audio', audioRoutes);

// Image routes

// Get supported formats - this will be handled by convertRoutes now
// Removed from here as it's duplicated

// Get quality options
app.get('/api/qualities', (req, res) => {
  res.json({
    success: true,
    qualities: [
      { name: 'low', resolution: '480p' },
      { name: 'medium', resolution: '720p' },
      { name: 'high', resolution: '1080p' }
    ]
  });
});

// SSE endpoint for progress updates
app.get('/api/progress/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', fileId })}\n\n`);
  
  // Store the response object for this fileId so we can send updates
  if (!global.progressStreams) {
    global.progressStreams = {};
  }
  global.progressStreams[fileId] = res;
  
  // Clean up when the connection is closed
  req.on('close', () => {
    delete global.progressStreams[fileId];
  });
});

// Routes
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Video Converter API' });
});

// Error handling middleware
console.log('Setting up error handling middleware');
app.use((err, req, res, next) => {
  console.error('Unhandled error occurred:', err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
console.log('Setting up 404 handler');
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: 'Route not found' });
});

console.log('Exporting Express application');
module.exports = app;