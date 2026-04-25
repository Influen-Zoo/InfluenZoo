const Campaign = require('../models/Campaign');

const categories = ['Fashion', 'Tech', 'Fitness', 'Beauty', 'Food', 'Travel', 'Other'];
const statuses = ['active', 'completed', 'pending', 'draft'];

const seedCampaigns = async (userList) => {
    try {
        console.log('🌱 Seeding campaigns (25+ records)...');

        // Find brand users from the list
        const brands = userList.filter(u => u.role === 'brand');
        const createdCampaigns = [];

        for (let i = 1; i <= 25; i++) {
            const category = categories[i % categories.length];
            const brand = brands[i % brands.length];
            const status = statuses[i % statuses.length];

            const campaignData = {
                author: brand._id,
                title: `${brand.name} - ${category} Pro Campaign ${i}`,
                content: `Join us for an exclusive ${category} partnership. We are looking for creative influencers to showcase our latest collection to their engaged audience. #Brand${i} #${category}`,
                budget: Math.floor(Math.random() * 80000) + 20000,
                startDate: new Date(),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                category: category,
                requirements: `Must have a strong presence in the ${category} niche with at least 10k followers. Authentic engagement is a must.`,
                deliverables: ['1 High-quality Reel', '3 Integrated Stories', '1 Detailed Post'],
                compensation: i % 3 === 0 ? 'paid' : (i % 3 === 1 ? 'both' : 'product'),
                status: status,
                platforms: ['Instagram', 'YouTube'],
                platform: i % 2 === 0 ? 'Instagram' : 'YouTube',
                visibility: 'public',
                coinCost: [10, 50, 100][i % 3], // Platform fee for the campaign
                tags: [category, 'BrandCollab', 'InfluencerMarketing'],
            };

            const campaign = new Campaign(campaignData);
            await campaign.save();
            createdCampaigns.push(campaign);
        }

        console.log(`✅ ${createdCampaigns.length} campaigns seeded successfully`);
        return createdCampaigns;
    } catch (error) {
        console.error('❌ Error seeding campaigns:', error.message);
        throw error;
    }
};

module.exports = { seedCampaigns };

