const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const ffmpeg = require("../utils/ffmpegConfig");
const { runImagePipeline } = require("../services/image-processing/pipeline");
const {
  resolveUploadedImagePath,
  ensureConvertedDir,
  createHttpError,
  validateImageOutputFormat,
  getSupportedImageOutputFormats,
  IMAGE_OUTPUT_FORMAT_LABELS,
  sanitizeArchiveEntryName,
  createZipArchive,
} = require("../services/image-processing/utils");
const aiService = require("../services/aiService");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const CONVERTED_DIR = path.join(__dirname, "../converted");

const convertImage = async (req, res) => {
  try {
    const { fileId, fileName, targetFormat } = req.body;
    const operations = [{ type: "convert", format: targetFormat }];
    const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: targetFormat, quality: 100 });
    res.json({ success: true, data: { filename } });
  } catch (error) {
    console.error("Error during image conversion:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const resizeImage = async (req, res) => {
  try {
    const { fileId, fileName, width, height } = req.body;
    const operations = [{ type: "resize", width, height }];
    const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality: 100 });
    res.json({ success: true, data: { filename } });
  } catch (error) {
    console.error("Error during image resizing:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const cropImage = async (req, res) => {
  try {
    const { fileId, fileName, x, y, width, height } = req.body;
    const operations = [{ type: "crop", x, y, width, height }];
    const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality: 100 });
    res.json({ success: true, data: { filename } });
  } catch (error) {
    console.error("Error during image cropping:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const applyEffects = async (req, res) => {
  try {
    const { fileId, fileName, effect } = req.body;
    const operations = [{ type: "effect", effect }];
    const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality: 100 });
    res.json({ success: true, data: { filename } });
  } catch (error) {
    console.error("Error during image effects:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const extractFrames = async (req, res) => {
  try {
    const { fileId, fileName, frameRate } = req.body;

    if (!fileId || !frameRate) {
      return res.status(400).json({ success: false, error: "Missing required fields: fileId and frameRate" });
    }

    const inputFilePath = await resolveUploadedImagePath(fileId, fileName);
    if (!inputFilePath) {
      return res.status(404).json({ success: false, error: "Input file not found" });
    }

    const outputDir = path.join(CONVERTED_DIR, `${uuidv4()}_frames`);
    const outputPath = path.join(outputDir, "frame_%04d.png");

    console.log(`Extracting frames from file ${fileId} at frame rate ${frameRate}`);

    fs.mkdirSync(outputDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
        .output(outputPath)
        .fps(frameRate)
        .on("start", (commandLine) => {
            console.log("FFmpeg process started:", commandLine);
        })
        .on("end", () => {
            console.log(`Frames extracted successfully to ${outputDir}`);
            resolve();
        })
        .on("error", (err) => {
            console.error("Frame extraction failed:", err);
            reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { directory: outputDir } });

  } catch (error) {
    console.error("Error during frame extraction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createVideoFromImages = async (req, res) => {
  try {
    const { imageDir, frameRate } = req.body;

    if (!imageDir) {
      return res.status(400).json({ success: false, error: "No image directory provided." });
    }

    const outputFilename = `${uuidv4()}.mp4`;
    const outputPath = path.join(CONVERTED_DIR, outputFilename);
    const inputPath = path.join(imageDir, "frame_%04d.png");

    console.log(`Creating video from images in ${imageDir} at frame rate ${frameRate}`);

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
        .inputOptions([`-framerate ${frameRate}`])
        .outputOptions([".-c:v libx264", ".-pix_fmt yuv420p"])
        .output(outputPath)
        .on("start", (commandLine) => {
            console.log("FFmpeg process started:", commandLine);
        })
        .on("end", () => {
            console.log(`Video created successfully from images in ${imageDir}`);
            resolve();
        })
        .on("error", (err) => {
            console.error("Video creation failed:", err);
            reject(err);
        })
        .run();
    });

    res.json({ success: true, data: { filename: outputFilename } });

  } catch (error) {
    console.error("Error during video creation:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const optimizeImage = async (req, res) => {
    try {
        const { fileId, fileName, quality, compressionType } = req.body;
        const operations = [{
            type: "optimize",
            quality,
            compressionType,
        }];
        const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality });
        res.json({ success: true, data: { filename } });
    } catch (error) {
        console.error("Error during image optimization:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const batchImages = async (req, res) => {
  try {
    const { files, operation, settings } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required fields: files" });
    }

    const results = [];
    const batchSettings = settings && typeof settings === "object" ? settings : {};
    const operations = Array.isArray(batchSettings.operations) ? batchSettings.operations : [];
    const outputFormat = batchSettings.outputFormat || "png";
    const quality = batchSettings.quality ?? 80;

    for (const file of files) {
      const fileId = file.fileId || file.id;
      const fileName = file.fileName || file.originalName || file.name;

      if (!fileId || !fileName) {
        results.push({
          fileId: fileId || null,
          fileName: fileName || null,
          success: false,
          error: "Missing fileId or fileName",
        });
        continue;
      }

      try {
        const pipelineResult = await runImagePipeline({
          fileId,
          fileName,
          operations,
          outputFormat,
          quality,
        });

        results.push({
          fileId,
          fileName,
          success: true,
          filename: pipelineResult.filename,
        });
      } catch (error) {
        results.push({
          fileId,
          fileName,
          success: false,
          error: error.message || "Batch item failed",
        });
      }
    }

    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;
    let archiveFilename = null;

    if (successCount > 0) {
      archiveFilename = `batch-${uuidv4()}.zip`;
      const archivePath = path.join(CONVERTED_DIR, archiveFilename);
      const archiveEntries = results
        .filter((result) => result.success && result.filename)
        .map((result) => ({
          path: path.join(CONVERTED_DIR, result.filename),
          name: sanitizeArchiveEntryName(result.fileName, result.filename),
        }));

      try {
        await createZipArchive(archiveEntries, archivePath);
      } catch (archiveError) {
        console.error("Error creating batch archive:", archiveError);
        return res.status(500).json({ success: false, error: archiveError.message });
      }
    }

    res.json({
      success: failureCount === 0,
      data: {
        results,
        summary: {
          total: results.length,
          succeeded: successCount,
          failed: failureCount,
        },
        archiveFilename,
      },
    });

  } catch (error) {
    console.error("Error during batch image processing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getImageFormats = (req, res) => {
  try {
    const supportedFormats = getSupportedImageOutputFormats();

    res.json({
      success: true,
      input: ["jpg", "jpeg", "png", "webp", "tiff", "avif", "bmp", "gif"],
      output: supportedFormats.map((format) => ({
        value: format,
        label: IMAGE_OUTPUT_FORMAT_LABELS[format] || format.toUpperCase(),
      })),
    });
  } catch (error) {
    console.error("Error getting image formats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch image formats" });
  }
};

const getImageMetadata = async (req, res) => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return res.status(400).json({ success: false, error: "Missing required field: filename" });
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    try {
      await fs.promises.access(filePath);
    } catch (error) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    // Extract EXIF data, dimensions, color profile, creation date
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("Error getting metadata:", err);
        return res.status(500).json({ success: false, error: "Error getting metadata" });
      }

      const videoStream = metadata.streams.find((stream) => stream.codec_type === "video" || stream.codec_type === "image") || metadata.streams[0];
      if (!videoStream) {
        return res.status(500).json({ success: false, error: "Unsupported image metadata" });
      }

      const { width, height } = videoStream;
      const fileSize = fs.statSync(filePath).size;
      const format = metadata.format.format_name;
      const colorSpace = videoStream.color_space;
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
    console.error("Error during image metadata extraction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const watermarkImage = async (req, res) => {
  try {
    const { fileId, fileName, watermarkType, watermarkData, position, opacity } = req.body;
    const operations = [{
        type: "watermark",
        text: watermarkData,
        useImage: watermarkType === "image",
        imageFileId: watermarkType === "image" ? watermarkData : null,
        position,
        opacity,
    }];
    const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality: 100 });
    res.json({ success: true, data: { filename } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const applyAdvancedImageEffects = async (req, res) => {
    try {
        const { fileId, fileName, effects } = req.body;
        const operations = Object.entries(effects).map(([key, value]) => ({ type: key, value }));
        const { filename } = await runImagePipeline({ fileId, fileName, operations, outputFormat: "png", quality: 100 });
        res.json({ success: true, data: { filename } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const processPipeline = async (req, res) => {
  try {
    const { fileId, fileName, operations, outputFormat, quality } = req.body;
    const result = await runImagePipeline({ fileId, fileName, operations: Array.isArray(operations) ? operations : [], outputFormat, quality });
    res.json({ success: true, data: { filename: result.filename } });
  } catch (error) {
    console.error("Pipeline Error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const generateFastPreview = async (req, res) => {
  try {
    const { fileId, fileName, operations } = req.body;

    // For fast preview, we force a low-quality JPEG output.
    const outputFormat = 'jpeg';
    const quality = 40; // Low quality for fast processing

    const result = await runImagePipeline({
      fileId,
      fileName,
      operations: Array.isArray(operations) ? operations : [],
      outputFormat,
      quality,
    });
    res.json({ success: true, data: { filename: result.filename } });
  } catch (error) {
    console.error("Fast Preview Error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

const analyzeImage = async (req, res) => {
  try {
    const { fileId, fileName } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, error: "Missing required field: fileId" });
    }

    const filePath = await resolveUploadedImagePath(fileId, fileName);
    if (!filePath) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const aiMetadata = await aiService.analyzeImage(filePath);
    res.json({ success: true, data: aiMetadata });
  } catch (error) {
    console.error("AI Analysis Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const downloadWithMetadata = async (req, res) => {
  try {
    const { filename, metadata } = req.body;
    if (!filename || !metadata) {
      return res.status(400).json({ success: false, error: "Missing required fields: filename and metadata" });
    }

    const imagePath = path.join(CONVERTED_DIR, filename);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, error: "Image file not found" });
    }

    const zipFilename = `download-${uuidv4()}.zip`;
    const zipPath = path.join(CONVERTED_DIR, zipFilename);
    
    const metadataContent = `Title: ${metadata.title || 'N/A'}
ALT Text: ${metadata.altText || 'N/A'}
Description: ${metadata.description || 'N/A'}
Suggested Filename: ${metadata.suggestedFilename || 'N/A'}
`;

    const metadataFilePath = path.join(CONVERTED_DIR, `${uuidv4()}_metadata.txt`);
    fs.writeFileSync(metadataFilePath, metadataContent);

    const archiveEntries = [
      { path: imagePath, name: metadata.suggestedFilename ? `${metadata.suggestedFilename}${path.extname(filename)}` : filename },
      { path: metadataFilePath, name: 'metadata.txt' }
    ];

    await createZipArchive(archiveEntries, zipPath);
    
    // Clean up temporary metadata file after archiving (optional, but good practice)
    // Actually, createZipArchive is async, so we should clean up after it's done.
    
    res.json({ success: true, data: { filename: zipFilename } });
  } catch (error) {
    console.error("Download with metadata error:", error);
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
    getImageFormats,
    getImageMetadata,
    watermarkImage,
    applyAdvancedImageEffects,
    processPipeline,
    generateFastPreview,
    analyzeImage,
    downloadWithMetadata
};
