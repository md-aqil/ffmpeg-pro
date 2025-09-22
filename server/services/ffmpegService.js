const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Set the path to FFmpeg executable
const ffmpegPath = path.join(__dirname, '../../ffmpeg-bin/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe');
ffmpeg.setFfmpegPath(ffmpegPath);
// Define video quality presets based on the rules
const VIDEO_PRESETS = {
  'low': { width: 640, height: 360, bitrate: '500k' },
  'medium': { width: 1280, height: 720, bitrate: '1000k' },
  'high': { width: 1920, height: 1080, bitrate: '2000k' },
  'ultra': { width: 3840, height: 2160, bitrate: '5000k' }
};

/**
 * Convert video file to specified format
 * @param {string} inputFile - Path to input file
 * @param {string} outputFormat - Desired output format
 * @param {string} quality - Quality setting (low, medium, high, ultra)
 * @param {number} width - Custom width for resizing (optional)
 * @param {number} height - Custom height for resizing (optional)
 * @param {number} manualBitrate - Custom bitrate in kbps (optional)
 * @returns {Promise<string>} Path to converted file
 */
const convertVideo = async (inputFile, outputFormat, quality = 'medium', width = null, height = null, manualBitrate = null) => {
  try {
    console.log(`Starting video conversion - input: ${inputFile}, output format: ${outputFormat}, quality: ${quality}, width: ${width}, height: ${height}, manualBitrate: ${manualBitrate}`);
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Get video metadata to calculate aspect ratio
    let videoWidth, videoHeight;
    // Check if width or height are actually provided as valid numbers
    const hasValidDimensions = (width && !isNaN(parseInt(width))) || (height && !isNaN(parseInt(height)));
    if (hasValidDimensions) {
      try {
        const metadata = await getVideoMetadata(inputFile);
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (videoStream) {
          videoWidth = videoStream.width;
          videoHeight = videoStream.height;
          console.log(`Original video dimensions: ${videoWidth}x${videoHeight}`);
        }
      } catch (metadataError) {
        console.warn('Could not get video metadata, using default dimensions:', metadataError);
        videoWidth = 1920;
        videoHeight = 1080;
      }
    }
    
    let videoParams = {};
    let originalBitrate = null;

    try {
      const metadata = await getVideoMetadata(inputFile);
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      if (videoStream && metadata.format && metadata.format.bit_rate) {
        originalBitrate = metadata.format.bit_rate;
        console.log(`Original bitrate: ${originalBitrate}`);
      } else {
        console.warn('Could not get original bitrate from metadata, using default bitrate.');
      }
    } catch (metadataError) {
      console.warn('Could not get video metadata, using default bitrate:', metadataError);
    }

    // If custom width/height provided, use those instead of quality presets
    if (hasValidDimensions) {
      // Convert width and height to integers
      let widthInt = width ? parseInt(width) : null;
      let heightInt = height ? parseInt(height) : null;
      
      // Ensure both dimensions are provided, calculate missing one if needed
      if (!widthInt && heightInt && videoWidth && videoHeight) {
        // Calculate width maintaining aspect ratio
        widthInt = Math.round((heightInt * videoWidth) / videoHeight);
      }
      if (!heightInt && widthInt && videoWidth && videoHeight) {
        // Calculate height maintaining aspect ratio
        heightInt = Math.round((widthInt * videoHeight) / videoWidth);
      }
      
      // Ensure we have both dimensions
      if (!widthInt) widthInt = 1920;
      if (!heightInt) heightInt = 1080;
      
      videoParams = { videoBitrate: '1000k', size: `${widthInt}:${heightInt}` };
    } else {
      // Use quality presets
      const preset = VIDEO_PRESETS[quality] || VIDEO_PRESETS.medium;
      videoParams = {
        videoBitrate: preset.bitrate,
        size: `${preset.width}:${preset.height}`
      };
    }
    
    console.log(`Video parameters set - bitrate: ${videoParams.videoBitrate}, size: ${videoParams.size}`);
    
    // Create FFmpeg command with high-quality settings
    const bitrateToUse = manualBitrate ? `${manualBitrate}k` : (originalBitrate ? `${Math.round(originalBitrate / 1000)}k` : '5000k');
    console.log(`Using bitrate: ${bitrateToUse}`);

    // Determine encoding preset based on quality
    let encodingPreset = 'medium';
    if (quality === 'low') {
      encodingPreset = 'fast';
    } else if (quality === 'high' || quality === 'ultra') {
      encodingPreset = 'slow';
    }
    
    // Determine CRF value based on quality
    let crfValue = 23; // Default CRF value
    switch (quality) {
      case 'low':
        crfValue = 28; // Lower quality, smaller file
        break;
      case 'medium':
        crfValue = 23; // Medium quality
        break;
      case 'high':
        crfValue = 18; // High quality
        break;
      case 'ultra':
        crfValue = 15; // Ultra high quality
        break;
    }

    // Check if two-pass encoding is requested for maximum quality
    const useTwoPass = quality === 'ultra' && !manualBitrate;
    
    if (useTwoPass) {
      // Two-pass encoding for maximum quality
      return new Promise(async (resolve, reject) => {
        console.log('Starting two-pass encoding for maximum quality');
        
        // Create temporary file for first pass
        const tempFile = path.join(__dirname, '../converted', `temp_${uuidv4()}.mp4`);
        
        try {
          // First pass
          await new Promise((firstPassResolve, firstPassReject) => {
            let firstPassCommand = ffmpeg(inputFile);
            
            // Apply video filters for high-quality resizing with Lanczos algorithm
            if (videoParams.size) {
              firstPassCommand.videoFilters([
                {
                  filter: 'scale',
                  options: videoParams.size + ':flags=lanczos'
                }
              ]);
            }
            
            firstPassCommand
              .outputOptions([
                `-preset ${encodingPreset}`,
                `-b:v ${bitrateToUse}`,
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-pass 1',
                '-f mp4',
                '-y' // Overwrite output files without asking
              ])
              .on('start', (commandLine) => {
                console.log('First pass started:', commandLine);
              })
              .on('progress', (progress) => {
                console.log('First pass progress:', progress.percent + '% done');
              })
              .on('end', () => {
                console.log('First pass completed successfully');
                firstPassResolve();
              })
              .on('error', (err) => {
                console.error('First pass error:', err);
                firstPassReject(new Error('First pass failed: ' + err.message));
              })
              .save(tempFile); // Save to temporary file
          });
          
          // Second pass
          let secondPassCommand = ffmpeg(inputFile);
          
          // Apply video filters for high-quality resizing with Lanczos algorithm
          if (videoParams.size) {
            secondPassCommand.videoFilters([
              {
                filter: 'scale',
                options: videoParams.size + ':flags=lanczos'
              }
            ]);
          }
          
          secondPassCommand
            .outputOptions([
              `-preset ${encodingPreset}`,
              `-b:v ${bitrateToUse}`,
              '-c:v libx264',
              '-pix_fmt yuv420p',
              '-pass 2'
            ])
            .toFormat(mapFormatToFFmpeg(outputFormat))
            .on('start', (commandLine) => {
              console.log('Second pass started:', commandLine);
            })
            .on('progress', (progress) => {
              console.log('Second pass progress:', progress.percent + '% done');
            })
            .on('end', async () => {
              console.log('Second pass completed successfully');
              // Clean up temporary file
              try {
                await fs.unlink(tempFile);
                console.log('Temporary file cleaned up');
              } catch (cleanupError) {
                console.warn('Failed to clean up temporary file:', cleanupError);
              }
              resolve(outputPath);
            })
            .on('error', async (err) => {
              console.error('Second pass error:', err);
              // Clean up temporary file even on error
              try {
                await fs.unlink(tempFile);
                console.log('Temporary file cleaned up after error');
              } catch (cleanupError) {
                console.warn('Failed to clean up temporary file after error:', cleanupError);
              }
              reject(new Error('Video conversion failed: ' + err.message));
            })
            .save(outputPath);
            
        } catch (error) {
          // Clean up temporary file on error
          try {
            await fs.unlink(tempFile);
            console.log('Temporary file cleaned up after error');
          } catch (cleanupError) {
            console.warn('Failed to clean up temporary file after error:', cleanupError);
          }
          reject(error);
        }
      });
    } else {
      // Single pass encoding
      return new Promise((resolve, reject) => {
        console.log('Attempting to execute FFmpeg command');
        
        // Build FFmpeg command with high-quality settings
        let command = ffmpeg(inputFile);
        
        // Apply video filters for high-quality resizing with Lanczos algorithm
        if (videoParams.size) {
          command.videoFilters([
            {
              filter: 'scale',
              options: videoParams.size + ':flags=lanczos'
            }
          ]);
        }
        
        // Set output options for high-quality encoding
        command
          .outputOptions([
            `-preset ${encodingPreset}`,
            `-crf ${crfValue}`,
            '-b:v ' + bitrateToUse,
            '-c:v libx264', // Use H.264 codec for compatibility
            '-pix_fmt yuv420p' // Ensure pixel format compatibility
          ])
          .toFormat(mapFormatToFFmpeg(outputFormat))
          .on('start', (commandLine) => {
            console.log('FFmpeg process started:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Processing:', progress.percent + '% done');
            // onProgress callback is optional
            if (typeof onProgress === 'function') {
              onProgress(progress);
            }
          })
          .on('end', () => {
            console.log('FFmpeg processing finished successfully');
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(new Error('Video conversion failed: ' + err.message));
          })
          .save(outputPath);
      });
    }
  } catch (error) {
    console.error('Error in convertVideo function:', error);
    throw error;
  }
};

/**
 * Get metadata for a video file
 * @param {string} filePath - Path to video file
 * @returns {Promise<Object>} Video metadata
 */
const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Getting metadata for file: ${filePath}`);
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`Error getting metadata for file ${filePath}:`, err);
        reject(err);
      } else {
        console.log(`Metadata retrieved successfully for file: ${filePath}`);
        resolve(metadata);
      }
    });
  });
};

/**
 * Get supported input formats
 * @returns {Array} Supported input formats
 */
const getSupportedInputFormats = () => {
  return ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', 'm4v'];
};

/**
 * Get supported output formats
 * @returns {Array} Supported output formats
 */
const getSupportedOutputFormats = () => {
  return ['mp4', 'avi', 'mov', 'webm', 'mkv'];
};

/**
 * Map format names to FFmpeg format names
 * @param {string} format - Format name
 * @returns {string} FFmpeg format name
 */
const mapFormatToFFmpeg = (format) => {
  const formatMap = {
    'mkv': 'matroska'
  };
  return formatMap[format] || format;
};

module.exports = {
  convertVideo,
  getVideoMetadata,
  getSupportedInputFormats,
  getSupportedOutputFormats,
  mapFormatToFFmpeg
};