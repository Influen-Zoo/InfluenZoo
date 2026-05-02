const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

const uploadFolders = {
  influencerData: ['influencer', 'data'],
  influencerPost: ['influencer', 'post'],
  brandData: ['brand', 'data'],
  brandCampaign: ['brand', 'campaign'],
  adminData: ['admin', 'data'],
};

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const ensureUploadDirectories = () => {
  ensureDirectory(UPLOAD_ROOT);
  Object.values(uploadFolders).forEach((parts) => ensureDirectory(path.join(UPLOAD_ROOT, ...parts)));
};

const sanitizeFilePart = (value, fallback) => {
  const sanitized = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || fallback;
};

const buildUploadFilename = (entityId, originalname) => {
  const extension = path.extname(originalname || '');
  const actualFileName = sanitizeFilePart(path.basename(originalname || '', extension), 'file');
  return `${sanitizeFilePart(entityId, 'unknown')}_${actualFileName}_${Date.now()}${extension}`;
};

const createStorage = ({ getFolderParts, getEntityId }) => multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDirectories();
      const folderParts = getFolderParts(req, file);
      const dir = path.join(UPLOAD_ROOT, ...folderParts);
      ensureDirectory(dir);
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      cb(null, buildUploadFilename(getEntityId(req, file), file.originalname));
    } catch (error) {
      cb(error);
    }
  },
});

const createUpload = ({ getFolderParts, getEntityId, limits, fileFilter }) => multer({
  storage: createStorage({ getFolderParts, getEntityId }),
  limits,
  fileFilter,
});

const getRoleDataFolder = (role) => {
  if (role === 'brand') return uploadFolders.brandData;
  if (role === 'admin') return uploadFolders.adminData;
  return uploadFolders.influencerData;
};

const getUploadUrl = (file) => {
  if (!file?.path) return null;
  const relativePath = path.relative(UPLOAD_ROOT, file.path).replace(/\\/g, '/');
  return `/uploads/${relativePath}`;
};

const resolveUploadPath = (fileRef) => {
  if (!fileRef || typeof fileRef !== 'string') return null;
  if (/^https?:\/\//i.test(fileRef)) return null;

  const normalizedRef = fileRef.replace(/\\/g, '/');
  const uploadIndex = normalizedRef.indexOf('/uploads/');
  const relativeRef = uploadIndex >= 0
    ? normalizedRef.slice(uploadIndex + '/uploads/'.length)
    : normalizedRef.replace(/^uploads\//, '');

  if (!relativeRef || relativeRef.startsWith('..')) return null;

  const resolvedPath = path.resolve(UPLOAD_ROOT, relativeRef);
  if (!resolvedPath.startsWith(UPLOAD_ROOT + path.sep) && resolvedPath !== UPLOAD_ROOT) return null;
  return resolvedPath;
};

const deleteUploadedFile = async (fileRef) => {
  const filePath = resolveUploadPath(fileRef);
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`[upload-cleanup] failed to delete ${fileRef}: ${error.message}`);
    }
  }
};

const deleteUploadedFiles = async (fileRefs = []) => {
  await Promise.all(fileRefs.filter(Boolean).map(deleteUploadedFile));
};

const getMediaUrls = (media = []) => {
  if (!Array.isArray(media)) return [];
  return media.map((item) => item?.url || item).filter(Boolean);
};

const deleteRemovedMedia = async (previousMedia = [], retainedMedia = []) => {
  const retainedUrls = new Set(getMediaUrls(retainedMedia));
  const removedUrls = getMediaUrls(previousMedia).filter((url) => !retainedUrls.has(url));
  await deleteUploadedFiles(removedUrls);
};

module.exports = {
  uploadFolders,
  ensureUploadDirectories,
  createUpload,
  getRoleDataFolder,
  getUploadUrl,
  deleteUploadedFile,
  deleteUploadedFiles,
  deleteRemovedMedia,
  getMediaUrls,
};
