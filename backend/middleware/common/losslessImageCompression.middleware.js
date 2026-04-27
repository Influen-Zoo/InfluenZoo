const fs = require('fs/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const sharp = require('sharp');
const jpegtranBin = require('jpegtran-bin');

const execFileAsync = promisify(execFile);
const jpegtran = jpegtranBin.default || jpegtranBin;

const compressibleImageTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/avif',
  'image/tiff'
]);

const getUploadedFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
  return [];
};

const getOptimizedBuffer = async (file) => {
  const image = sharp(file.path, { animated: false });
  const metadata = await image.metadata();

  if ((metadata.pages || 1) > 1) {
    return null;
  }

  if (file.mimetype === 'image/png' || file.mimetype === 'image/x-png') {
    return image.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      effort: 10
    }).toBuffer();
  }

  if (file.mimetype === 'image/webp') {
    return image.webp({
      lossless: true,
      effort: 6
    }).toBuffer();
  }

  if (file.mimetype === 'image/avif') {
    return image.avif({
      lossless: true,
      effort: 9
    }).toBuffer();
  }

  if (file.mimetype === 'image/tiff') {
    return image.tiff({
      compression: 'lzw'
    }).toBuffer();
  }

  return null;
};

const optimizeJpeg = async (file, tempPath) => {
  await execFileAsync(jpegtran, [
    '-copy',
    'none',
    '-optimize',
    '-outfile',
    tempPath,
    file.path
  ]);
};

const optimizeFile = async (file) => {
  if (!file?.path) return;

  const originalSize = (await fs.stat(file.path)).size;
  file.size = originalSize;

  if (!compressibleImageTypes.has(file.mimetype)) {
    file.compression = {
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      skipped: true,
      reason: 'unsupported-lossless-media-type'
    };
    return;
  }

  const tempPath = `${file.path}.optimized`;
  try {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/pjpeg') {
      try {
        await optimizeJpeg(file, tempPath);
      } catch (error) {
        file.compression = {
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          skipped: true,
          reason: 'compression-failed'
        };
        console.warn(
          `[upload-compression] skipped ${file.filename || file.originalname || file.path}: ${error.message}`
        );
        return;
      }
    } else {
      let optimizedBuffer;
      try {
        optimizedBuffer = await getOptimizedBuffer(file);
      } catch (error) {
        file.compression = {
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          skipped: true,
          reason: 'compression-failed'
        };
        console.warn(
          `[upload-compression] skipped ${file.filename || file.originalname || file.path}: ${error.message}`
        );
        return;
      }

      if (!optimizedBuffer) {
        file.compression = {
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          skipped: true,
          reason: 'optimizer-unavailable-or-animated'
        };
        return;
      }

      await fs.writeFile(tempPath, optimizedBuffer);
    }

    const optimizedSize = (await fs.stat(tempPath)).size;

    if (optimizedSize >= originalSize) {
      await fs.unlink(tempPath);
      file.compression = {
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        skipped: true,
        reason: 'optimized-file-not-smaller'
      };
      return;
    }

    await fs.rename(tempPath, file.path);

    file.size = optimizedSize;
    file.compression = {
      originalSize,
      compressedSize: optimizedSize,
      savedBytes: originalSize - optimizedSize,
      skipped: false
    };

    console.info(
      `[upload-compression] ${file.filename || file.originalname || file.path}: ` +
      `${originalSize} -> ${optimizedSize} bytes`
    );
  } catch (error) {
    await fs.unlink(tempPath).catch(() => {});
    throw error;
  }
};

const losslessImageCompression = async (req, res, next) => {
  try {
    const files = getUploadedFiles(req);
    await Promise.all(files.map(optimizeFile));
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { losslessImageCompression };
