/**
 * campaignRevenue.service.js
 *
 * Helper service to record/update platform revenue for a campaign.
 * Called from:
 *  - campaign creation (brandCampaignService.createCampaign)
 *  - application acceptance/completion (brandApplicationService.updateApplicationStatus)
 *  - admin coinCost update (adminService.updateAnnouncementCost)
 */

const CampaignRevenue = require('../models/CampaignRevenue');
const AppSetting = require('../models/AppSetting');


/**
 * Read current fee percentages from AppSettings.
 * Returns raw percentages as numbers (e.g., 5 = 5%, 0.05 rate = 5/100).
 */
const getFeeRates = async () => {
  const [cfSetting, afSetting] = await Promise.all([
    AppSetting.findOne({ key: 'platformFeeStructure.campaignFee' }),
    AppSetting.findOne({ key: 'platformFeeStructure.applicationFee' })
  ]);
  return {
    campaignFeePercent: Number(cfSetting?.value || 0),   // e.g., 5
    applicationFeePercent: Number(afSetting?.value || 0) // e.g., 3
  };
};

const campaignRevenueService = {
  /**
   * Called when a campaign is created.
   * Snapshots the current campaignFeeRate and calculates campaignFee.
   */
  recordCampaignCreation: async (campaign) => {
    try {
      const { campaignFeePercent } = await getFeeRates();
      const budget = Number(campaign.budget || 0);
      const coinCost = Number(campaign.coinCost || 0);
      const campaignFeeRate = campaignFeePercent;
      const campaignFee = Math.round((budget * campaignFeeRate) / 100);

      await CampaignRevenue.findOneAndUpdate(
        { campaign: campaign._id },
        {
          campaign: campaign._id,
          brand: campaign.author,
          category: campaign.category || 'Other',
          campaignBudget: budget,
          campaignFeeRate,
          campaignFee,
          coinCost,
          // totalFee recalculated by pre-save hook
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error('[CampaignRevenue] Error recording campaign creation:', err.message);
    }
  },

  /**
   * Called when an application is accepted or completed.
   * Snapshots the current applicationFeeRate for that application.
   * Prevents duplicate entries for the same application.
   */
  recordApplicationAcceptance: async (application) => {
    try {
      const { applicationFeePercent } = await getFeeRates();
      const proposedPrice = Number(application.proposedPrice || 0);
      const feeRate = applicationFeePercent;
      const fee = Math.round((proposedPrice * feeRate) / 100);

      const record = await CampaignRevenue.findOne({ campaign: application.campaignId });
      if (!record) return; // Campaign record must exist first

      // Avoid duplicate entries for same application
      const alreadyRecorded = record.applicationFees.some(
        (af) => af.application?.toString() === application._id.toString()
      );
      if (alreadyRecorded) return;

      record.applicationFees.push({
        application: application._id,
        influencer: application.influencerId,
        proposedPrice,
        feeRate,
        fee,
        recordedAt: new Date()
      });

      await record.save(); // pre-save hook recalculates totalFee
    } catch (err) {
      console.error('[CampaignRevenue] Error recording application fee:', err.message);
    }
  },

  /**
   * Called when admin changes coinCost (individual campaign fee) for a campaign.
   */
  updateCoinCost: async (campaignId, newCoinCost) => {
    try {
      const record = await CampaignRevenue.findOne({ campaign: campaignId });
      if (!record) return;
      record.coinCost = Number(newCoinCost || 0);
      await record.save(); // pre-save hook recalculates totalFee
    } catch (err) {
      console.error('[CampaignRevenue] Error updating coinCost:', err.message);
    }
  }
};

module.exports = campaignRevenueService;
