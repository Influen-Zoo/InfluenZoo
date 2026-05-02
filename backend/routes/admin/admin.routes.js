const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const adminController = require('../../controllers/admin/admin.controller');
const brandLogoController = require('../../controllers/admin/brandLogo.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { adminOnly } = require('../../middleware/admin/admin.middleware');
const { createUpload, uploadFolders } = require('../../utils/uploadStorage');

const router = express.Router();

const brandLogoUpload = createUpload({
  getFolderParts: () => uploadFolders.adminData,
  getEntityId: (req) => req.params.id || req.userId,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') cb(null, true);
    else cb(new Error('Only transparent PNG logos are allowed'));
  },
});

const badgeIconUpload = createUpload({
  getFolderParts: () => uploadFolders.adminData,
  getEntityId: (req) => req.params.id || req.userId,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB for badges
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for badges'));
  },
});

const trimBrandLogo = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const trimmed = await sharp(req.file.path)
      .trim({
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        threshold: 10,
      })
      .resize(400, 200, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    await fs.promises.writeFile(req.file.path, trimmed);
    return next();
  } catch (error) {
    return next(error);
  }
};

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

router.get('/carousel-settings', brandLogoController.getBrandLogoSettings);
router.put('/carousel-settings', brandLogoController.updateBrandLogoSettings);
router.get('/razorpay-settings', adminController.getRazorpaySettings);
router.put('/razorpay-settings', adminController.updateRazorpaySettings);
router.get('/brand-logos', brandLogoController.getAdminBrandLogos);
router.post('/brand-logos', brandLogoUpload.single('logo'), trimBrandLogo, brandLogoController.createBrandLogo);
router.put('/brand-logos/:id', brandLogoUpload.single('logo'), trimBrandLogo, brandLogoController.updateBrandLogo);
router.delete('/brand-logos/:id', brandLogoController.deleteBrandLogo);

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

/**
 * Badge Routes
 */
router.get('/badges', adminController.getBadges);
router.post('/badges', badgeIconUpload.single('icon'), adminController.createBadge);
router.put('/badges/:id', badgeIconUpload.single('icon'), adminController.updateBadge);
router.delete('/badges/:id', adminController.deleteBadge);

/**
 * User Badge Assignment
 */
router.post('/users/:userId/badges/:badgeId', adminController.assignBadge);
router.delete('/users/:userId/badges/:badgeId', adminController.removeBadge);

module.exports = router;
