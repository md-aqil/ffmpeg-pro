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

// GET /api/image/metadata/:filename
router.get('/metadata/:filename', imageController.getImageMetadata);

// POST /api/image/watermark
router.post('/watermark', imageController.watermarkImage);

// POST /api/image/advancedEffects
router.post('/advancedEffects', imageController.applyAdvancedImageEffects);

module.exports = router;