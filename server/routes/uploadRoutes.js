const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { uploadFile, uploadMultipleFiles } = require('../controllers/uploadController');

console.log('Initializing upload routes');

/**
 * POST /api/upload
 * Upload a single media file (video or audio)
 */
router.post('/', upload.single('file'), handleUploadError, uploadFile);

/**
 * POST /api/upload/multiple
 * Upload multiple media files (video or audio)
 */
router.post('/multiple', upload.array('files', 5), handleUploadError, uploadMultipleFiles);

module.exports = router;