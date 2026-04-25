const { influencerBrandService } = require('../../services/influencer/brand.service');

const influencerBrandController = {
  getNewBrands: async (req, res) => {
    try {
      const brands = await influencerBrandService.getNewBrands(req.userId);
      res.json({ success: true, brands });
    } catch (error) {
      console.error('Get New Brands Error:', error);
      res.status(500).json({ error: 'Failed to fetch new brands' });
    }
  },

  getFollowedBrands: async (req, res) => {
    try {
      const brands = await influencerBrandService.getFollowedBrands(req.userId);
      res.json({ success: true, brands });
    } catch (error) {
      console.error('Get Followed Brands Error:', error);
      res.status(500).json({ error: 'Failed to fetch followed brands' });
    }
  }
};

module.exports = influencerBrandController;
