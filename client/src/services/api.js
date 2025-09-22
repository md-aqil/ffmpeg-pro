import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

/**
 * Uploads a media file (video or audio) to the server
 * @param {File} file - The file to upload
 * @returns {Promise} - Promise that resolves with the upload response
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Gets the supported formats from the server
 * @returns {Promise} - Promise that resolves with the formats response
 */
export const getSupportedFormats = async () => {
  try {
    const response = await apiClient.get('/formats');
    return response.data;
  } catch (error) {
    console.error('Error fetching formats:', error);
    throw error;
  }
};

/**
 * Converts a video file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} outputFormat - The desired output format
 * @param {string} quality - The quality setting (low, medium, high)
 * @param {string} width - The custom width for resizing (optional)
 * @param {string} height - The custom height for resizing (optional)
 * @param {string} manualBitrate - The custom bitrate in kbps (optional)
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const convertFile = async (fileId, fileName, outputFormat, quality, width, height, manualBitrate) => {
 try {
   const response = await apiClient.post('/convert', {
     fileId,
     fileName,
     outputFormat,
     quality,
     width,
     height,
     manualBitrate
   });
    
    return response.data;
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};

/**
 * Downloads a converted file
 * @param {string} filename - The name of the file to download
 * @returns {Promise} - Promise that resolves with the download response
 */
export const downloadFile = async (filename) => {
  try {
    const response = await apiClient.get(`/download/${filename}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Gets metadata for a video file
 * @param {string} fileId - The ID of the uploaded file
 * @returns {Promise} - Promise that resolves with the metadata response
 */
export const getFileMetadata = async (fileId) => {
  try {
    const response = await apiClient.get(`/metadata/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    throw error;
  }
};

/**
 * Gets the supported audio formats from the server
 * @returns {Promise} - Promise that resolves with the audio formats response
 */
export const getSupportedAudioFormats = async () => {
  try {
    const response = await apiClient.get('/audio/formats');
    return response.data;
  } catch (error) {
    console.error('Error fetching audio formats:', error);
    throw error;
  }
};

/**
 * Converts an audio file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} outputFormat - The desired output format
 * @param {string} quality - The quality setting (low, medium, high)
 * @param {string} bitrate - The custom bitrate (optional)
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const convertAudioFile = async (fileId, fileName, outputFormat, quality, bitrate) => {
  try {
    const response = await apiClient.post('/audio/convert', {
      fileId,
      fileName,
      outputFormat,
      quality,
      bitrate
    });
    
    return response.data;
  } catch (error) {
    console.error('Error converting audio file:', error);
    throw error;
  }
};

/**
 * Extracts audio from a video file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} outputFormat - The desired output format
 * @returns {Promise} - Promise that resolves with the extraction response
 */
export const extractAudioFromVideo = async (fileId, fileName, outputFormat) => {
  try {
    const response = await apiClient.post('/audio/extract', {
      fileId,
      fileName,
      outputFormat
    });
    
    return response.data;
  } catch (error) {
    console.error('Error extracting audio from video:', error);
    throw error;
  }
};

/**
 * Converts an image file to a different format
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} targetFormat - The desired output format
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const convertImageFile = async (fileId, fileName, targetFormat) => {
  try {
    const response = await apiClient.post('/image/convert', {
      fileId,
      fileName,
      targetFormat
    });
    
    return response.data;
  } catch (error) {
    console.error('Error converting image file:', error);
    throw error;
  }
};

/**
 * Trims an audio file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {number} startTime - The start time in seconds
 * @param {number} duration - The duration in seconds
 * @returns {Promise} - Promise that resolves with the trimming response
 */
export const trimAudioFile = async (fileId, fileName, startTime, duration) => {
  try {
    const response = await apiClient.post('/audio/trim', {
      fileId,
      fileName,
      startTime,
      duration
    });
    
    return response.data;
  } catch (error) {
    console.error('Error trimming audio file:', error);
    throw error;
  }
};

/**
 * Mixes multiple audio files
 * @param {Array<string>} fileIds - Array of file IDs to mix
 * @param {Array<string>} fileNames - Array of original file names
 * @param {string} outputFormat - The desired output format
 * @returns {Promise} - Promise that resolves with the mixing response
 */
export const mixAudioFiles = async (fileIds, fileNames, outputFormat) => {
  try {
    const response = await apiClient.post('/audio/mix', {
      fileIds,
      fileNames,
      outputFormat
    });
    
    return response.data;
  } catch (error) {
    console.error('Error mixing audio files:', error);
    throw error;
  }
};

/**
 * Applies audio effects (volume control, fade in/out)
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {Object} effects - Object containing effect parameters
 * @returns {Promise} - Promise that resolves with the effects response
 */
export const applyAudioEffects = async (fileId, fileName, effects) => {
  try {
    const response = await apiClient.post('/audio/effects', {
      fileId,
      fileName,
      ...effects
    });
    
    return response.data;
  } catch (error) {
    console.error('Error applying audio effects:', error);
    throw error;
  }
};

/**
 * Resizes an image file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} width - The desired width
 * @param {string} height - The desired height
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const resizeImage = async (fileId, fileName, width, height) => {
  try {
    const response = await apiClient.post('/image/resize', {
      fileId,
      fileName,
      width,
      height
    });
    
    return response.data;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

/**
 * Crops an image file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} x - The starting x coordinate
 * @param {string} y - The starting y coordinate
 * @param {string} width - The desired width
 * @param {string} height - The desired height
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const cropImage = async (fileId, fileName, x, y, width, height) => {
  try {
    const response = await apiClient.post('/image/crop', {
      fileId,
      fileName,
      x,
      y,
      width,
      height
    });
    
    return response.data;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
};

  /**
 * Applies an effect to an image file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} effect - The effect to apply
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const applyEffects = async (fileId, fileName, effect) => {
  try {
    const response = await apiClient.post('/image/effects', {
      fileId,
      fileName,
      effect
    });
    
    return response.data;
  } catch (error) {
    console.error('Error applying effects:', error);
    throw error;
  }
};

   /**
 * Extracts frames from a video file
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} frameRate - The frame rate to extract
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const extractFrames = async (fileId, fileName, frameRate) => {
  try {
    const response = await apiClient.post('/image/extractFrames', {
      fileId,
      fileName,
      frameRate
    });
    
    return response.data;
  } catch (error) {
    console.error('Error extracting frames:', error);
    throw error;
  }
};

   /**
 * Creates a video from images
 * @param {string} imageDir - The directory containing the images
 * @param {string} frameRate - The frame rate to create the video
 * @returns {Promise} - Promise that resolves with the conversion response
 */
export const createVideoFromImages = async (imageDir, frameRate) => {
  try {
    const response = await apiClient.post('/image/createVideoFromImages', {
      imageDir,
      frameRate
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating video from images:', error);
    throw error;
  }
};

/**
 * Optimizes an image with quality and compression settings
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} quality - The quality level (1-100)
 * @param {string} compressionType - The compression type (lossy/lossless)
 * @returns {Promise} - Promise that resolves with the optimization response
 */
export const optimizeImage = async (fileId, fileName, quality, compressionType) => {
  try {
    const response = await apiClient.post('/image/optimize', {
      fileId,
      fileName,
      quality,
      compressionType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

/**
 * Gets metadata for an image file
 * @param {string} filename - The name of the file
 * @returns {Promise} - Promise that resolves with the metadata response
 */
export const getImageMetadata = async (filename) => {
  try {
    const response = await apiClient.get(`/image/metadata/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    throw error;
  }
};

/**
 * Adds a watermark to an image
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {string} watermarkType - The type of watermark (text/image)
 * @param {string} watermarkData - The watermark data (text content or image path)
 * @param {string} position - The position of the watermark (top-left, top-right, bottom-left, bottom-right, center)
 * @param {number} opacity - The opacity of the watermark (0-100)
 * @returns {Promise} - Promise that resolves with the watermark response
 */
export const watermarkImage = async (fileId, fileName, watermarkType, watermarkData, position, opacity) => {
  try {
    const response = await apiClient.post('/image/watermark', {
      fileId,
      fileName,
      watermarkType,
      watermarkData,
      position,
      opacity
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding watermark to image:', error);
    throw error;
  }
};

/**
 * Processes images in batch
 * @param {Array} files - Array of file objects to process
 * @param {string} operation - The operation to perform (convert, resize, etc.)
 * @param {Object} settings - The settings for the operation
 * @returns {Promise} - Promise that resolves with the batch processing response
 */
export const batchProcessImages = async (files, operation, settings) => {
  try {
    const response = await apiClient.post('/image/batch', {
      files,
      operation,
      settings
    });
    
    return response.data;
  } catch (error) {
    console.error('Error batch processing images:', error);
    throw error;
  }
};

/**
 * Applies advanced image effects with parameters
 * @param {string} fileId - The ID of the uploaded file
 * @param {string} fileName - The original name of the uploaded file
 * @param {Object} effects - Object containing effect parameters
 * @returns {Promise} - Promise that resolves with the effects response
 */
export const applyAdvancedImageEffects = async (fileId, fileName, effects) => {
  try {
    const response = await apiClient.post('/image/advancedEffects', {
      fileId,
      fileName,
      effects
    });
    
    return response.data;
  } catch (error) {
    console.error('Error applying advanced image effects:', error);
    throw error;
  }
};

export default apiClient;
