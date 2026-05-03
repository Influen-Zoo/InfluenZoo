const { brandCampaignService } = require('../../services/brand/campaign.service');

const getCompressionResults = (files = []) => files.map(file => file.compression).filter(Boolean);

const brandCampaignController = {
  createCampaign: async (req, res) => {
    try {
      const result = await brandCampaignService.createCampaign(req.userId, req.body, req.files, req.uploadEntityId);
      res.status(201).json({
        success: true,
        campaign: result.campaign,
        creationFeeCharged: result.creationFeeCharged,
        updatedCoinBalance: result.updatedCoinBalance,
        message: result.creationFeeCharged > 0
          ? `${result.creationFeeCharged} coins deducted for your first campaign. It is pending admin approval.`
          : 'Campaign submitted for admin approval.',
        compression: getCompressionResults(req.files)
      });
    } catch (error) {
      console.error('Create Campaign Error:', error);
      if (
        error.message === 'At least one platform is required' ||
        error.message.includes('first campaign launch requires')
      ) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  },

  getMyCampaigns: async (req, res) => {
    try {
      const campaigns = await brandCampaignService.getMyCampaigns(req.userId);
      res.json({ success: true, campaigns });
    } catch (error) {
      console.error('Get My Campaigns Error:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  },

  updateCampaign: async (req, res) => {
    try {
      const campaign = await brandCampaignService.updateCampaign(req.params.id, req.userId, req.body, req.files);
      res.json({ success: true, campaign, compression: getCompressionResults(req.files) });
    } catch (error) {
      console.error('Update Campaign Error:', error);
      if (error.message === 'Campaign not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized to edit this campaign') return res.status(403).json({ error: error.message });
      if (error.message === 'At least one platform is required') return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  },

  deleteCampaign: async (req, res) => {
    try {
      await brandCampaignService.deleteCampaign(req.params.id, req.userId, req.userRole);
      res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      if (error.message === 'Campaign not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized to delete this campaign') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  }
};

module.exports = brandCampaignController;
