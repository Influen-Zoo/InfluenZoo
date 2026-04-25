const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const Analytics = require('../models/Analytics');

async function refresh() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'priya@example.com' });
    if (!user) {
      console.log('User priya@example.com not found');
      process.exit(1);
    }
    const userId = user._id;
    console.log('Found Priya ID:', userId);

    // 1. Create some completed applications for earnings
    const campaigns = await Campaign.find({}).limit(5);
    for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        await Application.findOneAndUpdate(
            { influencerId: userId, campaignId: campaign._id },
            { 
                status: i < 3 ? 'completed' : 'accepted',
                proposedPrice: 15000 + (i * 5000),
                onModel: 'Campaign'
            },
            { upsert: true, new: true }
        );
    }
    console.log('Updated applications for earnings');

    // 2. Enhance Analytics interaction types in metadata
    // We update engagement type events for this user
    const engagementEvents = await Analytics.find({ userId, type: 'engagement' });
    console.log(`Enhancing ${engagementEvents.length} engagement events`);

    for (const event of engagementEvents) {
        // Distribute the random engagement count into specific interaction types with variety
        const total = event.metadata?.engagement || Math.floor(Math.random() * 200 + 50);
        
        // Random weights that sum to 1
        let wLikes = 0.4 + Math.random() * 0.3;     // 40% - 70%
        let wComments = 0.1 + Math.random() * 0.15; // 10% - 25%
        let wShares = 0.05 + Math.random() * 0.1;   // 5% - 15%
        let wSaves = 1 - (wLikes + wComments + wShares);
        if (wSaves < 0) wSaves = 0.02;

        await Analytics.findByIdAndUpdate(event._id, {
            'metadata.likes': Math.round(total * wLikes),
            'metadata.comments': Math.round(total * wComments),
            'metadata.shares': Math.round(total * wShares),
            'metadata.saves': Math.round(total * wSaves),
            'metadata.isFollower': Math.random() > 0.4
        });
    }
    console.log('Enhanced analytics metadata');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

refresh();
