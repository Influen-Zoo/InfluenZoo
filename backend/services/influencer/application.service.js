const Application = require('../../models/Application');
const Campaign = require('../../models/Campaign');

const influencerApplicationService = {
  applyToCampaign: async (influencerId, data) => {
    const { campaignId, coverLetter, proposedPrice, selectedOutlet } = data;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status !== 'active') throw new Error('Campaign is not active');
    if (campaign.outlets?.length && !campaign.outlets.includes(selectedOutlet)) {
      throw new Error('Please select a valid outlet');
    }

    const existing = await Application.findOne({ campaignId, influencerId });
    if (existing) throw new Error('You already applied to this campaign');

    const application = new Application({
      campaignId,
      onModel: 'Campaign',
      influencerId,
      coverLetter,
      proposedPrice: proposedPrice || campaign.budget,
      selectedOutlet: selectedOutlet || '',
    });

    await application.save();

    if (!campaign.applicants.includes(influencerId)) {
      campaign.applicants.push(influencerId);
      await campaign.save();
    }

    return application;
  },

  getMyApplications: async (influencerId) => {
    return await Application.find({ influencerId })
      .populate('campaignId', 'title budget status content category')
      .sort({ createdAt: -1 });
  }
};

module.exports = influencerApplicationService;
