const User = require('../../models/User');

const influencerBrandService = {
  getNewBrands: async (userId) => {
    let excludeIds = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.following) {
        excludeIds = [...user.following, userId];
      } else {
        excludeIds = [userId];
      }
    }

    return await User.find({ 
      role: 'brand',
      _id: { $nin: excludeIds }
    })
      .select('name avatar banner bio category location followers following createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
  },

  getFollowedBrands: async (userId) => {
    const user = await User.findById(userId).populate({
      path: 'following',
      match: { role: 'brand' },
      select: 'name avatar banner bio category location followers following'
    });
    
    if (!user) return [];
    return user.following || [];
  }
};

module.exports = { influencerBrandService };
