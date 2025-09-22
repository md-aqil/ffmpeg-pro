// server/controllers/imageController.js
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Set the path to FFmpeg executable
const ffmpegPath = path.join(__dirname, '../../ffmpeg-bin/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe');
ffmpeg.setFfmpegPath(ffmpegPath);

const convertImage = async (req, res) => {
  try {
    const { fileId, fileName, targetFormat } = req.body;

    // Validate input
    if (!fileId || !targetFormat) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId and targetFormat' });
    }

    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID format' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    try {
      await fs.promises.access(inputFilePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'Input file not found' });
    }

    // Generate output filename
    const outputFilename = `${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

    console.log(`Converting file ${fileId} to ${targetFormat}`);

    // Use fluent-ffmpeg directly
    await new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
          console.log(`Image converted successfully to ${targetFormat}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Conversion failed:', err);
          reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error('Error during image conversion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const resizeImage = async (req, res) => {
    try {
        const { fileId, fileName, width, height } = req.body;

        // Validate input
        if (!fileId || (!width && !height)) {
            return res.status(400).json({ success: false, error: 'Missing required fields: fileId and at least one of width or height' });
        }

        // Validate file ID format
        if (!/^[a-f0-9-]+$/i.test(fileId)) {
            return res.status(400).json({ success: false, error: 'Invalid file ID format' });
        }

        // Check if input file exists
        const fileExtension = path.extname(fileName || fileId);
        const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
        try {
            await fs.promises.access(inputFilePath);
        } catch (error) {
            return res.status(404).json({ success: false, error: 'Input file not found' });
        }

        // Generate output filename
        const outputFilename = `${uuidv4()}${fileExtension}`;
        const outputPath = path.join(__dirname, '../converted', outputFilename);

        console.log(`Resizing file ${fileId} to ${width}x${height}`);

        // Use fluent-ffmpeg directly
        await new Promise((resolve, reject) => {
            ffmpeg(inputFilePath)
                .output(outputPath)
                .videoFilters({
                    filter: 'scale',
                    options: `${width || -1}:${height || -1}`  // Use -1 to maintain aspect ratio if one dimension is not specified
                })
                .on('start', (commandLine) => {
                    console.log('FFmpeg process started:', commandLine);
                })
                .on('end', () => {
                    console.log(`Image resized successfully to ${width}x${height}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Resizing failed:', err);
                    reject(err);
                })
                .run();
        });

        res.json({ success: true, data: { filename: outputFilename } });

    } catch (error) {
        console.error('Error during image resizing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const cropImage = async (req, res) => {
  try {
      const { fileId, fileName, x, y, width, height } = req.body;

      // Validate input
      if (!fileId || !width || !height || !x || !y) {
          return res.status(400).json({ success: false, error: 'Missing required fields: fileId, x, y, width, and height' });
      }

      // Validate file ID format
      if (!/^[a-f0-9-]+$/i.test(fileId)) {
          return res.status(400).json({ success: false, error: 'Invalid file ID format' });
      }

      // Check if input file exists
      const fileExtension = path.extname(fileName || fileId);
      const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
      try {
          await fs.promises.access(inputFilePath);
      } catch (error) {
          return res.status(404).json({ success: false, error: 'Input file not found' });
      }

      // Generate output filename
      const outputFilename = `${uuidv4()}${fileExtension}`;
      const outputPath = path.join(__dirname, '../converted', outputFilename);

      console.log(`Cropping file ${fileId} to x:${x}, y:${y}, width:${width}, height:${height}`);

      // Use fluent-ffmpeg directly
      await new Promise((resolve, reject) => {
          ffmpeg(inputFilePath)
              .output(outputPath)
              .videoFilters({
                  filter: 'crop',
                  options: `${width}:${height}:${x}:${y}`
              })
              .on('start', (commandLine) => {
                  console.log('FFmpeg process started:', commandLine);
              })
              .on('end', () => {
                  console.log(`Image cropped successfully to x:${x}, y:${y}, width:${width}, height:${height}`);
                  resolve();
              })
              .on('error', (err) => {
                  console.error('Cropping failed:', err);
                  reject(err);
              })
              .run();
      });

      res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
      console.error('Error during image cropping:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};

const applyEffects = async (req, res) => {
    try {
        const { fileId, fileName, effect } = req.body;

        // Validate input
        if (!fileId || !effect) {
            return res.status(400).json({ success: false, error: 'Missing required fields: fileId and effect' });
        }

        // Validate file ID format
        if (!/^[a-f0-9-]+$/i.test(fileId)) {
            return res.status(400).json({ success: false, error: 'Invalid file ID format' });
        }

        // Check if input file exists
        const fileExtension = path.extname(fileName || fileId);
        const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
        try {
            await fs.promises.access(inputFilePath);
        } catch (error) {
            return res.status(404).json({ success: false, error: 'Input file not found' });
        }

        // Generate output filename
        const outputFilename = `${uuidv4()}${fileExtension}`;
        const outputPath = path.join(__dirname, '../converted', outputFilename);

        console.log(`Applying effect ${effect} to file ${fileId}`);

        // Use fluent-ffmpeg directly
        await new Promise((resolve, reject) => {
            let ffmpegCommand = ffmpeg(inputFilePath).output(outputPath);
            
            switch (effect) {
                case 'blur':
                    ffmpegCommand = ffmpegCommand.videoFilters('boxblur=5');
                    break;
                case 'sharpen':
                    ffmpegCommand = ffmpegCommand.videoFilters('unsharp=5:5:1.0');
                    break;
                case 'brightness':
                    ffmpegCommand = ffmpegCommand.videoFilters('eq=brightness=0.2');
                    break;
                case 'contrast':
                    ffmpegCommand = ffmpegCommand.videoFilters('eq=contrast=1.2');
                    break;
                default:
                    reject(new Error('Invalid effect'));
                    return;
            }
            
            ffmpegCommand
                .on('start', (commandLine) => {
                    console.log('FFmpeg process started:', commandLine);
                })
                .on('end', () => {
                    console.log(`Effect ${effect} applied successfully`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Effect application failed:', err);
                    reject(err);
                })
                .run();
        });

        res.json({ success: true, data: { filename: outputFilename } });

    } catch (error) {
        console.error('Error during image effects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const extractFrames = async (req, res) => {
  try {
    const { fileId, fileName, frameRate } = req.body;

    // Validate input
    if (!fileId || !frameRate) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId and frameRate' });
    }

    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID format' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    try {
      await fs.promises.access(inputFilePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'Input file not found' });
    }

    const outputDir = path.join(__dirname, '../converted', `${uuidv4()}_frames`);
    const outputPath = path.join(outputDir, 'frame_%04d.png');

    console.log(`Extracting frames from file ${fileId} at frame rate ${frameRate}`);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Use fluent-ffmpeg directly
    await new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
        .output(outputPath)
        .fps(frameRate)
        .on('start', (commandLine) => {
            console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
            console.log(`Frames extracted successfully to ${outputDir}`);
            resolve();
        })
        .on('error', (err) => {
            console.error('Frame extraction failed:', err);
            reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { directory: outputDir } });

  } catch (error) {
    console.error('Error during frame extraction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createVideoFromImages = async (req, res) => {
  try {
    const { imageDir, frameRate } = req.body;

    if (!imageDir) {
      return res.status(400).json({ success: false, error: 'No image directory provided.' });
    }

    const outputFilename = `${uuidv4()}.mp4`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);
    const inputPath = path.join(imageDir, 'frame_%04d.png');

    console.log(`Creating video from images in ${imageDir} at frame rate ${frameRate}`);

    // Use fluent-ffmpeg directly
    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
        .inputOptions([`-framerate ${frameRate}`])
        .outputOptions(['-c:v libx264', '-pix_fmt yuv420p'])
        .output(outputPath)
        .on('start', (commandLine) => {
            console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
            console.log(`Video created successfully from images in ${imageDir}`);
            resolve();
        })
        .on('error', (err) => {
            console.error('Video creation failed:', err);
            reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error('Error during video creation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const optimizeImage = async (req, res) => {
  try {
    const { fileId, fileName, quality, compressionType } = req.body;

    // Validate input
    if (!fileId || !quality || !compressionType) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId, quality, and compressionType' });
    }

    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID format' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    try {
      await fs.promises.access(inputFilePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'Input file not found' });
    }

    // Generate output filename
    const outputFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

    console.log(`Optimizing file ${fileId} with quality ${quality} and compression type ${compressionType}`);

    // Use fluent-ffmpeg directly with quality and compression options
    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputFilePath).output(outputPath);
      
      // Set quality
      ffmpegCommand = ffmpegCommand.outputOptions([`-q:v ${Math.round((100 - quality) / 10)}`]);
      
      // Add compression options based on type
      if (compressionType === 'lossless') {
        // For PNG, use lossless compression
        if (fileExtension.toLowerCase() === '.png') {
          ffmpegCommand = ffmpegCommand.outputOptions(['-compression_level 9']);
        }
      } else {
        // Lossy compression (default)
        ffmpegCommand = ffmpegCommand.outputOptions(['-q:v', Math.round((100 - quality) / 10)]);
      }
      
      ffmpegCommand
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
          console.log(`Image optimized successfully with quality ${quality} and compression type ${compressionType}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Optimization failed:', err);
          reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error('Error during image optimization:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const batchImages = async (req, res) => {
  try {
    const { files, operation, settings } = req.body;

    if (!files || !operation) {
      return res.status(400).json({ success: false, error: 'Missing required fields: files and operation' });
    }

    // Process multiple images with the same operation
    const processedFiles = [];
    const failedFiles = [];

    for (const file of files) {
      try {
        // Implement the logic for each operation (convert, resize, crop, effects)
        // Example:
        // if (operation === 'convert') {
        //   await convertImage(file, settings);
        // }
        processedFiles.push(file);
      } catch (error) {
        failedFiles.push(file);
      }
    }

    res.json({ success: true, data: { processedFiles, failedFiles, totalProcessed: files.length } });

  } catch (error) {
    console.error('Error during batch image processing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getImageMetadata = async (req, res) => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return res.status(400).json({ success: false, error: 'Missing required field: filename' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);

    // Extract EXIF data, dimensions, color profile, creation date
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Error getting metadata:', err);
        return res.status(500).json({ success: false, error: 'Error getting metadata' });
      }

      const { width, height } = metadata.streams[0];
      const fileSize = fs.statSync(filePath).size;
      const format = metadata.format.format_name;
      const colorSpace = metadata.streams[0].color_space;
      //const exifData = metadata.format.tags; // Extract EXIF data

      res.json({
        success: true,
        data: {
          dimensions: { width, height },
          fileSize,
          format,
          colorSpace,
          //exifData,
        },
      });
    });
  } catch (error) {
    console.error('Error during image metadata extraction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const watermarkImage = async (req, res) => {
  try {
    const { fileId, fileName, watermarkType, watermarkData, position, opacity } = req.body;

    // Validate input
    if (!fileId || !watermarkType || !watermarkData || !position || !opacity) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId, watermarkType, watermarkData, position, and opacity' });
    }

    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID format' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    try {
      await fs.promises.access(inputFilePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'Input file not found' });
    }

    // Generate output filename
    const outputFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

    console.log(`Adding watermark to file ${fileId} with type ${watermarkType}`);

    // Use fluent-ffmpeg directly
    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputFilePath).output(outputPath);
      
      // For text watermark
      if (watermarkType === 'text') {
        // Position mapping
        let positionFilter = '';
        switch (position) {
          case 'top-left':
            positionFilter = '10:10';
            break;
          case 'top-right':
            positionFilter = 'main_w-overlay_w-10:10';
            break;
          case 'bottom-left':
            positionFilter = '10:main_h-overlay_h-10';
            break;
          case 'bottom-right':
            positionFilter = 'main_w-overlay_w-10:main_h-overlay_h-10';
            break;
          case 'center':
            positionFilter = '(main_w-overlay_w)/2:(main_h-overlay_h)/2';
            break;
          default:
            positionFilter = '10:10';
        }
        
        // Apply text watermark with position and opacity
        ffmpegCommand = ffmpegCommand
          .videoFilters(`drawtext=text='${watermarkData}':x=${positionFilter.split(':')[0]}:y=${positionFilter.split(':')[1]}:fontsize=24:fontcolor=white@${opacity/100}:box=1:boxcolor=black@${opacity/100 * 0.5}`);
      }
      
      ffmpegCommand
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
          console.log(`Watermark added successfully with type ${watermarkType}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Watermark addition failed:', err);
          reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error('Error during image watermarking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Advanced image effects with parameters
const applyAdvancedImageEffects = async (req, res) => {
  try {
    const { fileId, fileName, effects } = req.body;

    // Validate input
    if (!fileId || !effects) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId and effects' });
    }

    // Validate file ID format
    if (!/^[a-f0-9-]+$/i.test(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID format' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    try {
      await fs.promises.access(inputFilePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'Input file not found' });
    }

    // Generate output filename
    const outputFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

    console.log(`Applying advanced effects to file ${fileId}`, effects);

    // Use fluent-ffmpeg with advanced effects
    await new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg(inputFilePath).output(outputPath);
      
      // Build filter chain
      const filters = [];
      
      // Brightness effect
      if (effects.brightness !== undefined) {
        filters.push(`eq=brightness=${effects.brightness}`);
      }
      
      // Contrast effect
      if (effects.contrast !== undefined) {
        filters.push(`eq=contrast=${effects.contrast + 1}`); // FFmpeg contrast is 1-based
      }
      
      // Saturation effect
      if (effects.saturation !== undefined) {
        filters.push(`hue=s=${effects.saturation}`);
      }
      
      // Apply all filters
      if (filters.length > 0) {
        ffmpegCommand = ffmpegCommand.videoFilters(filters.join(','));
      }
      
      ffmpegCommand
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
          console.log(`Advanced effects applied successfully`);
          resolve();
        })
        .on('error', (err) => {
          console.error('Advanced effects application failed:', err);
          reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error('Error during advanced image effects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
    convertImage,
    resizeImage,
    cropImage,
    applyEffects,
    extractFrames,
    createVideoFromImages,
    optimizeImage,
    batchImages,
    getImageMetadata,
    watermarkImage,
    applyAdvancedImageEffects
};