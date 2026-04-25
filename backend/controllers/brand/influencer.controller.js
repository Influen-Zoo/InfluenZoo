const { brandInfluencerService } = require('../../services/brand/influencer.service');

const brandInfluencerController = {
  getNewInfluencers: async (req, res) => {
    try {
      const influencers = await brandInfluencerService.getNewInfluencers(req.userId);
      res.json({ success: true, influencers });
    } catch (error) {
      console.error('Get New Influencers Error:', error);
      res.status(500).json({ error: 'Failed to fetch new influencers' });
    }
  },

  getFollowedInfluencers: async (req, res) => {
    try {
      const influencers = await brandInfluencerService.getFollowedInfluencers(req.userId);
      res.json({ success: true, influencers });
    } catch (error) {
      console.error('Get Followed Influencers Error:', error);
      res.status(500).json({ error: 'Failed to fetch followed influencers' });
    }
  }
};

module.exports = brandInfluencerController;
