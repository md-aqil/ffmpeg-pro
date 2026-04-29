// server/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// POST /api/image/convert
router.post('/convert', uploadMiddleware.upload.single('image'), imageController.convertImage);

// POST /api/image/resize
router.post('/resize', imageController.resizeImage);

// POST /api/image/crop
router.post('/crop', imageController.cropImage);

// POST /api/image/effects
router.post('/effects', imageController.applyEffects);

// POST /api/image/extractFrames
router.post('/extractFrames', imageController.extractFrames);

// POST /api/image/createVideoFromImages
router.post('/createVideoFromImages', imageController.createVideoFromImages);

// POST /api/image/optimize
router.post('/optimize', imageController.optimizeImage);

// POST /api/batch/images
router.post('/batch/images', imageController.batchImages);
router.post('/batch', imageController.batchImages);

// GET /api/image/metadata/:filename
router.get('/metadata/:filename', imageController.getImageMetadata);

// GET /api/image/formats
router.get('/formats', imageController.getImageFormats);

// POST /api/image/watermark
router.post('/watermark', imageController.watermarkImage);

// POST /api/image/advancedEffects
router.post('/advancedEffects', imageController.applyAdvancedImageEffects);

// POST /api/image/pipeline - Process multiple operations in sequence
router.post('/pipeline', imageController.processPipeline);

// POST /api/image/fast-preview - Process a fast preview of operations
router.post("/fast-preview", imageController.generateFastPreview);

// POST /api/image/analyze - AI analysis
router.post("/analyze", imageController.analyzeImage);

// POST /api/image/download-with-metadata - Download image with AI metadata in a ZIP
router.post("/download-with-metadata", imageController.downloadWithMetadata);

module.exports = router;
