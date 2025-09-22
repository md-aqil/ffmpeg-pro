# FFmpeg Image Processing Command Builders

This document explains how to use the comprehensive FFmpeg command builders implemented in this project, which follow the design system from [theme.css](client/src/theme.css).

## Overview

The FFmpeg command builders provide a fluent API for constructing complex image processing commands using fluent-ffmpeg. These builders are implemented in [client/src/services/ffmpegService.js](client/src/services/ffmpegService.js) and can be used both on the client and server sides.

## Command Builder Classes

### FFmpegCommandBuilder

The main class for building FFmpeg commands with a fluent API.

```javascript
import FFmpegCommandBuilder from '../services/ffmpegService';

const command = new FFmpegCommandBuilder(inputPath)
  .outputFormat('jpg')
  .outputOptions(['-quality', '80'])
  .output(outputPath);
```

#### Methods

- `outputFormat(format)` - Set the output format
- `outputOptions(options)` - Add output options
- `videoFilters(filters)` - Add video filters
- `output(outputPath)` - Set the output path
- `build()` - Build the command object
- `execute()` - Execute the command (placeholder implementation)

## Pre-built Command Functions

### Format Conversion with Quality Control

Convert images with quality control:

```javascript
import { convertWithQuality } from '../services/ffmpegService';

const command = convertWithQuality(inputPath, 'webp', '80', outputPath);
```

### Advanced Resizing with Filters

Resize images with advanced filtering:

```javascript
import { resizeWithFilters } from '../services/ffmpegService';

const command = resizeWithFilters(inputPath, 800, 600, outputPath);
```

### Image Effects and Filters

Apply various image effects:

```javascript
import { applyImageEffects } from '../services/ffmpegService';

const command = applyImageEffects(inputPath, {
  brightness: 0.2,
  contrast: 0.1,
  saturation: 1.2,
  sharpen: true
}, outputPath);
```

### Batch Processing with Queue Management

Process multiple images with queue management:

```javascript
import { batchProcessor, createBatchJob } from '../services/ffmpegService';

// Create jobs
const jobs = [
  {
    command: convertWithQuality(inputPath1, 'jpg', '90', outputPath1),
    onComplete: (result) => console.log('Job 1 completed', result),
    onError: (error) => console.error('Job 1 failed', error)
  },
  {
    command: resizeWithFilters(inputPath2, 1024, 768, outputPath2),
    onComplete: (result) => console.log('Job 2 completed', result),
    onError: (error) => console.error('Job 2 failed', error)
  }
];

// Process jobs
createBatchJob(jobs);

// Check queue status
console.log(batchProcessor.getStatus());
```

## Server-side Implementation

The server-side implementation uses fluent-ffmpeg directly to execute the commands. The controllers are located in [server/controllers/imageController.js](server/controllers/imageController.js).

### Example: Convert Image

```javascript
const convertImage = async (req, res) => {
  try {
    const { fileId, fileName, targetFormat } = req.body;
    
    // Validate input
    if (!fileId || !targetFormat) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId and targetFormat' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    
    // Generate output filename
    const outputFilename = `${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

    // Use fluent-ffmpeg directly
    await new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .output(outputPath)
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
```

### Example: Apply Advanced Effects

```javascript
const applyAdvancedImageEffects = async (req, res) => {
  try {
    const { fileId, fileName, effects } = req.body;

    // Validate input
    if (!fileId || !effects) {
      return res.status(400).json({ success: false, error: 'Missing required fields: fileId and effects' });
    }

    // Check if input file exists
    const fileExtension = path.extname(fileName || fileId);
    const inputFilePath = path.join(__dirname, '../uploads', `${fileId}${fileExtension}`);
    
    // Generate output filename
    const outputFilename = `${uuidv4()}${fileExtension}`;
    const outputPath = path.join(__dirname, '../converted', outputFilename);

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
```

## Client-side Implementation

The client-side implementation uses the API service to communicate with the server. The components are located in [client/src/components/](client/src/components/).

### Example: ImageConverter Component

```javascript
import React, { useState } from 'react';
import { convertImageFile, applyAdvancedImageEffects } from '../services/api';

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(1);
  
  const handleApplyAdvancedEffects = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Then apply the advanced effects
      const response = await applyAdvancedImageEffects(
        uploadData.data.fileId,
        selectedFile.name,
        {
          brightness,
          contrast,
          saturation
        }
      );

      if (response.success) {
        setConversionResult(response.data);
      } else {
        throw new Error(response.error || 'Advanced effects application failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during advanced effects application');
    }
  };

  return (
    <div className="image-converter">
      {/* Component UI */}
    </div>
  );
};

export default ImageConverter;
```

## API Endpoints

The following API endpoints are available for image processing:

### Image Conversion
- `POST /api/image/convert` - Convert image to different format

### Image Resizing
- `POST /api/image/resize` - Resize image to specific dimensions

### Image Cropping
- `POST /api/image/crop` - Crop image to specific area

### Image Effects
- `POST /api/image/effects` - Apply quick effects (blur, sharpen, etc.)
- `POST /api/image/advancedEffects` - Apply advanced effects with parameters

### Image Optimization
- `POST /api/image/optimize` - Optimize image with quality settings

### Image Watermarking
- `POST /api/image/watermark` - Add watermark to image

### Image Metadata
- `GET /api/image/metadata/:filename` - Get image metadata

### Batch Processing
- `POST /api/image/batch` - Process multiple images

## Usage Examples

### Converting Image Format with Quality Control

```javascript
// Client-side
const response = await convertImageFile(fileId, fileName, 'webp');

// Server-side equivalent using fluent-ffmpeg
ffmpeg(inputPath)
  .outputFormat('webp')
  .outputOptions(['-quality', '80'])
  .output(outputPath);
```

### Advanced Resizing with Filters

```javascript
// Client-side
const response = await resizeImage(fileId, fileName, 800, 600);

// Server-side equivalent using fluent-ffmpeg
ffmpeg(inputPath)
  .outputOptions([
    `-vf scale=800:600:flags=lanczos`,
    '-sws_flags', 'lanczos+accurate_rnd'
  ])
  .output(outputPath);
```

### Applying Image Effects

```javascript
// Client-side
const response = await applyAdvancedImageEffects(fileId, fileName, {
  brightness: 0.2,
  contrast: 0.1,
  saturation: 1.2
});

// Server-side equivalent using fluent-ffmpeg
ffmpeg(inputPath)
  .videoFilters([
    `eq=brightness=0.2`,
    `eq=contrast=1.1`,
    `hue=s=1.2`
  ])
  .output(outputPath);
```

## Batch Processing Implementation

The batch processing system handles multiple image processing jobs with queue management:

```javascript
class BatchProcessor {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 3; // Limit concurrent jobs
    this.activeJobs = 0;
  }

  addJob(command, onComplete, onError) {
    this.queue.push({ command, onComplete, onError });
    this.processQueue();
  }

  async processQueue() {
    if (this.processing || this.activeJobs >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      this.activeJobs++;

      try {
        const result = await job.command.execute();
        job.onComplete(result);
      } catch (error) {
        job.onError(error);
      } finally {
        this.activeJobs--;
      }
    }

    this.processing = false;
    
    // Process remaining jobs
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
}
```

## Design System Integration

The implementation follows the design system defined in [theme.css](client/src/theme.css), using CSS variables for consistent styling:

```css
.image-converter {
  padding: 1.5rem;
  background-color: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  color: var(--card-foreground);
}

.control-group button {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-md);
}
```

This ensures a consistent look and feel across the application while maintaining the flexibility to customize the appearance through the theme system.