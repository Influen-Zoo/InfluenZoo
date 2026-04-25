const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const brandApplicationService = require('../services/brand/application.service');

async function testWallet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const influencer = await User.findOne({ email: 'priya@example.com' });
    const brand = await User.findOne({ email: 'brand@novaskin.com' });

    console.log('--- Initial State ---');
    console.log('Priya Coins:', influencer.coins);

    // Create a mock campaign for 15,000 INR
    const campaign = await Campaign.create({
      author: brand._id,
      title: 'Wallet Test Campaign',
      content: 'Testing the wallet payout system.',
      compensation: 'paid',
      budget: 15000,
      visibility: 'public'
    });

    // Priya applies
    const app = await Application.create({
      campaignId: campaign._id,
      influencerId: influencer._id,
      proposedPrice: 15000,
      status: 'accepted'
    });

    console.log('Application created and accepted.');

    // Brand marks as completed
    await brandApplicationService.updateApplicationStatus(app._id, brand._id.toString(), 'completed');

    const updatedInfluencer = await User.findById(influencer._id);
    console.log('--- Final State ---');
    console.log('Priya Coins:', updatedInfluencer.coins);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testWallet();
