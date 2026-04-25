const Analytics = require('../models/Analytics');

const seedAnalytics = async (userMap, campaignMap) => {
    try {
        console.log('🌱 Seeding analytics (500+ events)...');

        const analytics = [];
        const eventTypes = ['impression', 'click', 'engagement', 'conversion'];
        const now = Date.now();

        // Generate analytics data for campaigns
        const influencers = userMap.filter(u => u.role === 'influencer');

        campaignMap.forEach((campaign) => {
            // 20-50 events per campaign over the last 90 days
            const eventCount = 20 + Math.floor(Math.random() * 30);

            for (let i = 0; i < eventCount; i++) {
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                const influencer = influencers[Math.floor(Math.random() * influencers.length)];
                
                const metadata = {
                    platform: ['Instagram', 'TikTok', 'YouTube', 'Twitter'][Math.floor(Math.random() * 4)],
                    location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][Math.floor(Math.random() * 5)],
                    device: i % 2 === 0 ? 'Mobile' : 'Desktop',
                };

                if (eventType === 'engagement') {
                    metadata.action = Math.random() > 0.3 ? 'like' : 'comment';
                    metadata.engagement = Math.floor(Math.random() * 50) + 1;
                } else if (eventType === 'impression') {
                    metadata.reach = Math.floor(Math.random() * 500) + 100;
                }

                analytics.push({
                    userId: influencer?._id || userMap[0]._id,
                    campaignId: campaign._id,
                    type: eventType,
                    // Spread events over the last 90 days
                    timestamp: new Date(now - Math.random() * 90 * 24 * 60 * 60 * 1000),
                    metadata: metadata,
                });
            }
        });

        // Insert in chunks if necessary, but 500-1000 records should be fine
        const createdAnalytics = await Analytics.insertMany(analytics);
        console.log(`✅ ${createdAnalytics.length} analytics events seeded successfully`);
        return createdAnalytics;
    } catch (error) {
        console.error('❌ Error seeding analytics:', error.message);
        throw error;
    }
};

module.exports = { seedAnalytics };

