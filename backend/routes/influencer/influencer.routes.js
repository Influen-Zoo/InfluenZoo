const express = require('express');
const influencerCampaignController = require('../../controllers/influencer/campaign.controller');
const influencerApplicationController = require('../../controllers/influencer/application.controller');
const influencerBrandController = require('../../controllers/influencer/brand.controller');
const influencerAnalyticsController = require('../../controllers/influencer/analytics.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { influencerOnly } = require('../../middleware/influencer/influencer.middleware');

const router = express.Router();

// Influencer Campaign Exploration
router.get('/campaigns', influencerCampaignController.getCampaigns);
router.post('/campaigns/:id/like', authMiddleware, influencerCampaignController.likeCampaign);
router.post('/campaigns/:id/comment', authMiddleware, influencerCampaignController.commentOnCampaign);

// Influencer Application Tracking
router.post('/applications', authMiddleware, influencerOnly, influencerApplicationController.applyToCampaign);
router.get('/applications/my', authMiddleware, influencerOnly, influencerApplicationController.getMyApplications);

// Brand Discovery
router.get('/brands/new', authMiddleware, influencerOnly, influencerBrandController.getNewBrands);
router.get('/brands/followed', authMiddleware, influencerOnly, influencerBrandController.getFollowedBrands);

// Influencer Analytics
router.get('/analytics', authMiddleware, influencerOnly, influencerAnalyticsController.getDashboardAnalytics);

module.exports = router;
