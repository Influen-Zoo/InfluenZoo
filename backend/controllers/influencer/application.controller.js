const influencerApplicationService = require('../../services/influencer/application.service');

const influencerApplicationController = {
  applyToCampaign: async (req, res) => {
    try {
      const application = await influencerApplicationService.applyToCampaign(req.userId, req.body);
      res.status(201).json({ success: true, data: application });
    } catch (error) {
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      if (error.message.includes('already applied') || error.message.includes('not active')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  getMyApplications: async (req, res) => {
    try {
      const applications = await influencerApplicationService.getMyApplications(req.userId);
      res.json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = influencerApplicationController;
