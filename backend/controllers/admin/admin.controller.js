const adminService = require('../../services/admin/admin.service');

/**
 * GET /api/admin/stats
 * Platform overview statistics
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/users
 * List all users with filtering
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await adminService.getUsers(filter);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/users/:id/verify
 * Toggle user verification status
 */
exports.verifyUser = async (req, res) => {
  try {
    const user = await adminService.toggleUserVerification(req.params.id);
    res.json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/campaigns
 * List all campaigns
 */
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await adminService.getCampaigns(req.query.status);
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/campaigns/:id/status
 * Change campaign status
 */
exports.updateCampaignStatus = async (req, res) => {
  try {
    const campaign = await adminService.updateCampaignStatus(req.params.id, req.body.status);
    res.json({ success: true, data: campaign });
  } catch (error) {
    const status = error.message === 'Campaign not found' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

exports.getCampaignApplications = async (req, res) => {
  try {
    const applications = await adminService.getCampaignApplications(req.params.id);
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/users/:id/followers
 * Set influencer followers count
 */
exports.updateUserFollowers = async (req, res) => {
  try {
    const user = await adminService.updateUserFollowers(req.params.id, req.body.followers);
    res.json({ 
      success: true, 
      data: user.toJSON(),
      message: `Followers updated to ${req.body.followers} for ${user.name}`
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/posts/:id/likes
 * Set post like count
 */
exports.updatePostLikes = async (req, res) => {
  try {
    const post = await adminService.updatePostLikes(req.params.id, req.body.likes);
    res.json({
      success: true,
      data: post,
      message: `Likes updated to ${req.body.likes}`
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

/**
 * GET /api/admin/analytics
 * Platform analytics overview
 */
exports.getAnalytics = async (req, res) => {
  try {
    const data = await adminService.getAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/announcements
 * List all campaigns (unified model)
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const campaigns = await adminService.getAnnouncements();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/announcements/:id/cost
 * Set coin cost on a campaign
 */
exports.updateAnnouncementCost = async (req, res) => {
  try {
    const { cost } = req.body;
    const campaignId = req.params.id;
    
    console.log('🔄 Update campaign cost - ID:', campaignId, 'Cost:', cost, 'User:', req.userId);
    
    if (!cost && cost !== 0) {
      return res.status(400).json({ error: 'Cost value is required' });
    }
    
    const campaign = await adminService.updateAnnouncementCost(campaignId, cost);
    console.log('✅ Campaign updated successfully:', campaign._id, 'New cost:', campaign.coinCost);
    
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('❌ Update announcement cost error:', error.message, error.stack);
    res.status(error.message === 'Campaign not found' ? 404 : 500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/disputes
 * List all disputes
 */
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await adminService.getDisputes();
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/posts
 * List all posts for selection
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await adminService.getPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/fee-structure
 * Get platform fee structure
 */
exports.getFeeStructure = async (req, res) => {
  try {
    const feeStructure = await adminService.getFeeStructure();
    res.json({ success: true, data: feeStructure });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/fee-structure
 * Update platform fee structure
 */
exports.updateFeeStructure = async (req, res) => {
  try {
    const { campaignFee, applicationFee } = req.body;
    if (campaignFee === undefined && applicationFee === undefined) {
      return res.status(400).json({ error: 'Please provide at least one fee to update' });
    }
    const feeStructure = await adminService.updateFeeStructure(
      campaignFee !== undefined ? campaignFee : undefined,
      applicationFee !== undefined ? applicationFee : undefined
    );
    res.json({ success: true, data: feeStructure });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

/**
 * GET /api/admin/razorpay-settings
 * Get Razorpay coin purchase settings
 */
exports.getRazorpaySettings = async (req, res) => {
  try {
    const settings = await adminService.getRazorpaySettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/razorpay-settings
 * Update Razorpay coin purchase settings
 */
exports.updateRazorpaySettings = async (req, res) => {
  try {
    const settings = await adminService.updateRazorpaySettings(req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

/**
 * PUT /api/admin/posts/:id/block
 * Block a post
 */
exports.blockPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const post = await adminService.blockPost(req.params.id, userId, reason);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Block post error:', error);
    res.status(error.message === 'Post not found' ? 404 : 500).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/posts/:id/unblock
 * Unblock a post
 */
exports.unblockPost = async (req, res) => {
  try {
    const post = await adminService.unblockPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Unblock post error:', error);
    res.status(error.message === 'Post not found' ? 404 : 500).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/campaigns/:id/block
 * Block a campaign
 */
exports.blockCampaign = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const campaign = await adminService.blockCampaign(req.params.id, userId, reason);
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Block campaign error:', error);
    res.status(error.message === 'Campaign not found' ? 404 : 500).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/campaigns/:id/unblock
 * Unblock a campaign
 */
exports.unblockCampaign = async (req, res) => {
  try {
    const campaign = await adminService.unblockCampaign(req.params.id);
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Unblock campaign error:', error);
    res.status(error.message === 'Campaign not found' ? 404 : 500).json({ error: error.message });
  }
};
