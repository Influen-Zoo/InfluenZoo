const express = require('express');
const adminController = require('../../controllers/admin/admin.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { adminOnly } = require('../../middleware/admin/admin.middleware');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform overview statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering
 * @access  Private (Admin)
 */
router.get('/users', adminController.getUsers);
router.get('/posts', adminController.getPosts);

/**
 * @route   PUT /api/admin/users/:id/verify
 * @desc    Toggle user verification status
 * @access  Private (Admin)
 */
router.put('/users/:id/verify', adminController.verifyUser);

/**
 * @route   GET /api/admin/campaigns
 * @desc    Get all campaigns
 * @access  Private (Admin)
 */
router.get('/campaigns', adminController.getCampaigns);

/**
 * @route   PUT /api/admin/campaigns/:id/status
 * @desc    Change campaign status
 * @access  Private (Admin)
 */
router.put('/campaigns/:id/status', adminController.updateCampaignStatus);

/**
 * @route   PUT /api/admin/users/:id/followers
 * @desc    Set influencer followers
 * @access  Private (Admin)
 */
router.put('/users/:id/followers', adminController.updateUserFollowers);
router.put('/posts/:id/likes', adminController.updatePostLikes);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get platform analytics
 * @access  Private (Admin)
 */
router.get('/analytics', adminController.getAnalytics);

// Advanced Analytics Routes
const adminAnalyticsController = require('../../controllers/admin/adminAnalytics.controller');
router.get('/analytics/overview', adminAnalyticsController.getOverview);
router.get('/analytics/posts', adminAnalyticsController.getPostsAnalytics);
router.get('/analytics/campaigns', adminAnalyticsController.getCampaignsAnalytics);
router.get('/analytics/influencers', adminAnalyticsController.getInfluencersAnalytics);
router.get('/analytics/brands', adminAnalyticsController.getBrandsAnalytics);
router.get('/analytics/revenue', adminAnalyticsController.getRevenueAnalytics);

/**
 * @route   GET /api/admin/announcements
 * @desc    Get all campaigns (unified model)
 * @access  Private (Admin)
 */
router.get('/announcements', adminController.getAnnouncements);

/**
 * @route   GET /api/admin/disputes
 * @desc    List all platform disputes
 * @access  Private (Admin)
 */
router.get('/disputes', adminController.getDisputes);

/**
 * @route   PUT /api/admin/announcements/:id/cost
 * @desc    Set coin cost on a campaign
 * @access  Private (Admin)
 */
router.put('/announcements/:id/cost', adminController.updateAnnouncementCost);

/**
 * @route   PUT /api/admin/campaigns/:id/cost
 * @desc    Set coin cost on a campaign (alias for announcements)
 * @access  Private (Admin)
 */
router.put('/campaigns/:id/cost', adminController.updateAnnouncementCost);

/**
 * @route   GET /api/admin/fee-structure
 * @desc    Get platform fee structure (campaign fee, application fee)
 * @access  Private (Admin)
 */
router.get('/fee-structure', adminController.getFeeStructure);

/**
 * @route   PUT /api/admin/fee-structure
 * @desc    Update platform fee structure
 * @access  Private (Admin)
 */
router.put('/fee-structure', adminController.updateFeeStructure);

router.get('/razorpay-settings', adminController.getRazorpaySettings);
router.put('/razorpay-settings', adminController.updateRazorpaySettings);

/**
 * @route   PUT /api/admin/posts/:id/block
 * @desc    Block a post from public view
 * @access  Private (Admin)
 */
router.put('/posts/:id/block', adminController.blockPost);

/**
 * @route   PUT /api/admin/posts/:id/unblock
 * @desc    Unblock a post
 * @access  Private (Admin)
 */
router.put('/posts/:id/unblock', adminController.unblockPost);

/**
 * @route   PUT /api/admin/campaigns/:id/block
 * @desc    Block a campaign from public view
 * @access  Private (Admin)
 */
router.put('/campaigns/:id/block', adminController.blockCampaign);

/**
 * @route   PUT /api/admin/campaigns/:id/unblock
 * @desc    Unblock a campaign
 * @access  Private (Admin)
 */
router.put('/campaigns/:id/unblock', adminController.unblockCampaign);

router.get('/campaigns/:id/applications', adminController.getCampaignApplications);

module.exports = router;
