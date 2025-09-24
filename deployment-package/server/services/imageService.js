// server/services/imageService.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Set the path to FFmpeg executable
const ffmpegPath = path.join(__dirname, '../../ffmpeg-bin/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe');
ffmpeg.setFfmpegPath(ffmpegPath);

const convertImage = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
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
};

const resizeImage = (inputPath, outputPath, width, height) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoFilters({
                filter: 'scale',
                options: `${width}:${height}`
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
};

const cropImage = (inputPath, outputPath, x, y, width, height) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
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
};

const applyEffects = (inputPath, outputPath, effect) => {
    return new Promise((resolve, reject) => {
        let ffmpegCommand = ffmpeg(inputPath).output(outputPath);
        
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
};

const extractFrames = (inputPath, outputDir, frameRate) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'frame_%04d.png');

    ffmpeg(inputPath)
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
};

const createVideoFromImages = (imageDir, outputPath, frameRate) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(imageDir, 'frame_%04d.png');

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
};

module.exports = {
    convertImage,
    resizeImage,
    cropImage,
    applyEffects,
    extractFrames,
    createVideoFromImages
};