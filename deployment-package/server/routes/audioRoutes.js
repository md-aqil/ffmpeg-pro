const express = require('express');
const router = express.Router();
const { 
  convertAudioFile, 
  extractAudioFromVideo, 
  trimAudioFile, 
  mixAudioFiles, 
  applyAudioEffectsToFile,
  getAudioFormats
} = require('../controllers/audioController');

console.log('Initializing audio routes');

/**
 * POST /api/audio/convert
 * Convert an audio file
 */
router.post('/convert', convertAudioFile);

/**
 * POST /api/audio/extract
 * Extract audio from a video file
 */
router.post('/extract', extractAudioFromVideo);

/**
 * POST /api/audio/trim
 * Trim an audio file
 */
router.post('/trim', trimAudioFile);

/**
 * POST /api/audio/mix
 * Mix multiple audio files
 */
router.post('/mix', mixAudioFiles);

/**
 * POST /api/audio/effects
 * Apply audio effects (volume control, fade in/out)
 */
router.post('/effects', applyAudioEffectsToFile);

/**
 * GET /api/audio/formats
 * Get supported audio input and output formats
 */
router.get('/formats', getAudioFormats);

module.exports = router;