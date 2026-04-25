const User = require('../../models/User');

const brandInfluencerService = {
  getNewInfluencers: async (brandId) => {
    let excludeIds = [];
    if (brandId) {
      const brand = await User.findById(brandId);
      if (brand && brand.following) {
        excludeIds = [...brand.following, brandId];
      } else {
        excludeIds = [brandId];
      }
    }

    return await User.find({ 
      role: 'influencer',
      _id: { $nin: excludeIds }
    })
      .select('name avatar bio category niche followers engagement location createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
  },

  getFollowedInfluencers: async (brandId) => {
    const brand = await User.findById(brandId).populate({
      path: 'following',
      match: { role: 'influencer' },
      select: 'name avatar bio category niche followers engagement location'
    });
    
    if (!brand) return [];
    return brand.following || [];
  }
};

module.exports = { brandInfluencerService };
