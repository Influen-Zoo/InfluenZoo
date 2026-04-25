const express = require('express');
const analyticsController = require('../../controllers/common/analytics.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { brandOnly } = require('../../middleware/brand/brand.middleware');

const router = express.Router();

// Brand Analytics (Requires brand permissions)
router.get('/brand', authMiddleware, brandOnly, analyticsController.getBrandAnalytics);

// Specific Campaign Analytics
router.get('/campaign/:campaignId', authMiddleware, analyticsController.getCampaignAnalytics);

module.exports = router;
