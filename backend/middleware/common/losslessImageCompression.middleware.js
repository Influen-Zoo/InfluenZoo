const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const sharp = require('sharp');
const ffmpegBin = require('ffmpeg-static');

const execFileAsync = promisify(execFile);
const ffmpeg = ffmpegBin.default || ffmpegBin;
const MAX_IMAGE_DIMENSION = 2048;
const VIDEO_MIN_SAVINGS_RATIO = 0.08;
const VIDEO_MAX_DIMENSION = 1280;
const VIDEO_CRF = 28;

const jpegTypes = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg']);
const fastStartVideoExtensions = new Set(['.mp4', '.m4v', '.mov', '.qt']);
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

const detectImageType = async (filePath, fallbackType) => {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(24);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const bytes = buffer.subarray(0, bytesRead);
    const signature = bytes.toString('hex');
    const boxBrand = bytes.subarray(8, 12).toString('ascii');

    if (signature.startsWith('ffd8ff')) return 'image/jpeg';
    if (signature.startsWith('89504e470d0a1a0a')) return 'image/png';
    if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
      return 'image/webp';
    }
    if (signature.startsWith('49492a00') || signature.startsWith('4d4d002a')) return 'image/tiff';
    if (boxBrand === 'heic' || boxBrand === 'heix' || boxBrand === 'hevc' || boxBrand === 'hevx' || boxBrand === 'mif1') {
      return 'image/heic';
    }
    if (boxBrand === 'avif') return 'image/avif';

    return fallbackType;
  } finally {
    await handle.close();
  }
};

const getOptimizedBuffer = async (file) => {
  const image = sharp(file.path, { animated: false });
  const metadata = await image.metadata();

  if ((metadata.pages || 1) > 1) {
    return null;
  }

  const shouldResize = (metadata.width || 0) > MAX_IMAGE_DIMENSION || (metadata.height || 0) > MAX_IMAGE_DIMENSION;
  const pipeline = shouldResize
    ? image.resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      })
    : image;

  if (file.detectedType === 'image/png' || file.detectedType === 'image/x-png') {
    return pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      effort: 10
    }).toBuffer();
  }

  if (file.detectedType === 'image/webp') {
    return pipeline.webp({
      lossless: true,
      effort: 6
    }).toBuffer();
  }

  if (file.detectedType === 'image/avif') {
    return pipeline.avif({
      lossless: true,
      effort: 9
    }).toBuffer();
  }

  if (file.detectedType === 'image/tiff') {
    return pipeline.tiff({
      compression: 'lzw'
    }).toBuffer();
  }

  return null;
};

const getImageMetadata = async (filePath) => sharp(filePath, { animated: false }).metadata();

const optimizeJpeg = async (file, tempPath, metadata) => {
  const shouldResize = (metadata.width || 0) > MAX_IMAGE_DIMENSION || (metadata.height || 0) > MAX_IMAGE_DIMENSION;

  let pipeline = sharp(file.path, { animated: false }).rotate();

  if (shouldResize) {
    pipeline = pipeline.resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  await pipeline
    .jpeg({
      quality: shouldResize ? 85 : 90,
      mozjpeg: true
    })
    .toFile(tempPath);
};

const isVideoFile = (file) => file?.mimetype?.startsWith('video/');

const getTempPath = (file) => {
  if (!isVideoFile(file)) return `${file.path}.optimized`;
  return `${file.path}.optimized.mp4`;
};

const remuxVideo = async (file, tempPath) => {
  if (!ffmpeg) throw new Error('ffmpeg binary is not available');

  const extension = path.extname(file.originalname || file.filename || file.path).toLowerCase();
  const args = ['-y', '-i', file.path, '-map', '0', '-c', 'copy', '-map_metadata', '-1'];

  if (fastStartVideoExtensions.has(extension)) {
    args.push('-movflags', '+faststart');
  }

  args.push(tempPath);
  await execFileAsync(ffmpeg, args);
};

const transcodeVideo = async (file, tempPath) => {
  if (!ffmpeg) throw new Error('ffmpeg binary is not available');

  await execFileAsync(ffmpeg, [
    '-y',
    '-i',
    file.path,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-vf',
    `scale='if(gt(iw,ih),min(${VIDEO_MAX_DIMENSION},iw),-2)':'if(gt(iw,ih),-2,min(${VIDEO_MAX_DIMENSION},ih))'`,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    String(VIDEO_CRF),
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    '-map_metadata',
    '-1',
    tempPath
  ]);
};

const optimizeVideo = async (file, tempPath, originalSize) => {
  const remuxPath = `${file.path}.remuxed.mp4`;

  try {
    await remuxVideo(file, remuxPath);
    const remuxedSize = (await fs.stat(remuxPath)).size;
    const remuxSavingsRatio = (originalSize - remuxedSize) / originalSize;

    if (remuxedSize < originalSize && remuxSavingsRatio >= VIDEO_MIN_SAVINGS_RATIO) {
      await fs.rename(remuxPath, tempPath);
      return 'lossless-remux';
    }
  } catch {
    // Fall back to transcode below.
  }

  await fs.unlink(remuxPath).catch(() => {});
  await transcodeVideo(file, tempPath);
  return 'transcode';
};

const optimizeFile = async (file) => {
  if (!file?.path) return;

  const originalSize = (await fs.stat(file.path)).size;
  file.size = originalSize;
  file.detectedType = await detectImageType(file.path, file.mimetype);
  let originalMetadata = null;

  if (!compressibleImageTypes.has(file.detectedType) && !isVideoFile(file)) {
    file.compression = {
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      skipped: true,
      reason: 'unsupported-lossless-media-type',
      detectedType: file.detectedType
    };
    return;
  }

  const tempPath = getTempPath(file);
  const backupPath = `${file.path}.original`;
  try {
    if (compressibleImageTypes.has(file.detectedType)) {
      try {
        originalMetadata = await getImageMetadata(file.path);
      } catch {
        originalMetadata = null;
      }
    }

    if (isVideoFile(file)) {
      let videoCompressionMode = null;
      try {
        videoCompressionMode = await optimizeVideo(file, tempPath, originalSize);
      } catch (error) {
        file.compression = {
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          skipped: true,
          reason: 'video-lossless-compression-failed'
        };
        console.warn(
          `[upload-compression] skipped ${file.filename || file.originalname || file.path}: ${error.message}`
        );
        return;
      }
      file.videoCompressionMode = videoCompressionMode;
    } else if (jpegTypes.has(file.detectedType)) {
      try {
        await optimizeJpeg(file, tempPath, originalMetadata || {});
      } catch (error) {
        file.compression = {
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          skipped: true,
          reason: 'compression-failed',
          detectedType: file.detectedType
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
          reason: 'compression-failed',
          detectedType: file.detectedType
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
          reason: 'optimizer-unavailable-or-animated',
          detectedType: file.detectedType
        };
        return;
      }

      await fs.writeFile(tempPath, optimizedBuffer);
    }

    const optimizedSize = (await fs.stat(tempPath)).size;
    const wasResized = Boolean(
      originalMetadata &&
      ((originalMetadata.width || 0) > MAX_IMAGE_DIMENSION || (originalMetadata.height || 0) > MAX_IMAGE_DIMENSION)
    );

    if (!wasResized && optimizedSize >= originalSize) {
      await fs.unlink(tempPath);
      file.compression = {
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        skipped: true,
        reason: 'optimized-file-not-smaller',
        detectedType: file.detectedType
      };
      return;
    }

    await fs.copyFile(file.path, backupPath);
    await fs.rename(tempPath, file.path);
    const finalSize = (await fs.stat(file.path)).size;

    if (!wasResized && finalSize >= originalSize) {
      await fs.rename(backupPath, file.path);
      file.size = originalSize;
      file.compression = {
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        skipped: true,
        reason: 'final-file-not-smaller-restored',
        detectedType: file.detectedType
      };
      return;
    }

    await fs.unlink(backupPath);

    file.size = finalSize;
    file.compression = {
      originalSize,
      compressedSize: finalSize,
      savedBytes: originalSize - finalSize,
      skipped: false,
      detectedType: file.detectedType,
      resized: wasResized,
      videoCompressionMode: file.videoCompressionMode || null,
      originalWidth: originalMetadata?.width || null,
      originalHeight: originalMetadata?.height || null
    };

    console.info(
      `[upload-compression] ${file.filename || file.originalname || file.path}: ` +
      `${originalSize} -> ${finalSize} bytes`
    );
  } catch (error) {
    await fs.unlink(tempPath).catch(() => {});
    await fs.rename(backupPath, file.path).catch(() => {});
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
