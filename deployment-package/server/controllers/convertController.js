const fs = require('fs').promises;
const path = require('path');
const { convertVideo, getSupportedInputFormats, getSupportedOutputFormats } = require('../services/ffmpegService');
const { getFileExtension } = require('../utils/fileUtils');

/**
 * Convert a video file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const convertFile = async (req, res) => {
  try {
    console.log('Video conversion request received');
    const { fileId, fileName, outputFormat, quality, width, height, manualBitrate } = req.body;
    console.log(`Received fileId: ${fileId}, fileName: ${fileName}`);
    
    // Log request details
    console.log(`Conversion parameters - fileId: ${fileId}, outputFormat: ${outputFormat}, quality: ${quality}, width: ${width}, height: ${height}, manualBitrate: ${manualBitrate}`);
    
    // Validate input
    if (!fileId || !outputFormat) {
      console.warn('Missing required fields in conversion request');
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
    const supportedOutputFormats = getSupportedOutputFormats();
    if (!supportedOutputFormats.includes(outputFormat.toLowerCase())) {
      console.warn(`Unsupported output format requested: ${outputFormat}`);
      return res.status(400).json({
        success: false,
        error: `Unsupported output format. Supported formats: ${supportedOutputFormats.join(', ')}`
      });
    }
    
    // Validate quality setting
    const validQualities = ['low', 'medium', 'high', 'ultra'];
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
      console.log(`Input file NOT found: ${inputFilePath}`);
      console.warn(`Input file not found: ${inputFilePath}`);
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }
    
    // Perform conversion
    console.log(`Starting conversion of file ${fileId} to ${outputFormat} with ${qualitySetting} quality`);
    const outputPath = await convertVideo(inputFilePath, outputFormat, qualitySetting, width, height, manualBitrate);
    console.log(`Conversion completed. Output file: ${outputPath}`);
    
    // Get output filename from path
    const outputFileName = path.basename(outputPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      convertedFile: outputFileName,
      message: 'Video conversion completed successfully'
    });
  } catch (error) {
    console.error('Error converting video:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert video'
    });
  }
};

/**
 * Get supported formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFormats = (req, res) => {
  try {
    console.log('Formats request received');
    const inputFormats = getSupportedInputFormats();
    const outputFormats = getSupportedOutputFormats();
    
    console.log(`Returning supported formats - input: ${inputFormats.length}, output: ${outputFormats.length}`);
    res.status(200).json({
      success: true,
      input: inputFormats,
      output: outputFormats
    });
  } catch (error) {
    console.error('Error fetching formats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported formats'
    });
  }
};

/**
 * Download a converted file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadFile = async (req, res) => {
  try {
    console.log('File download request received');
    const { filename } = req.params;
    
    // Validate filename
    if (!filename) {
      console.warn('Missing filename parameter in download request');
      return res.status(400).json({
        success: false,
        error: 'Missing filename parameter'
      });
    }
    
    console.log(`Download requested for file: ${filename}`);
    
    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.warn(`Directory traversal attempt blocked for filename: ${filename}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    // Additional security: sanitize filename
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename) {
      console.warn(`Filename sanitization applied. Original: ${filename}, Sanitized: ${sanitizedFilename}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    // Check if file exists
    const filePath = path.join(__dirname, '../converted', sanitizedFilename);
    console.log(`Checking for file at: ${filePath}`);
    try {
      await fs.access(filePath);
      console.log(`File found: ${filePath}`);
    } catch (error) {
      console.warn(`File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Send file for download
    console.log(`Sending file for download: ${sanitizedFilename}`);
    res.download(filePath, sanitizedFilename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to download file'
        });
      } else {
        console.log(`File downloaded successfully: ${sanitizedFilename}`);
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
};

/**
 * Get metadata for a video file
 * @param {Object} req - Express request object
* @param {Object} res - Express response object
*/
const getFileMetadata = async (req, res) => {
  try {
    console.log('File metadata request received');
    const { fileId } = req.params;
    
    // Validate file ID
    if (!fileId) {
      console.warn('Missing fileId parameter in metadata request');
      return res.status(400).json({
        success: false,
        error: 'Missing fileId parameter'
      });
    }
    
    console.log(`Metadata requested for file ID: ${fileId}`);
    
    // Find the file in uploads or converted directories
    const { getFileExtension } = require('../utils/fileUtils');
    const fs = require('fs').promises;
    const path = require('path');
    
    // Try to find the file in uploads directory first
    let filePath = path.join(__dirname, '../uploads', fileId);
    
    // If not found, try with common extensions
    if (!filePath.includes('.')) {
      const extensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv'];
      for (const ext of extensions) {
        const testPath = filePath + ext;
        try {
          await fs.access(testPath);
          filePath = testPath;
          break;
        } catch (error) {
          // File not found with this extension, continue to next
        }
      }
    }
    
    // If still not found, check converted directory
    if (!filePath.includes('.')) {
      const convertedPath = path.join(__dirname, '../converted', fileId);
      try {
        await fs.access(convertedPath);
        filePath = convertedPath;
      } catch (error) {
        // File not found in converted directory either
      }
    }
    
    // If still not found, return error
    if (!filePath.includes('.')) {
      console.warn(`File not found for ID: ${fileId}`);
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Get metadata using ffmpegService
    const { getVideoMetadata } = require('../services/ffmpegService');
    const metadata = await getVideoMetadata(filePath);
    
    // Return metadata
    res.status(200).json({
      success: true,
      metadata: metadata
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file metadata'
    });
  }
};

module.exports = {
  convertFile,
  getFormats,
  downloadFile,
  getFileMetadata
};