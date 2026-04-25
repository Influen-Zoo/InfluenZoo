const Application = require('../models/Application');

const applicationTemplates = [
    {
        coverLetter: 'I love your fashion sense and would love to collaborate on this campaign! My audience is very engaged with styling content.',
        proposedPrice: 12000,
        proposedContent: '3 High-quality Instagram Reels showing styling tips with the collection.',
    },
    {
        coverLetter: 'Perfect fit for my tech review channel. I can do a deep dive into the features!',
        proposedPrice: 25000,
        proposedContent: 'A 10-minute detailed YouTube review + unboxing short.',
    },
    {
        coverLetter: 'I have been using your products for years. Authentic review coming your way!',
        proposedPrice: 8500,
        proposedContent: '10 Authentic Stories over a week showing daily usage.',
    },
    {
        coverLetter: 'Fitness is my life, and your brand aligns perfectly with my values.',
        proposedPrice: 15000,
        proposedContent: 'Workout demonstration post + testimonial in caption.',
    },
    {
        coverLetter: 'I create premium travel content. This campaign is a perfect match for my next trip!',
        proposedPrice: 30000,
        proposedContent: 'Cinematic travel vlog segment + 5 high-res photos.',
    },
];

const seedApplications = async (userList, campaignList) => {
    try {
        console.log('🌱 Seeding applications (50+ records)...');

        // Find influencers
        const influencers = userList.filter(u => u.role === 'influencer');
        const applications = [];

        const createdApplications = [];

        // Distribute applications across campaigns and influencers
        for (let i = 0; i < 60; i++) {
            const campaign = campaignList[i % campaignList.length];
            const influencer = influencers[i % influencers.length];
            const template = applicationTemplates[i % applicationTemplates.length];

            // Random status
            const statusRand = Math.random();
            let status = 'pending';
            if (statusRand > 0.9) status = 'rejected';
            else if (statusRand > 0.7) status = 'completed';
            else if (statusRand > 0.4) status = 'accepted';

            const application = new Application({
                campaignId: campaign._id,
                influencerId: influencer._id,
                onModel: 'Campaign',
                status: status,
                coverLetter: `${template.coverLetter} (App #${i + 1})`,
                proposedPrice: Math.floor(template.proposedPrice * (0.8 + Math.random() * 0.4)),
                proposedContent: template.proposedContent,
                deliveryDate: new Date(Date.now() + (15 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
            });

            await application.save();
            createdApplications.push(application);

            // Sync with campaign model
            if (!campaign.applicants) campaign.applicants = [];
            if (!campaign.applicants.includes(influencer._id)) {
                campaign.applicants.push(influencer._id);
                await campaign.save();
            }
        }

        console.log(`✅ ${createdApplications.length} applications seeded and synced successfully`);
        return createdApplications;
    } catch (error) {
        console.error('❌ Error seeding applications:', error.message);
        throw error;
    }
};

module.exports = { seedApplications };

