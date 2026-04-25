const { influencerCampaignService } = require('../../services/influencer/campaign.service');

const influencerCampaignController = {
  getCampaigns: async (req, res) => {
    try {
      const { type } = req.query;
      const campaigns = await influencerCampaignService.getCampaigns(req.userId, type);
      res.json({ success: true, campaigns });
    } catch (error) {
      console.error('Get Campaigns Error:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  },

  likeCampaign: async (req, res) => {
    try {
      const likes = await influencerCampaignService.likeCampaign(req.params.id, req.userId);
      res.json({ success: true, likes });
    } catch (error) {
      if (error.message === 'Campaign not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Failed to like campaign' });
    }
  },

  commentOnCampaign: async (req, res) => {
    try {
      const comments = await influencerCampaignService.commentOnCampaign(req.params.id, req.userId, req.body.text);
      res.json({ success: true, comments });
    } catch (error) {
      if (error.message === 'Comment text is required') return res.status(400).json({ error: error.message });
      if (error.message === 'Campaign not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Failed to comment' });
    }
  }
};

module.exports = influencerCampaignController;
