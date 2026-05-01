const Application = require('../../models/Application');
const Campaign = require('../../models/Campaign');
const campaignRevenueService = require('../campaignRevenue.service');

const brandApplicationService = {
  getCampaignApplications: async (campaignId, brandId) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.author.toString() !== brandId) {
      throw new Error('Not authorized');
    }

    return await Application.find({ campaignId })
      .populate('influencerId', 'name avatar bio followers engagement socialLinks')
      .sort({ createdAt: -1 });
  },

  updateApplicationStatus: async (applicationId, brandId, status) => {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    const campaign = await Campaign.findById(application.campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.author.toString() !== brandId) {
      throw new Error('Not authorized');
    }

    const previousStatus = application.status;
    application.status = status;
    await application.save();

    // Record application fee revenue (fire-and-forget, rate snapshot at acceptance time)
    if (status === 'accepted' || status === 'completed') {
      campaignRevenueService.recordApplicationAcceptance(application).catch(() => {});
    }

    // If marked as completed, pay the influencer
    if (status === 'completed' && previousStatus !== 'completed') {
      const User = require('../../models/User');
      const Transaction = require('../../models/Transaction');
      
      const influencer = await User.findById(application.influencerId);
      if (influencer) {
        // Use proposedPrice or fallback to campaign budget
        const payout = application.proposedPrice || campaign.budget || 0;
        
        if (payout > 0) {
          influencer.coins = (influencer.coins || 0) + payout;
          await influencer.save();

          await Transaction.create({
            user: influencer._id,
            type: 'earning',
            amount: payout,
            asset: 'coins',
            status: 'completed',
            description: `Coins earned from campaign: ${campaign.title}`,
            referenceId: application._id,
            referenceModel: 'Application'
          });
        }
      }
    }

    // If marked as rejected, refund the application cost to the influencer
    if (status === 'rejected' && previousStatus !== 'rejected') {
      const User = require('../../models/User');
      const Transaction = require('../../models/Transaction');
      
      const influencer = await User.findById(application.influencerId);
      if (influencer) {
        const cost = Number(campaign.coinCost) || 0;
        if (cost > 0) {
          influencer.coins = (influencer.coins || 0) + cost;
          await influencer.save();

          await Transaction.create({
            user: influencer._id,
            type: 'earning',
            amount: cost,
            asset: 'coins',
            status: 'completed',
            description: `Refund for rejected campaign application: ${campaign.title}`,
            referenceId: campaign._id,
            referenceModel: 'Campaign'
          });
        }
      }
    }

    return application;
  }
};

module.exports = brandApplicationService;
