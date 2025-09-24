const { generateFileId, getFileExtension, formatFileSize } = require('../utils/fileUtils');

/**
 * Handle file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadFile = (req, res) => {
  try {
    console.log('File upload request received');
    
    // Check if file was uploaded
    if (!req.file) {
      console.warn('No file uploaded in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Generate file ID
    const fileId = req.file.filename.split('.')[0];
    
    // Get file information
    const fileInfo = {
      fileId: fileId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      size: req.file.size,
      formattedSize: formatFileSize(req.file.size),
      extension: getFileExtension(req.file.originalname),
      path: req.file.path,
      uploadDate: new Date()
    };
    
    console.log(`File uploaded successfully: ${fileInfo.originalName} (${fileInfo.formattedSize})`);
    
    // Return success response
    res.status(200).json({
      success: true,
      fileId: fileInfo.fileId,
      fileName: fileInfo.originalName,
      size: fileInfo.formattedSize,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
};

/**
 * Handle multiple file uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMultipleFiles = (req, res) => {
  try {
    console.log('Multiple file upload request received');
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      console.warn('No files uploaded in request');
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    console.log(`Processing ${req.files.length} files`);
    
    // Process each file
    const uploadedFiles = req.files.map(file => {
      const fileId = file.filename.split('.')[0];
      
      const fileInfo = {
        fileId: fileId,
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        extension: getFileExtension(file.originalname),
        path: file.path
      };
      
      console.log(`File processed: ${fileInfo.originalName} (${fileInfo.formattedSize})`);
      return fileInfo;
    });
    
    console.log(`Successfully uploaded ${uploadedFiles.length} files`);
    
    // Return success response
    res.status(200).json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles
};