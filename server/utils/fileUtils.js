const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Generates a unique file ID
 * @returns {string} Unique file ID
 */
const generateFileId = () => {
  const id = uuidv4();
  console.log(`Generated file ID: ${id}`);
  return id;
};

/**
 * Gets file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  console.log(`Extracted extension '${extension}' from filename '${filename}'`);
  return extension;
};

/**
 * Gets filename without extension
 * @param {string} filename - Name of the file
 * @returns {string} Filename without extension
 */
const getFileNameWithoutExtension = (filename) => {
  const extension = getFileExtension(filename);
  const nameWithoutExtension = path.basename(filename, extension);
  console.log(`Extracted filename without extension '${nameWithoutExtension}' from '${filename}'`);
  return nameWithoutExtension;
};

/**
 * Validates if file format is supported
 * @param {string} filename - Name of the file
 * @param {Array} supportedFormats - Array of supported formats
 * @returns {boolean} True if format is supported
 */
const isSupportedFormat = (filename, supportedFormats, mimeType = '') => {
  // Get extension and clean it
  const extension = getFileExtension(filename).toLowerCase().replace('.', '');
  console.log(`Checking if format '${extension}' is supported, MIME type: ${mimeType}`);

  // Check if extension is valid
  if (!extension || extension.length === 0) {
    console.warn(`Invalid extension for filename: ${filename}`);
    return false;
  }
  
  // Check if extension is in supported formats
  const isExtensionSupported = supportedFormats.includes(extension);
  console.log(`Format '${extension}' is ${isExtensionSupported ? 'supported' : 'not supported'}`);

  // Check if MIME type is valid (if provided)
  if (mimeType) {
    const isValidMimeType = mimeType.startsWith('video/') || mimeType.startsWith('audio/') || mimeType.startsWith('image/');
    console.log(`MIME type '${mimeType}' is ${isValidMimeType ? 'valid' : 'invalid'}`);
    return isExtensionSupported && isValidMimeType;
  }

  return isExtensionSupported;
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  console.log(`Formatting file size: ${bytes} bytes`);
  
  if (bytes === 0) {
    console.log('File size is 0 bytes');
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  
  console.log(`Formatted file size: ${formattedSize}`);
  return formattedSize;
};

module.exports = {
  generateFileId,
  getFileExtension,
  getFileNameWithoutExtension,
  isSupportedFormat,
  formatFileSize
};