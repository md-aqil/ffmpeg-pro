const fs = require('fs').promises;
const path = require('path');
const { readdir, stat } = require('fs').promises;

/**
 * Clean up old files from a directory
 * @param {string} directory - Directory path to clean
 * @param {number} maxAge - Maximum age of files in milliseconds
 */
const cleanupDirectory = async (directory, maxAge) => {
  try {
    console.log(`Cleaning directory: ${directory}`);
    const files = await readdir(directory);
    console.log(`Found ${files.length} files in directory: ${directory}`);
    const now = Date.now();
    
    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(directory, file);
      try {
        const fileStat = await stat(filePath);
        const fileAge = now - fileStat.mtime.getTime();
        
        // Delete files older than maxAge
        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${filePath}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error accessing file ${filePath}:`, error);
      }
    }
    console.log(`Cleanup completed for directory: ${directory}. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error(`Error cleaning directory ${directory}:`, error);
  }
};

/**
 * Clean up old files from uploads and converted directories
 * @param {number} maxAge - Maximum age of files in milliseconds (default: 1 hour)
 */
const cleanupOldFiles = async (maxAge = 3600000) => {
  try {
    console.log(`Starting cleanup of old files (max age: ${maxAge}ms)...`);
    
    // Clean uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    console.log(`Cleaning uploads directory: ${uploadsDir}`);
    await cleanupDirectory(uploadsDir, maxAge);
    
    // Clean converted directory
    const convertedDir = path.join(__dirname, '../converted');
    console.log(`Cleaning converted directory: ${convertedDir}`);
    await cleanupDirectory(convertedDir, maxAge);
    
    console.log('Cleanup completed successfully for both directories');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

/**
 * Start periodic cleanup
 * @param {number} interval - Cleanup interval in milliseconds (default: 1 hour)
 */
const startCleanupInterval = (interval = 3600000) => {
  console.log(`Starting cleanup service with interval: ${interval}ms`);
  
  // Run cleanup immediately
  console.log('Running initial cleanup...');
  cleanupOldFiles(interval);
  
  // Schedule periodic cleanup
  console.log('Scheduling periodic cleanup...');
  setInterval(() => {
    console.log('Running scheduled cleanup...');
    cleanupOldFiles(interval);
  }, interval);
  
  console.log(`Periodic cleanup scheduled every ${interval / 1000 / 60} minutes`);
};

module.exports = {
  cleanupOldFiles,
  startCleanupInterval
};