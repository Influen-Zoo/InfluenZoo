/**
 * migrate-campaign-revenue.js
 *
 * One-time migration: creates CampaignRevenue records for all existing campaigns.
 * Uses the CURRENT fee rates from AppSettings (since historical rates are unknown).
 *
 * Run: node scripts/migrate-campaign-revenue.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const AppSetting = require('../models/AppSetting');
const CampaignRevenue = require('../models/CampaignRevenue');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to database');

  const [cfSetting, afSetting] = await Promise.all([
    AppSetting.findOne({ key: 'platformFeeStructure.campaignFee' }),
    AppSetting.findOne({ key: 'platformFeeStructure.applicationFee' })
  ]);

  const campaignFeePercent = Number(cfSetting?.value || 0);
  const applicationFeePercent = Number(afSetting?.value || 0);

  console.log(`\nFee Rates:`);
  console.log(`  Campaign Fee: ${campaignFeePercent}%`);
  console.log(`  Application Fee: ${applicationFeePercent}%`);

  const campaigns = await Campaign.find({}).lean();
  console.log(`\nMigrating ${campaigns.length} campaigns...\n`);

  let created = 0, skipped = 0, errors = 0;

  for (const campaign of campaigns) {
    try {
      // Skip if CampaignRevenue record already exists
      const existing = await CampaignRevenue.findOne({ campaign: campaign._id });
      if (existing) {
        skipped++;
        continue;
      }

      const budget = Number(campaign.budget || 0);
      const coinCost = Number(campaign.coinCost || 0);
      const campaignFee = Math.round((budget * campaignFeePercent) / 100);

      // Find accepted/completed applications for this campaign
      const apps = await Application.find({
        campaignId: campaign._id,
        status: { $in: ['accepted', 'completed'] }
      }).lean();

      const applicationFees = apps.map(app => ({
        application: app._id,
        influencer: app.influencerId,
        proposedPrice: Number(app.proposedPrice || 0),
        feeRate: applicationFeePercent,
        fee: Math.round((Number(app.proposedPrice || 0) * applicationFeePercent) / 100),
        recordedAt: app.updatedAt || app.createdAt
      }));

      const totalApplicationFee = applicationFees.reduce((s, a) => s + a.fee, 0);
      const totalFee = campaignFee + coinCost + totalApplicationFee;

      await CampaignRevenue.create({
        campaign: campaign._id,
        brand: campaign.author,
        category: campaign.category || 'Other',
        campaignBudget: budget,
        campaignFeeRate: campaignFeePercent,
        campaignFee,
        coinCost,
        applicationFees,
        totalApplicationFee,
        totalFee,
        createdAt: campaign.createdAt
      });

      console.log(`  ✅ ${campaign.title || campaign._id}: ₹${totalFee} (campaignFee=₹${campaignFee} + coinCost=₹${coinCost} + appFees=₹${totalApplicationFee})`);
      created++;
    } catch (err) {
      console.error(`  ❌ Error for campaign ${campaign._id}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n--- Migration Complete ---`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already existed): ${skipped}`);
  console.log(`  Errors: ${errors}`);

  const total = await CampaignRevenue.aggregate([{ $group: { _id: null, sum: { $sum: '$totalFee' } } }]);
  console.log(`\nTotal Platform Revenue in CampaignRevenue: ₹${Math.round(total[0]?.sum || 0)}`);

  mongoose.disconnect();
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
