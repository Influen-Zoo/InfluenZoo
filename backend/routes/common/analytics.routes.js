const express = require('express');
const analyticsController = require('../../controllers/common/analytics.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { brandOnly } = require('../../middleware/brand/brand.middleware');

const router = express.Router();

router.post('/events', authMiddleware, analyticsController.ingestEvent);
router.post('/aggregate', authMiddleware, analyticsController.runAggregation);
router.get('/users/:userId', authMiddleware, analyticsController.getUserAnalyticsV2);
router.get('/content/:contentType/:contentId', authMiddleware, analyticsController.getContentAnalyticsV2);
router.get('/admin/dashboard', authMiddleware, analyticsController.getAdminDashboardAnalyticsV2);
router.get('/trending', authMiddleware, analyticsController.getTrending);
router.get('/comparison/users/:userId', authMiddleware, analyticsController.getComparison);

// Brand Analytics (Requires brand permissions)
router.get('/brand', authMiddleware, brandOnly, analyticsController.getBrandAnalytics);

// Specific Campaign Analytics
router.get('/campaign/:campaignId', authMiddleware, analyticsController.getCampaignAnalytics);

module.exports = router;
