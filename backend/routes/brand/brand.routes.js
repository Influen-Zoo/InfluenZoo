const express = require('express');
const mongoose = require('mongoose');
const brandCampaignController = require('../../controllers/brand/campaign.controller');
const brandApplicationController = require('../../controllers/brand/application.controller');
const brandInfluencerController = require('../../controllers/brand/influencer.controller');
const brandProfileController = require('../../controllers/brand/profile.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { brandOnly } = require('../../middleware/brand/brand.middleware');
const { losslessImageCompression } = require('../../middleware/common/losslessImageCompression.middleware');
const { createUpload, uploadFolders } = require('../../utils/uploadStorage');

const router = express.Router();
const MAX_MEDIA_FILE_SIZE = 25 * 1024 * 1024;

const assignCampaignUploadId = (req, res, next) => {
  req.uploadEntityId = req.params.id || new mongoose.Types.ObjectId().toString();
  next();
};

const upload = createUpload({
  getFolderParts: () => uploadFolders.brandCampaign,
  getEntityId: (req) => req.uploadEntityId || req.params.id || req.userId,
  limits: { fileSize: MAX_MEDIA_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const validPrefixes = ['image/', 'video/', 'audio/'];
    if (validPrefixes.some(p => file.mimetype.startsWith(p))) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Brand Campaign Management
router.post('/campaigns', authMiddleware, brandOnly, assignCampaignUploadId, upload.array('media', 4), losslessImageCompression, brandCampaignController.createCampaign);
router.get('/campaigns/my', authMiddleware, brandOnly, brandCampaignController.getMyCampaigns);
router.put('/campaigns/:id', authMiddleware, brandOnly, assignCampaignUploadId, upload.array('media', 4), losslessImageCompression, brandCampaignController.updateCampaign);
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
