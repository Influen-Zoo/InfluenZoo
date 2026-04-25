const CampaignRevenue = require('../models/CampaignRevenue');
const AppSetting = require('../models/AppSetting');

const seedCampaignRevenue = async (campaignList, applicationList) => {
    try {
        console.log('🌱 Seeding campaign revenue snapshots...');

        // Read current fee percentages from AppSettings
        const [cfSetting, afSetting] = await Promise.all([
            AppSetting.findOne({ key: 'platformFeeStructure.campaignFee' }),
            AppSetting.findOne({ key: 'platformFeeStructure.applicationFee' })
        ]);

        const campaignFeePercent = Number(cfSetting?.value || 5);
        const applicationFeePercent = Number(afSetting?.value || 3);

        const revenueRecords = [];

        for (const campaign of campaignList) {
            const budget = Number(campaign.budget || 0);
            const coinCost = Number(campaign.coinCost || 0);
            const campaignFee = Math.round((budget * campaignFeePercent) / 100);

            // Find accepted/completed applications for this campaign
            const campaignApps = applicationList.filter(
                a => a.campaignId?.toString() === campaign._id.toString() && 
                ['accepted', 'completed'].includes(a.status)
            );

            const applicationFees = campaignApps.map(app => {
                const proposed = Number(app.proposedPrice || 0);
                const fee = Math.round((proposed * applicationFeePercent) / 100);
                return {
                    application: app._id,
                    influencer: app.influencerId,
                    proposedPrice: proposed,
                    feeRate: applicationFeePercent,
                    fee: fee,
                    recordedAt: app.createdAt || new Date(),
                };
            });

            const totalApplicationFee = applicationFees.reduce((sum, a) => sum + a.fee, 0);
            const totalFee = campaignFee + coinCost + totalApplicationFee;

            const record = new CampaignRevenue({
                campaign: campaign._id,
                brand: campaign.author,
                category: campaign.category || 'Other',
                campaignBudget: budget,
                campaignFeeRate: campaignFeePercent,
                campaignFee: campaignFee,
                coinCost: coinCost,
                applicationFees: applicationFees,
                totalApplicationFee: totalApplicationFee,
                totalFee: totalFee,
                createdAt: campaign.createdAt,
            });

            await record.save();
            revenueRecords.push(record);
        }

        console.log(`✅ ${revenueRecords.length} campaign revenue records seeded successfully`);
        return revenueRecords;
    } catch (error) {
        console.error('❌ Error seeding campaign revenue:', error.message);
        throw error;
    }
};

module.exports = { seedCampaignRevenue };
