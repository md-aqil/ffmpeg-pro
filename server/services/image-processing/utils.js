const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const CONVERTED_DIR = path.join(__dirname, "../../converted");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".tiff", ".avif", ".bmp"];
const IMAGE_OUTPUT_FORMAT_LABELS = {
  jpg: "JPEG",
  png: "PNG",
  webp: "WebP",
  tiff: "TIFF",
  avif: "AVIF",
  bmp: "BMP",
  gif: "GIF",
};
const IMAGE_OUTPUT_FORMAT_ENCODERS = {
  jpg: ["mjpeg", "jpeg", "libjpeg"],
  jpeg: ["mjpeg", "jpeg", "libjpeg"],
  png: ["png"],
  webp: ["libwebp", "webp"],
  tiff: ["tiff", "libtiff"],
  avif: ["libaom-av1", "libsvtav1", "librav1e", "avif"],
  bmp: ["bmp"],
  gif: ["gif"],
};

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const resolveFfmpegBinaryPath = () => {
  const candidates = [
    process.env.FFMPEG_PATH,
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/opt/homebrew/bin/ffmpeg",
    "/opt/bin/ffmpeg",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "ffmpeg";
};

const getAvailableFfmpegEncoders = (() => {
  let cachedEncoders = null;

  return () => {
    if (cachedEncoders) {
      return cachedEncoders;
    }

    try {
      const ffmpegBinary = resolveFfmpegBinaryPath();
      const output = execFileSync(ffmpegBinary, ["-hide_banner", "-encoders"], { encoding: "utf8" });
      cachedEncoders = new Set();

      for (const line of output.split("\n")) {
        const match = line.match(/^\s*[A-Z.]{6}\s+([a-z0-9_+-]+)\b/i);
        if (match) {
          cachedEncoders.add(match[1].toLowerCase());
        }
      }
    } catch (error) {
      console.warn("Unable to inspect FFmpeg encoders, using a conservative format list:", error.message);
      cachedEncoders = new Set(["mjpeg", "png", "tiff"]);
    }

    return cachedEncoders;
  };
})();

const getSupportedImageOutputFormats = () => {
  const availableEncoders = getAvailableFfmpegEncoders();
  const supportedFormats = Object.entries(IMAGE_OUTPUT_FORMAT_ENCODERS)
    .filter(([, requiredEncoders]) => requiredEncoders.some((encoder) => availableEncoders.has(encoder)))
    .map(([format]) => format);

  return [...new Set(supportedFormats)].filter((format) => format !== "jpeg");
};

const validateImageOutputFormat = (outputFormat, hasVisualizer = false) => {
  if (hasVisualizer) {
    return "mp4";
  }

  const normalizedFormat = String(outputFormat || "png").toLowerCase() === "jpeg"
    ? "jpg"
    : String(outputFormat || "png").toLowerCase();
  const supportedFormats = getSupportedImageOutputFormats();

  if (!supportedFormats.includes(normalizedFormat)) {
    throw createHttpError(
      `Unsupported image output format \'${normalizedFormat}\'. Supported formats: ${supportedFormats.join(", ")}`,
      400
    );
  }

  return normalizedFormat;
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

const ensureConvertedDir = async () => {
  await fs.promises.mkdir(CONVERTED_DIR, { recursive: true });
};

const sanitizeArchiveEntryName = (fileName, fallbackName) => {
  const parsed = path.parse(fileName || "");
  const baseName = (parsed.name || fallbackName || "image")
    .replace(/[^\w\s.-]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64) || fallbackName || "image";
  const extension = (parsed.ext || path.extname(fallbackName || "") || ".png").toLowerCase();
  return `${baseName}${extension}`;
};

const createZipArchive = async (entries, archivePath) => {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("warning", (warning) => {
      if (warning.code === "ENOENT") {
        console.warn("Archive warning:", warning.message);
        return;
      }
      reject(warning);
    });
    archive.on("error", reject);
    archive.pipe(output);

    for (const entry of entries) {
      archive.file(entry.path, { name: entry.name });
    }

    archive.finalize();
  });
};

module.exports = {
  UPLOADS_DIR,
  CONVERTED_DIR,
  IMAGE_EXTENSIONS,
  IMAGE_OUTPUT_FORMAT_LABELS,
  IMAGE_OUTPUT_FORMAT_ENCODERS,
  createHttpError,
  resolveFfmpegBinaryPath,
  getAvailableFfmpegEncoders,
  getSupportedImageOutputFormats,
  validateImageOutputFormat,
  resolveUploadedImagePath,
  ensureConvertedDir,
  sanitizeArchiveEntryName,
  createZipArchive,
};
