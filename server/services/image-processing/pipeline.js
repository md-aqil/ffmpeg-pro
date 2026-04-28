const ffmpeg = require("../../utils/ffmpegConfig");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const CONVERTED_DIR = path.join(__dirname, "../../converted");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".tiff", ".avif", ".bmp"];

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const resolveUploadedImagePath = async (fileId, fileName) => {
  const candidates = [];
  const normalizedFileName = typeof fileName === "string" ? fileName : "";
  const preferredExtension = path.extname(normalizedFileName).toLowerCase();

  if (preferredExtension) {
    candidates.push(preferredExtension);
  }

  for (const extension of IMAGE_EXTENSIONS) {
    if (!candidates.includes(extension)) {
      candidates.push(extension);
    }
  }

  for (const extension of candidates) {
    const candidatePath = path.join(UPLOADS_DIR, `${fileId}${extension}`);
    try {
      await fs.promises.access(candidatePath);
      return candidatePath;
    } catch (error) {
      // Try the next candidate.
    }
  }

  try {
    const uploadedFiles = await fs.promises.readdir(UPLOADS_DIR);
    const matchingFile = uploadedFiles.find((file) =>
      file === fileId || file.startsWith(`${fileId}.`)
    );

    if (matchingFile) {
      return path.join(UPLOADS_DIR, matchingFile);
    }
  } catch (error) {
    // Directory unreadable or empty.
  }

  return null;
};

const validateImageOutputFormat = (outputFormat, hasVisualizer = false) => {
  if (hasVisualizer) {
    return "mp4";
  }

  const normalizedFormat = String(outputFormat || "png").toLowerCase() === "jpeg"
    ? "jpg"
    : String(outputFormat || "png").toLowerCase();
  const supportedFormats = ["jpg", "png", "webp", "tiff", "avif", "bmp", "gif"]; 

  if (!supportedFormats.includes(normalizedFormat)) {
    throw createHttpError(
      `Unsupported image output format \'${normalizedFormat}\'. Supported formats: ${supportedFormats.join(", ")}`,
      400
    );
  }

  return normalizedFormat;
};

const escapeDrawtext = (value) => String(value ?? "")
  .replace(/\\/g, "\\\\")
  .replace(/:/g, "\\:")
  .replace(/\'/g, "\\\'")
  .replace(/\r?\n/g, " ");


const buildFilterGraph = async (operations, currentLabel, extraInputs = []) => {
    const filterGraph = [];
    let labelCounter = 0;

    const nextLabel = (prefix = "v") => `${prefix}${labelCounter++}`;
    const appendFilter = (filter, options, inputs = currentLabel, outputPrefix = "v") => {
        const outputLabel = nextLabel(outputPrefix);
        filterGraph.push({ filter, options, inputs, outputs: outputLabel });
        currentLabel = outputLabel;
        return outputLabel;
    };

    const appendSequentialFilters = (filters) => {
        for (const filter of filters) {
            appendFilter(filter.filter, filter.options, filter.inputs);
        }
    };

    for (const op of operations) {
        switch (op.type) {
            case "rotate": {
                const angle = Number(op.angle) || 0;
                const normalizedAngle = ((angle % 360) + 360) % 360;

                if (normalizedAngle === 90) {
                    appendFilter("transpose", 1);
                } else if (normalizedAngle === 180) {
                    appendFilter("transpose", 2);
                } else if (normalizedAngle === 270) {
                    appendFilter("transpose", 3);
                } else if (normalizedAngle !== 0) {
                    appendFilter("rotate", normalizedAngle * Math.PI / 180);
                }
                break;
            }
            case "crop": {
                // Apply the crop to get the desired region
                // Use FFmpeg expressions to ensure clamping to image boundaries
                const cropExpr = `min(iw\\,${op.width}):min(ih\\,${op.height}):max(0\\,min(iw-${op.width}\\,${op.x})):max(0\\,min(ih-${op.height}\\,${op.y}))`;
                const croppedLabel = appendFilter("crop", cropExpr);
                
                // If target dimensions are provided and different, apply padding
                if (op.targetWidth && op.targetHeight && (op.targetWidth !== op.width || op.targetHeight !== op.height)) {
                    const padWidth = op.targetWidth;
                    const padHeight = op.targetHeight;
                    const fillColor = op.fillColor || "black"; // Default fill color is black
                    
                    // Center the cropped image on the new padded canvas
                    const padX = `(ow-iw)/2`; // Center horizontally
                    const padY = `(oh-ih)/2`; // Center vertically
                    
                    currentLabel = appendFilter("pad", `${padWidth}:${padHeight}:${padX}:${padY}:color=${fillColor}`, croppedLabel);
                } else {
                    currentLabel = croppedLabel; // No padding, just the crop
                }
                break;
            }
            case "resize": {
                if (op.useSmartFrame) {
                    const width = Number(op.width) || 1080;
                    const height = Number(op.height) || 1920;
                    const blur = Number(op.blur) || 20;

                    const backgroundScaled = nextLabel("bg");
                    filterGraph.push({
                        filter: "scale",
                        options: `${width}:${height}:force_original_aspect_ratio=increase`,
                        inputs: currentLabel,
                        outputs: backgroundScaled,
                    });

                    const backgroundCropped = nextLabel("bg");
                    filterGraph.push({
                        filter: "crop",
                        options: `${width}:${height}`,
                        inputs: backgroundScaled,
                        outputs: backgroundCropped,
                    });

                    const backgroundBlurred = nextLabel("bg");
                    filterGraph.push({
                        filter: "boxblur",
                        options: `${blur}`,
                        inputs: backgroundCropped,
                        outputs: backgroundBlurred,
                    });

                    const foregroundScaled = nextLabel("fg");
                    filterGraph.push({
                        filter: "scale",
                        options: `${width}:${height}:force_original_aspect_ratio=decrease`,
                        inputs: currentLabel,
                        outputs: foregroundScaled,
                    });

                    const framedLabel = nextLabel("frm");
                    filterGraph.push({
                        filter: "overlay",
                        options: "(W-w)/2:(H-h)/2",
                        inputs: [backgroundBlurred, foregroundScaled],
                        outputs: framedLabel,
                    });

                    currentLabel = framedLabel;
                } else {
                    appendFilter("scale", `${op.width || "iw"}:${op.height || "ih"}:flags=lanczos`);
                }
                break;
            }
            case "brightness":
                appendFilter("eq", `brightness=${op.value || 0}`);
                break;
            case "contrast":
                appendFilter("eq", `contrast=${(op.value || 0) + 1}`);
                break;
            case "saturation":
                appendFilter("hue", `s=${op.value || 1}`);
                break;
            case "effect": {
                const sequentialFilters = [];

                if (op.brightness !== undefined) sequentialFilters.push({ filter: "eq", options: `brightness=${op.brightness}` });
                if (op.contrast !== undefined) sequentialFilters.push({ filter: "eq", options: `contrast=${Number(op.contrast) + 1}` });
                if (op.saturation !== undefined) sequentialFilters.push({ filter: "hue", options: `s=${op.saturation}` });

                if (op.mood && op.mood !== "none") {
                    switch (op.mood) {
                        case "cinematic":
                            sequentialFilters.push(
                                { filter: "curves", options: "preset=strong_contrast" },
                                { filter: "hue", options: "s=0.8" },
                                { filter: "colorchannelmixer", options: "1.1:0:0:0:0:1.0:0:0:0:0:1.2:0" },
                            );
                            break;
                        case "vintage":
                            sequentialFilters.push(
                                { filter: "curves", options: "preset=vintage" },
                                { filter: "hue", options: "s=0.6" },
                                { filter: "colorchannelmixer", options: "1.1:0:0:0:0:1.0:0:0:0:0:0.8:0" },
                            );
                            break;
                        case "cyberpunk":
                            sequentialFilters.push(
                                { filter: "hue", options: "s=1.5" },
                                { filter: "colorchannelmixer", options: "1.4:0:0.2:0:0:1.1:0:0:0.2:0:1.4:0" },
                            );
                            break;
                        case "golden":
                            sequentialFilters.push(
                                { filter: "curves", options: "preset=lighter" },
                                { filter: "hue", options: "s=1.2" },
                                { filter: "colorchannelmixer", options: "1.2:0:0:0:0:1.1:0:0:0:0:0.9:0" },
                            );
                            break;
                        case "dramatic":
                            sequentialFilters.push(
                                { filter: "curves", options: "preset=strong_contrast" },
                                { filter: "hue", options: "s=0.4" },
                                { filter: "eq", options: "brightness=-0.05" },
                            );
                            break;
                        case "noir":
                            sequentialFilters.push(
                                { filter: "format", options: "gray" },
                                { filter: "curves", options: "preset=strong_contrast" },
                            );
                            break;
                    }
                }

                if (op.effect === "blur") sequentialFilters.push({ filter: "boxblur", options: "5" });
                if (op.effect === "sharpen") sequentialFilters.push({ filter: "unsharp", options: "5:5:1.0:5:5:0.0" });
                if (op.effect === "grayscale") sequentialFilters.push({ filter: "format", options: "gray" });
                if (op.effect === "sepia") sequentialFilters.push({ filter: "colorchannelmixer", options: ".393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0:0:0:0:1" });

                appendSequentialFilters(sequentialFilters);
                break;
            }
            case "watermark": {
                const opacityValue = Number(op.opacity !== undefined ? op.opacity : 50);
                const alpha = Math.max(0, Math.min(100, opacityValue)) / 100;
                const position = op.position || "bottom-right";
                let x = "10";
                let y = "10";

                if (position === "custom") {
                    x = String(op.customX ?? 10);
                    y = String(op.customY ?? 10);
                } else {
                    if (position.includes("right")) x = "w-tw-20";
                    if (position.includes("center")) x = "(w-tw)/2";
                    if (position.includes("bottom")) y = "h-th-20";
                    if (position.includes("middle")) y = "(h-th)/2";
                }

                if (op.useImage && op.imageFileId) {
                    const watermarkPath = await resolveUploadedImagePath(op.imageFileId, op.imageFileName);
                    if (!watermarkPath) {
                        throw createHttpError("Watermark image not found", 404);
                    }

                    // Track this extra input for runImagePipeline
                    const inputIndex = 1 + extraInputs.length;
                    extraInputs.push(watermarkPath);

                    const watermarkInputLabel = `${inputIndex}:v`;
                    const watermarkFormatLabel = nextLabel("wm");
                    filterGraph.push({
                        filter: "format",
                        options: "rgba",
                        inputs: watermarkInputLabel,
                        outputs: watermarkFormatLabel,
                    });

                    const watermarkAlphaLabel = nextLabel("wm");
                    filterGraph.push({
                        filter: "colorchannelmixer",
                        options: `aa=${alpha}`,
                        inputs: watermarkFormatLabel,
                        outputs: watermarkAlphaLabel,
                    });

                    const outputLabel = nextLabel("out");
                    filterGraph.push({
                        filter: "overlay",
                        options: `x=${x}:y=${y}`,
                        inputs: [currentLabel, watermarkAlphaLabel],
                        outputs: outputLabel,
                    });

                    currentLabel = outputLabel;
                } else if (op.text) {
                    appendFilter(
                        "drawtext",
                        `text=\'${escapeDrawtext(op.text)}\':x=${x}:y=${y}:fontsize=32:fontcolor=white@${alpha}:box=1:boxcolor=black@0.4`
                    );
                }
                break;
            }
            default:
                break;
        }
    }
    return { filterGraph, currentLabel };
}

const runImagePipeline = async ({ fileId, fileName, operations, outputFormat, quality }) => {
  if (!fileId || !operations || !Array.isArray(operations)) {
    throw createHttpError("Missing required fields", 400);
  }

  if (!/^[a-f0-9-]+$/i.test(fileId)) {
    throw createHttpError("Invalid file ID format", 400);
  }

  const inputFilePath = await resolveUploadedImagePath(fileId, fileName);
  if (!inputFilePath) {
    throw createHttpError("Input file not found", 404);
  }

  await fs.promises.mkdir(CONVERTED_DIR, { recursive: true });

  const hasVisualizer = operations.some((op) => op.type === "visualizer");
  const effectiveFormat = validateImageOutputFormat(outputFormat, hasVisualizer);
  const outputFilename = `${uuidv4()}.${effectiveFormat}`;
  const outputPath = path.join(CONVERTED_DIR, outputFilename);
  const extraInputs = [];
  const { filterGraph, currentLabel } = await buildFilterGraph(operations, "0:v", extraInputs);

  console.log(`Starting complex single-pass pipeline for file ${fileId}`);

  await new Promise((resolve, reject) => {
    let ffmpegCommand = ffmpeg(inputFilePath);
    extraInputs.forEach((inputPath) => {
      ffmpegCommand = ffmpegCommand.input(inputPath);
    });

    if (filterGraph.length > 0) {
      ffmpegCommand = ffmpegCommand.complexFilter(filterGraph, currentLabel);
    }

    if (effectiveFormat !== "png" && effectiveFormat !== "tiff" && Number.isFinite(Number(quality))) {
      const qValue = Math.max(1, Math.min(31, Math.round((100 - Number(quality)) / 10) || 1));
      ffmpegCommand = ffmpegCommand.outputOptions([`-q:v ${qValue}`]);
    }

    ffmpegCommand
      .output(outputPath)
      .on("start", (cmd) => console.log("FFmpeg Complex Pipeline:", cmd))
      .on("end", () => resolve())
      .on("error", (err) => {
        console.error("FFmpeg Error:", err);
        reject(err);
      })
      .run();
  });

  return { filename: outputFilename, outputPath };
};

module.exports = { runImagePipeline, escapeDrawtext, validateImageOutputFormat, resolveUploadedImagePath, createHttpError };
