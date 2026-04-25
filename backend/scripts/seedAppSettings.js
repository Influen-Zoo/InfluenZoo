const mongoose = require('mongoose');
require('dotenv').config();
const AppSetting = require('../models/AppSetting');

async function seedSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const exists = await AppSetting.findOne({ key: 'minimumWithdrawalLimit' });
    if (!exists) {
      await AppSetting.create({
        key: 'minimumWithdrawalLimit',
        value: 500,
        description: 'The minimum amount in rupees (₹) an influencer can withdraw at once.'
      });
      console.log('Seeded minimumWithdrawalLimit');
    } else {
      console.log('minimumWithdrawalLimit already exists');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedSettings();
