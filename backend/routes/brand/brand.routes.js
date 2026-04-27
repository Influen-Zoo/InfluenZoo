const express = require('express');
const multer = require('multer');
const fs = require('fs');
const brandCampaignController = require('../../controllers/brand/campaign.controller');
const brandApplicationController = require('../../controllers/brand/application.controller');
const brandInfluencerController = require('../../controllers/brand/influencer.controller');
const brandProfileController = require('../../controllers/brand/profile.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { brandOnly } = require('../../middleware/brand/brand.middleware');
const { losslessImageCompression } = require('../../middleware/common/losslessImageCompression.middleware');

const router = express.Router();

// Ensure uploads directory exists
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
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validPrefixes = ['image/', 'video/', 'audio/'];
    if (validPrefixes.some(p => file.mimetype.startsWith(p))) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Brand Campaign Management
router.post('/campaigns', authMiddleware, brandOnly, upload.array('media', 4), losslessImageCompression, brandCampaignController.createCampaign);
router.get('/campaigns/my', authMiddleware, brandOnly, brandCampaignController.getMyCampaigns);
router.put('/campaigns/:id', authMiddleware, brandOnly, upload.array('media', 4), losslessImageCompression, brandCampaignController.updateCampaign);
router.delete('/campaigns/:id', authMiddleware, brandOnly, brandCampaignController.deleteCampaign);

// Brand Application Review
router.get('/campaigns/:campaignId/applications', authMiddleware, brandOnly, brandApplicationController.getCampaignApplications);
router.put('/applications/:id/accept', authMiddleware, brandOnly, brandApplicationController.acceptApplication);
router.put('/applications/:id/reject', authMiddleware, brandOnly, brandApplicationController.rejectApplication);

// Influencer Discovery
router.get('/influencers/new', authMiddleware, brandOnly, brandInfluencerController.getNewInfluencers);
router.get('/influencers/followed', authMiddleware, brandOnly, brandInfluencerController.getFollowedInfluencers);

// Brand Profile Management
router.get('/profile', authMiddleware, brandOnly, brandProfileController.getSelfProfile);
router.get('/profile/:id', brandProfileController.getProfileById);
router.post('/profile', authMiddleware, brandOnly, brandProfileController.createOrUpdateProfile);
router.put('/profile', authMiddleware, brandOnly, brandProfileController.createOrUpdateProfile);

module.exports = router;
