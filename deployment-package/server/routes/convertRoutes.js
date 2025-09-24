const express = require('express');
const router = express.Router();
const { convertFile, getFormats, downloadFile, getFileMetadata } = require('../controllers/convertController');

console.log('Initializing convert routes');

/**
 * POST /api/convert
 * Convert a video file
 */
router.post('/convert', convertFile);

/**
 * GET /api/formats
 * Get supported input and output formats
 */
router.get('/formats', getFormats);

/**
 * GET /api/download/:filename
 * Download a converted file
 */
router.get('/download/:filename', downloadFile);

/**
 * GET /api/metadata/:fileId
 * Get metadata for a video file
 */
router.get('/metadata/:fileId', getFileMetadata);

module.exports = router;