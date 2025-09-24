const multer = require('multer');
const path = require('path');
const { generateFileId, isSupportedFormat } = require('../utils/fileUtils');

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'php', 'pl', 'py', 'rb', 'sh'
];

// Supported video, audio, and image formats
const SUPPORTED_FORMATS = ['mp4', 'avi', 'mov', 'webm', 'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'mkv', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff'];

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Setting upload destination for file: ${file.originalname}`);
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueId = generateFileId();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    console.log(`Generated filename for upload: ${filename}`);
    cb(null, filename);
  }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  console.log(`File filter checking file: ${file.originalname}`);
  
  // Get file extension
  const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
  console.log(`File extension: ${extension}`);
  
  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    console.warn(`Blocked dangerous file extension: ${extension}`);
    return cb(new Error('Executable files are not allowed'), false);
  }
  
  // Check if file format is supported
  if (isSupportedFormat(file.originalname, SUPPORTED_FORMATS, file.mimetype)) {
    console.log(`File format supported: ${extension}, MIME type: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.warn(`Unsupported file format: ${extension}, MIME type: ${file.mimetype}`);
    cb(new Error('Unsupported file format'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

console.log('Upload middleware configured with 50MB file size limit');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  console.log('Upload error middleware triggered');
  
  if (err instanceof multer.MulterError) {
    console.warn(`Multer error: ${err.code} - ${err.message}`);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the limit of 50MB'
      });
    }
  } else if (err) {
    console.warn(`Upload error: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  console.log('Upload error middleware completed, passing to next middleware');
  next();
};

module.exports = {
  upload,
  handleUploadError
};