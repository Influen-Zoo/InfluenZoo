const Application = require('../../models/Application');
const Campaign = require('../../models/Campaign');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const AppSetting = require('../../models/AppSetting');

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

    // 1. Minimum balance check
    const minBalanceSetting = await AppSetting.findOne({ key: 'platformFeeStructure.minInfluencerBalance' });
    const minInfluencerBalance = minBalanceSetting?.value !== undefined ? Number(minBalanceSetting.value) : 500;

    const user = await User.findById(influencerId);
    if (!user) throw new Error('User not found');

    if ((user.coins || 0) < minInfluencerBalance) {
      throw new Error(`Minimum wallet balance of ${minInfluencerBalance} coins is required to apply for campaigns`);
    }

    // 2. Campaign cost check
    const cost = Number(campaign.coinCost) || 0;
    if ((user.coins || 0) < cost) {
      throw new Error(`Insufficient wallet balance. This campaign requires ${cost} coins to apply.`);
    }

    // 3. Deduct cost and save application
    user.coins = (user.coins || 0) - cost;
    await user.save();

    if (cost > 0) {
      const transaction = new Transaction({
        user: influencerId,
        type: 'deduction',
        asset: 'coins',
        amount: -cost,
        description: `Application fee for campaign: ${campaign.title}`,
        status: 'completed',
        referenceId: campaignId,
        referenceModel: 'Campaign'
      });
      await transaction.save();
    }

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
