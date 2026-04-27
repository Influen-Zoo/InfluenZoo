const { userService, influencerService } = require('../../services/common/user.service');
const youtubeOAuthService = require('../../services/common/youtubeOAuth.service');

const userController = {
  getProfile: async (req, res) => {
    try {
      const profile = await userService.getProfile(req.params.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await userService.updateProfile(req.userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  saveUserBio: async (req, res) => {
    try {
      const bio = await userService.saveUserBio(req.userId, req.body);
      res.json({ success: true, data: bio });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  addEducation: async (req, res) => {
    try {
      const education = await userService.addEducation(req.userId, req.body);
      res.json({ success: true, data: education });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateEducation: async (req, res) => {
    try {
      const education = await userService.updateEducation(req.userId, req.params.id, req.body);
      res.json({ success: true, data: education });
    } catch (error) {
      if (error.message === 'Education record not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteEducation: async (req, res) => {
    try {
      await userService.deleteEducation(req.userId, req.params.id);
      res.json({ success: true, message: 'Educational record deleted' });
    } catch (error) {
      if (error.message === 'Education record not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  addWork: async (req, res) => {
    try {
      const work = await userService.addWork(req.userId, req.body);
      res.json({ success: true, data: work });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateWork: async (req, res) => {
    try {
      const work = await userService.updateWork(req.userId, req.params.id, req.body);
      res.json({ success: true, data: work });
    } catch (error) {
      if (error.message === 'Work record not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteWork: async (req, res) => {
    try {
      await userService.deleteWork(req.userId, req.params.id);
      res.json({ success: true, message: 'Work record deleted' });
    } catch (error) {
      if (error.message === 'Work record not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const users = await userService.searchUsers(req.query.q);
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  getStats: async (req, res) => {
    try {
      const stats = await userService.getStats(req.params.userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  // From influencer service
  getInfluencersForBrands: async (req, res) => {
    try {
      const influencers = await influencerService.getInfluencersForBrands(req.query);
      res.json({ success: true, data: influencers });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  followUser: async (req, res) => {
    try {
      await influencerService.followUser(req.userId, req.params.userId);
      res.json({ success: true, message: 'Successfully followed user' });
    } catch (error) {
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      if (error.message.includes('yourself')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      await influencerService.unfollowUser(req.userId, req.params.userId);
      res.json({ success: true, message: 'Successfully unfollowed user' });
    } catch (error) {
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  isFollowing: async (req, res) => {
    try {
      const isFollowing = await influencerService.isFollowing(req.userId, req.params.userId);
      res.json({ success: true, data: { isFollowing } });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  connectSocialMedia: async (req, res) => {
    try {
      const user = await influencerService.connectSocialMedia(req.userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      if (error.message === 'Invalid platform') return res.status(400).json({ error: error.message });
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      if (
        error.message.includes('required to fetch') ||
        error.message.includes('Unable to fetch') ||
        error.message.includes('Unable to find') ||
        error.message === 'Social account identifier is required'
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  getYouTubeAuthUrl: async (req, res) => {
    try {
      const authUrl = youtubeOAuthService.createAuthUrl(req.userId);
      res.json({ success: true, data: { authUrl } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  handleYouTubeCallback: async (req, res) => {
    const frontendUrl = youtubeOAuthService.getFrontendRedirectUrl();

    try {
      const userId = await youtubeOAuthService.handleCallback(req.query);
      res.redirect(`${frontendUrl}/profile/${userId}?youtube=connected`);
    } catch (error) {
      const message = encodeURIComponent(error.message || 'YouTube connection failed');
      res.redirect(`${frontendUrl}/auth?youtubeError=${message}`);
    }
  },

  disconnectSocialMedia: async (req, res) => {
    try {
      const user = await influencerService.disconnectSocialMedia(req.userId, req.params.platform);
      res.json({ success: true, data: user });
    } catch (error) {
      if (error.message === 'Invalid platform') return res.status(400).json({ error: error.message });
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  toggleSaveCampaign: async (req, res) => {
    try {
      const savedCampaigns = await influencerService.toggleSaveCampaign(req.userId, req.params.id);
      res.json({ success: true, savedCampaigns, saved: savedCampaigns.includes(req.params.id) });
    } catch (error) {
      if (error.message === 'User not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = userController;
