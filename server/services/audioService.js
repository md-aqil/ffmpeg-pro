const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Set the path to FFmpeg executable
const ffmpegPath = path.join(__dirname, '../../ffmpeg-bin/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe');
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert audio file to specified format
 * @param {string} inputFile - Path to input file
 * @param {string} outputFormat - Desired output format
 * @param {string} quality - Quality setting (low, medium, high)
 * @param {string} bitrate - Custom bitrate (optional)
 * @returns {Promise<string>} Path to converted file
 */
const convertAudio = async (inputFile, outputFormat, quality = 'medium', bitrate = null) => {
  try {
    console.log(`Starting audio conversion - input: ${inputFile}, output format: ${outputFormat}, quality: ${quality}, bitrate: ${bitrate}`);
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Set quality parameters
    let audioParams = {};
    
    if (bitrate) {
      audioParams = { audioBitrate: bitrate };
    } else {
      switch (quality) {
        case 'low':
          audioParams = { audioBitrate: '64k' };
          break;
        case 'medium':
          audioParams = { audioBitrate: '128k' };
          break;
        case 'high':
          audioParams = { audioBitrate: '320k' };
          break;
        default:
          audioParams = { audioBitrate: '128k' };
      }
    }
    
    console.log(`Audio parameters set - bitrate: ${audioParams.audioBitrate}`);
    
    // Create FFmpeg command
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .outputOptions([
          '-acodec libmp3lame', // Use MP3 codec for MP3 files
          '-b:a ' + audioParams.audioBitrate,
          '-ar 44100', // Sample rate
          '-ac 2' // Stereo
        ])
        .toFormat(mapFormatToFFmpeg(outputFormat))
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Audio conversion failed: ' + err.message));
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in convertAudio function:', error);
    throw error;
  }
};

/**
 * Extract audio from video file
 * @param {string} inputFile - Path to input video file
 * @param {string} outputFormat - Desired output format for audio
 * @returns {Promise<string>} Path to extracted audio file
 */
const extractAudio = async (inputFile, outputFormat) => {
  try {
    console.log(`Starting audio extraction - input: ${inputFile}, output format: ${outputFormat}`);
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Create FFmpeg command
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .outputOptions([
          '-vn', // Disable video recording
          '-acodec libmp3lame', // Use MP3 codec for MP3 files
          '-ar 44100', // Sample rate
          '-ac 2' // Stereo
        ])
        .toFormat(mapFormatToFFmpeg(outputFormat))
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Audio extraction failed: ' + err.message));
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in extractAudio function:', error);
    throw error;
  }
};

/**
 * Trim audio file
 * @param {string} inputFile - Path to input file
 * @param {number} startTime - Start time in seconds
 * @param {number} duration - Duration in seconds
 * @returns {Promise<string>} Path to trimmed file
 */
const trimAudio = async (inputFile, startTime, duration) => {
  try {
    console.log(`Starting audio trimming - input: ${inputFile}, start: ${startTime}, duration: ${duration}`);
    
    // Get output format from input file
    const inputExt = path.extname(inputFile).substring(1);
    const outputFormat = inputExt;
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Create FFmpeg command
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .setStartTime(startTime)
        .setDuration(duration)
        .outputOptions([
          '-acodec copy' // Copy audio codec to preserve quality
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Audio trimming failed: ' + err.message));
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in trimAudio function:', error);
    throw error;
  }
};

/**
 * Mix multiple audio files
 * @param {Array<string>} inputFiles - Array of paths to input files
 * @param {string} outputFormat - Desired output format
 * @returns {Promise<string>} Path to mixed file
 */
const mixAudio = async (inputFiles, outputFormat) => {
  try {
    console.log(`Starting audio mixing - inputs: ${inputFiles.length}, output format: ${outputFormat}`);
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Create FFmpeg command with complex filter for mixing
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Add all input files
      inputFiles.forEach(file => {
        command.input(file);
      });
      
      // Create complex filter for mixing
      const filterString = `amix=inputs=${inputFiles.length}:duration=first`;
      
      command
        .complexFilter(filterString)
        .outputOptions([
          '-acodec libmp3lame',
          '-ar 44100',
          '-ac 2'
        ])
        .toFormat(mapFormatToFFmpeg(outputFormat))
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Audio mixing failed: ' + err.message));
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in mixAudio function:', error);
    throw error;
  }
};

/**
 * Apply audio effects (volume control, fade in/out)
 * @param {string} inputFile - Path to input file
 * @param {Object} effects - Object containing effect parameters
 * @returns {Promise<string>} Path to processed file
 */
const applyAudioEffects = async (inputFile, effects) => {
  try {
    console.log(`Starting audio effects application - input: ${inputFile}, effects:`, effects);
    
    // Get output format from input file
    const inputExt = path.extname(inputFile).substring(1);
    const outputFormat = inputExt;
    
    // Generate unique output filename
    const outputFileName = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFileName);
    
    console.log(`Output file will be saved to: ${outputPath}`);
    
    // Ensure converted directory exists
    await fs.mkdir(path.join(__dirname, '../converted'), { recursive: true });
    console.log('Converted directory ready');
    
    // Build filter string
    let filterString = '';
    const filters = [];
    
    // Volume control
    if (effects.volume !== undefined) {
      filters.push(`volume=${effects.volume}`);
    }
    
    // Fade in
    if (effects.fadeIn !== undefined) {
      filters.push(`afade=t=in:ss=0:d=${effects.fadeIn}`);
    }
    
    // Fade out
    if (effects.fadeOut !== undefined) {
      // For fade out, we need to know the duration of the audio
      // We'll add this after getting metadata
      filters.push(`afade=t=out:st=0:d=${effects.fadeOut}`);
    }
    
    filterString = filters.join(',');
    
    // Create FFmpeg command
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputFile);
      
      if (filterString) {
        command = command.audioFilter(filterString);
      }
      
      command
        .outputOptions([
          '-acodec libmp3lame',
          '-ar 4100',
          '-ac 2'
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Audio effects application failed: ' + err.message));
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in applyAudioEffects function:', error);
    throw error;
  }
};

/**
 * Get supported audio input formats
 * @returns {Array} Supported input formats
 */
const getSupportedAudioInputFormats = () => {
  return ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'mp4', 'avi', 'mov', 'mkv'];
};

/**
 * Get supported audio output formats
 * @returns {Array} Supported output formats
 */
const getSupportedAudioOutputFormats = () => {
  return ['mp3', 'wav', 'aac', 'flac', 'ogg'];
};

/**
 * Map format names to FFmpeg format names
 * @param {string} format - Format name
 * @returns {string} FFmpeg format name
 */
const mapFormatToFFmpeg = (format) => {
  const formatMap = {
    'mp3': 'mp3',
    'wav': 'wav',
    'aac': 'aac',
    'flac': 'flac',
    'ogg': 'ogg'
 };
  return formatMap[format] || format;
};

module.exports = {
  convertAudio,
  extractAudio,
  trimAudio,
  mixAudio,
  applyAudioEffects,
  getSupportedAudioInputFormats,
  getSupportedAudioOutputFormats,
  mapFormatToFFmpeg
};