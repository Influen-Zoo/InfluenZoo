const adminAnalyticsService = require('../../services/admin/adminAnalytics.service');

exports.getOverview = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = { startDate, endDate };
    const data = await adminAnalyticsService.getOverviewAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getPostsAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = {
      startDate,
      endDate,
      postId: req.query.postId
    };
    const data = await adminAnalyticsService.getPostAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getCampaignsAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = {
      startDate,
      endDate,
      campaignId: req.query.campaignId
    };
    const data = await adminAnalyticsService.getCampaignAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getInfluencersAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = {
      startDate,
      endDate,
      influencerId: req.query.influencerId
    };
    const data = await adminAnalyticsService.getInfluencerAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching influencer analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getBrandsAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = {
      startDate,
      endDate,
      brandId: req.query.brandId
    };
    const data = await adminAnalyticsService.getBrandAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching brand analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    if (!req.query.startDate) {
      startDate.setDate(endDate.getDate() - days);
    }

    const filters = { startDate, endDate };
    const data = await adminAnalyticsService.getRevenueAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
