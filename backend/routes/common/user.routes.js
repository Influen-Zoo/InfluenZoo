const express = require('express');
const path = require('path');
const userController = require('../../controllers/common/user.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { losslessImageCompression } = require('../../middleware/common/losslessImageCompression.middleware');
const { createUpload, getRoleDataFolder, getUploadUrl } = require('../../utils/uploadStorage');

const router = express.Router();
const MAX_PROFILE_IMAGE_FILE_SIZE = 25 * 1024 * 1024;
const allowedImageExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.jpe',
  '.jfif',
  '.pjpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.tif',
  '.tiff',
]);

const isImageUpload = (file) => {
  if (file.mimetype?.startsWith('image/')) return true;
  return allowedImageExtensions.has(path.extname(file.originalname || '').toLowerCase());
};

const upload = createUpload({
  getFolderParts: (req) => getRoleDataFolder(req.role),
  getEntityId: (req) => req.userId,
  limits: { fileSize: MAX_PROFILE_IMAGE_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (isImageUpload(file)) cb(null, true);
    else cb(new Error('Only images are allowed!'));
  }
});

router.get('/profile/:id', userController.getProfile);

router.post('/upload', authMiddleware, upload.single('file'), losslessImageCompression, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a file' });
  const fileUrl = getUploadUrl(req.file);
  res.json({ success: true, url: fileUrl, compression: req.file.compression || null });
});

router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/bio', authMiddleware, userController.saveUserBio);

router.post('/education', authMiddleware, userController.addEducation);
router.put('/education/:id', authMiddleware, userController.updateEducation);
router.delete('/education/:id', authMiddleware, userController.deleteEducation);

router.post('/work', authMiddleware, userController.addWork);
router.put('/work/:id', authMiddleware, userController.updateWork);
router.delete('/work/:id', authMiddleware, userController.deleteWork);

router.get('/influencers', userController.getInfluencersForBrands);
router.get('/search', userController.searchUsers);

router.post('/:userId/follow', authMiddleware, userController.followUser);
router.delete('/:userId/unfollow', authMiddleware, userController.unfollowUser);
router.get('/:userId/is-following', authMiddleware, userController.isFollowing);

router.post('/social-media/connect', authMiddleware, userController.connectSocialMedia);
router.get('/social-media/youtube/auth-url', authMiddleware, userController.getYouTubeAuthUrl);
router.get('/social-media/youtube/callback', userController.handleYouTubeCallback);
router.delete('/social-media/disconnect/:platform', authMiddleware, userController.disconnectSocialMedia);

router.get('/:userId/stats', userController.getStats);
router.post('/campaigns/:id/toggle-save', authMiddleware, userController.toggleSaveCampaign);

module.exports = router;
