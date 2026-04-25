const express = require('express');
const multer = require('multer');
const fs = require('fs');
const userController = require('../../controllers/common/user.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed!'));
  }
});

router.get('/profile/:id', userController.getProfile);

router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a file' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
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
router.delete('/social-media/disconnect/:platform', authMiddleware, userController.disconnectSocialMedia);

router.get('/:userId/stats', userController.getStats);
router.post('/campaigns/:id/toggle-save', authMiddleware, userController.toggleSaveCampaign);

module.exports = router;
