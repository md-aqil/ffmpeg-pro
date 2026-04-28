const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Set the path to FFmpeg executable - check multiple common locations
const possibleFfmpegPaths = [
  process.env.FFMPEG_PATH, // Custom path from environment
  '/usr/bin/ffmpeg',        // Linux standard
  '/usr/local/bin/ffmpeg',  // Linux local
  '/opt/homebrew/bin/ffmpeg', // macOS Homebrew
  '/opt/bin/ffmpeg',        // Railway nixpacks
  'ffmpeg'                  // System PATH
];

// Find the first available FFmpeg
let ffmpegPath = null;
for (const p of possibleFfmpegPaths) {
  if (p) {
    try {
      fs.accessSync(p);
      ffmpegPath = p;
      break;
    } catch (e) {
      // Path doesn't exist, try next
    }
  }
}

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log(`FFmpeg path set to: ${ffmpegPath}`);
} else {
  console.warn('FFmpeg not found in common locations, using system PATH');
}

// Set the path to ffprobe executable - check multiple common locations
const possibleFfprobePaths = [
  process.env.FFPROBE_PATH,
  '/usr/bin/ffprobe',
  '/usr/local/bin/ffprobe',
  '/opt/homebrew/bin/ffprobe',
  '/opt/bin/ffprobe',
  'ffprobe'
];

let ffprobePath = null;
for (const p of possibleFfprobePaths) {
  if (p) {
    try {
      fs.accessSync(p);
      ffprobePath = p;
      break;
    } catch (e) {
      // Path doesn't exist
    }
  }
}

if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
  console.log(`FFprobe path set to: ${ffprobePath}`);
}

module.exports = ffmpeg;
