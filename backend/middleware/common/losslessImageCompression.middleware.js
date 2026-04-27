const fs = require('fs/promises');
const sharp = require('sharp');

const compressibleImageTypes = new Set(['image/png', 'image/x-png', 'image/webp']);

const getUploadedFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
  return [];
};

const getOptimizedBuffer = async (file) => {
  const image = sharp(file.path, { animated: false });

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

  return null;
};

const optimizeFile = async (file) => {
  if (!file?.path || !compressibleImageTypes.has(file.mimetype)) return;

  const originalSize = file.size;
  const optimizedBuffer = await getOptimizedBuffer(file);

  if (!optimizedBuffer || optimizedBuffer.length >= originalSize) {
    file.compression = {
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0
    };
    return;
  }

  const tempPath = `${file.path}.optimized`;
  await fs.writeFile(tempPath, optimizedBuffer);
  await fs.rename(tempPath, file.path);

  file.size = optimizedBuffer.length;
  file.compression = {
    originalSize,
    compressedSize: optimizedBuffer.length,
    savedBytes: originalSize - optimizedBuffer.length
  };

  console.info(
    `[upload-compression] ${file.filename || file.originalname || file.path}: ` +
    `${originalSize} -> ${optimizedBuffer.length} bytes`
  );
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
