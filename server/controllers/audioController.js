const fs = require('fs').promises;
const path = require('path');
const { 
  convertAudio, 
  extractAudio, 
  trimAudio, 
  mixAudio, 
 applyAudioEffects,
  getSupportedAudioInputFormats,
  getSupportedAudioOutputFormats 
} = require('../services/audioService');
const { getFileExtension } = require('../utils/fileUtils');

/**
 * Convert audio file to specified format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const convertAudioFile = async (req, res) => {
  try {
    console.log('Audio conversion request received');
    const { fileId, fileName, outputFormat, quality, bitrate } = req.body;
    
    // Log request details
    console.log(`Conversion parameters - fileId: ${fileId}, outputFormat: ${outputFormat}, quality: ${quality}, bitrate: ${bitrate}`);
    
    // Validate input
    if (!fileId || !outputFormat) {
      console.warn('Missing required fields in audio conversion request');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileId and outputFormat'
      });
    }
    
    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      console.warn(`Invalid file ID format: ${fileId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format'
      });
    }
    
    // Validate output format
    const supportedOutputFormats = getSupportedAudioOutputFormats();
    if (!supportedOutputFormats.includes(outputFormat.toLowerCase())) {
      console.warn(`Unsupported output format requested: ${outputFormat}`);
      return res.status(400).json({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedOutputFormats.join(', ')}`
      });
    }
    
    // Validate quality setting
    const validQualities = ['low', 'medium', 'high'];
    const qualitySetting = validQualities.includes(quality) ? quality : 'medium';
    console.log(`Using quality setting: ${qualitySetting}`);
    
    // Check if input file exists
    const fileExtension = getFileExtension(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    console.log(`Checking for input file at: ${inputFilePath}`);
    try {
      await fs.access(inputFilePath);
      console.log(`Input file found: ${inputFilePath}`);
    } catch (error) {
      console.warn(`Input file not found: ${inputFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }
    
    // Perform conversion
    console.log(`Starting audio conversion of file ${fileId} to ${outputFormat} with ${qualitySetting} quality`);
    const outputPath = await convertAudio(inputFilePath, outputFormat, qualitySetting, bitrate);
    console.log(`Audio conversion completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      convertedFile: outputFileName,
      message: 'Audio conversion completed successfully'
    });
  } catch (error) {
    console.error('Error converting audio:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert audio'
    });
  }
};

/**
 * Extract audio from video file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const extractAudioFromVideo = async (req, res) => {
  try {
    console.log('Audio extraction request received');
    const { fileId, fileName, outputFormat } = req.body;
    
    // Log request details
    console.log(`Extraction parameters - fileId: ${fileId}, outputFormat: ${outputFormat}`);
    
    // Validate input
    if (!fileId || !outputFormat) {
      console.warn('Missing required fields in audio extraction request');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileId and outputFormat'
      });
    }
    
    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      console.warn(`Invalid file ID format: ${fileId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format'
      });
    }
    
    // Validate output format
    const supportedOutputFormats = getSupportedAudioOutputFormats();
    if (!supportedOutputFormats.includes(outputFormat.toLowerCase())) {
      console.warn(`Unsupported output format requested: ${outputFormat}`);
      return res.status(400).json({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedOutputFormats.join(', ')}`
      });
    }
    
    // Check if input file exists
    const fileExtension = getFileExtension(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    console.log(`Checking for input file at: ${inputFilePath}`);
    try {
      await fs.access(inputFilePath);
      console.log(`Input file found: ${inputFilePath}`);
    } catch (error) {
      console.warn(`Input file not found: ${inputFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }
    
    // Perform extraction
    console.log(`Starting audio extraction from file ${fileId} to ${outputFormat}`);
    const outputPath = await extractAudio(inputFilePath, outputFormat);
    console.log(`Audio extraction completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      extractedFile: outputFileName,
      message: 'Audio extraction completed successfully'
    });
  } catch (error) {
    console.error('Error extracting audio:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract audio'
    });
  }
};

/**
 * Trim audio file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const trimAudioFile = async (req, res) => {
  try {
    console.log('Audio trimming request received');
    const { fileId, fileName, startTime, duration } = req.body;
    
    // Log request details
    console.log(`Trimming parameters - fileId: ${fileId}, startTime: ${startTime}, duration: ${duration}`);
    
    // Validate input
    if (!fileId || startTime === undefined || duration === undefined) {
      console.warn('Missing required fields in audio trimming request');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileId, startTime, and duration'
      });
    }
    
    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      console.warn(`Invalid file ID format: ${fileId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format'
      });
    }
    
    // Validate time values
    const start = parseFloat(startTime);
    const dur = parseFloat(duration);
    
    if (isNaN(start) || isNaN(dur) || start < 0 || dur <= 0) {
      console.warn('Invalid time values for trimming');
      return res.status(400).json({
        success: false,
        error: 'Invalid time values. Start time must be >= 0 and duration must be > 0'
      });
    }
    
    // Check if input file exists
    const fileExtension = getFileExtension(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    console.log(`Checking for input file at: ${inputFilePath}`);
    try {
      await fs.access(inputFilePath);
      console.log(`Input file found: ${inputFilePath}`);
    } catch (error) {
      console.warn(`Input file not found: ${inputFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }
    
    // Perform trimming
    console.log(`Starting audio trimming of file ${fileId} from ${start}s for ${dur}s`);
    const outputPath = await trimAudio(inputFilePath, start, dur);
    console.log(`Audio trimming completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      trimmedFile: outputFileName,
      message: 'Audio trimming completed successfully'
    });
  } catch (error) {
    console.error('Error trimming audio:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to trim audio'
    });
  }
};

/**
 * Mix multiple audio files
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const mixAudioFiles = async (req, res) => {
  try {
    console.log('Audio mixing request received');
    const { fileIds, fileNames, outputFormat } = req.body;
    
    // Log request details
    console.log(`Mixing parameters - fileIds: ${fileIds}, outputFormat: ${outputFormat}`);
    
    // Validate input
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      console.warn('Missing or invalid file IDs in audio mixing request');
      return res.status(400).json({
        success: false,
        error: 'At least two file IDs are required for mixing'
      });
    }
    
    if (!outputFormat) {
      console.warn('Missing output format in audio mixing request');
      return res.status(400).json({
        success: false,
        error: 'Missing output format'
      });
    }
    
    // Validate output format
    const supportedOutputFormats = getSupportedAudioOutputFormats();
    if (!supportedOutputFormats.includes(outputFormat.toLowerCase())) {
      console.warn(`Unsupported output format requested: ${outputFormat}`);
      return res.status(400).json({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedOutputFormats.join(', ')}`
      });
    }
    
    // Check if all input files exist
    const inputFilePaths = [];
    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i];
      const fileName = fileNames && fileNames[i] ? fileNames[i] : fileId;
      
      // Validate file ID format
      if (!/^[a-f0-9-]+$/i.test(fileId)) {
        console.warn(`Invalid file ID format: ${fileId}`);
        return res.status(400).json({
          success: false,
          error: `Invalid file ID format: ${fileId}`
        });
      }
      
      const fileExtension = getFileExtension(fileName);
      const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
      console.log(`Checking for input file at: ${inputFilePath}`);
      
      try {
        await fs.access(inputFilePath);
        console.log(`Input file found: ${inputFilePath}`);
        inputFilePaths.push(inputFilePath);
      } catch (error) {
        console.warn(`Input file not found: ${inputFilePath}`);
        return res.status(404).json({
          success: false,
          error: `Input file not found: ${fileId}`
        });
      }
    }
    
    // Perform mixing
    console.log(`Starting audio mixing of ${fileIds.length} files to ${outputFormat}`);
    const outputPath = await mixAudio(inputFilePaths, outputFormat);
    console.log(`Audio mixing completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      mixedFile: outputFileName,
      message: 'Audio mixing completed successfully'
    });
  } catch (error) {
    console.error('Error mixing audio:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mix audio'
    });
  }
};

/**
 * Apply audio effects (volume control, fade in/out)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const applyAudioEffectsToFile = async (req, res) => {
  try {
    console.log('Audio effects request received');
    const { fileId, fileName, volume, fadeIn, fadeOut } = req.body;
    
    // Log request details
    console.log(`Effects parameters - fileId: ${fileId}, volume: ${volume}, fadeIn: ${fadeIn}, fadeOut: ${fadeOut}`);
    
    // Validate input
    if (!fileId) {
      console.warn('Missing file ID in audio effects request');
      return res.status(400).json({
        success: false,
        error: 'Missing file ID'
      });
    }
    
    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      console.warn(`Invalid file ID format: ${fileId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format'
      });
    }
    
    // Validate effect parameters
    const effectParams = {};
    if (volume !== undefined) {
      const vol = parseFloat(volume);
      if (isNaN(vol) || vol < 0) {
        console.warn('Invalid volume value');
        return res.status(400).json({
          success: false,
          error: 'Invalid volume value. Must be a number >= 0'
        });
      }
      effectParams.volume = vol;
    }
    
    if (fadeIn !== undefined) {
      const fade = parseFloat(fadeIn);
      if (isNaN(fade) || fade < 0) {
        console.warn('Invalid fade in value');
        return res.status(400).json({
          success: false,
          error: 'Invalid fade in value. Must be a number >= 0'
        });
      }
      effectParams.fadeIn = fade;
    }
    
    if (fadeOut !== undefined) {
      const fade = parseFloat(fadeOut);
      if (isNaN(fade) || fade < 0) {
        console.warn('Invalid fade out value');
        return res.status(400).json({
          success: false,
          error: 'Invalid fade out value. Must be a number >= 0'
        });
      }
      effectParams.fadeOut = fade;
    }
    
    // Check if input file exists
    const fileExtension = getFileExtension(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    console.log(`Checking for input file at: ${inputFilePath}`);
    try {
      await fs.access(inputFilePath);
      console.log(`Input file found: ${inputFilePath}`);
    } catch (error) {
      console.warn(`Input file not found: ${inputFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }
    
    // Perform effects application
    console.log(`Starting audio effects application on file ${fileId}`);
    const outputPath = await applyAudioEffects(inputFilePath, effectParams);
    console.log(`Audio effects application completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      effectedFile: outputFileName,
      message: 'Audio effects applied successfully'
    });
  } catch (error) {
    console.error('Error applying audio effects:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply audio effects'
    });
  }
};

/**
 * Get supported audio formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAudioFormats = (req, res) => {
  try {
    console.log('Audio formats request received');
    const inputFormats = getSupportedAudioInputFormats();
    const outputFormats = getSupportedAudioOutputFormats();
    
    console.log(`Returning supported audio formats - input: ${inputFormats.length}, output: ${outputFormats.length}`);
    res.status(200).json({
      success: true,
      input: inputFormats,
      output: outputFormats
    });
  } catch (error) {
    console.error('Error fetching audio formats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported audio formats'
    });
  }
};

module.exports = {
  convertAudioFile,
  extractAudioFromVideo,
  trimAudioFile,
  mixAudioFiles,
  applyAudioEffectsToFile,
  getAudioFormats
};