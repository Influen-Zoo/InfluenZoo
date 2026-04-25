const brandApplicationService = require('../../services/brand/application.service');

const brandApplicationController = {
  getCampaignApplications: async (req, res) => {
    try {
      const applications = await brandApplicationService.getCampaignApplications(req.params.campaignId, req.userId);
      res.json({ success: true, data: applications });
    } catch (error) {
      if (error.message === 'Campaign not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  acceptApplication: async (req, res) => {
    try {
      const application = await brandApplicationService.updateApplicationStatus(req.params.id, req.userId, 'accepted');
      res.json({ success: true, data: application });
    } catch (error) {
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  rejectApplication: async (req, res) => {
    try {
      const application = await brandApplicationService.updateApplicationStatus(req.params.id, req.userId, 'rejected');
      res.json({ success: true, data: application });
    } catch (error) {
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = brandApplicationController;
