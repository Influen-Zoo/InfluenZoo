const Dispute = require('../models/Dispute');

const seedDisputes = async (userList, campaignList) => {
    try {
        console.log('🌱 Seeding disputes...');

        const influencers = userList.filter(u => u.role === 'influencer');
        const brands = userList.filter(u => u.role === 'brand');
        const disputes = [];

        const reasons = [
            'Delayed payment after deliverable submission.',
            'Content quality does not meet the brief.',
            'Unauthorized use of brand assets.',
            'Influencer did not post on agreed date.',
            'Discrepancy in reach/engagement metrics reported.'
        ];

        for (let i = 0; i < 15; i++) {
            const influencer = influencers[i % influencers.length];
            const brand = brands[i % brands.length];
            const campaign = campaignList[i % campaignList.length];

            disputes.push({
                reporter: i % 2 === 0 ? influencer._id : brand._id,
                reported: i % 2 === 0 ? brand._id : influencer._id,
                campaign: campaign._id,
                reason: reasons[i % reasons.length],
                description: `Detailed description for dispute #${i + 1}. We have tried reaching out but haven't received a satisfactory response.`,
                status: i % 3 === 0 ? 'resolved' : 'open',
                resolution: i % 3 === 0 ? 'Issue settled with a partial payout and content revision.' : undefined,
            });
        }

        const createdDisputes = await Dispute.insertMany(disputes);
        console.log(`✅ ${createdDisputes.length} disputes seeded successfully`);
        return createdDisputes;
    } catch (error) {
        console.error('❌ Error seeding disputes:', error.message);
        throw error;
    }
};

module.exports = { seedDisputes };
