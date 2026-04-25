const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');

async function syncAllBalances() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database');

    const influencers = await User.find({ role: 'influencer' });
    console.log(`Found ${influencers.length} influencers to sync.`);

    for (const user of influencers) {
      console.log(`\nSyncing user: ${user.name} (${user.email})`);

      // 1. Sum up all completed applications
      const completedApps = await Application.find({ 
        influencerId: user._id, 
        status: 'completed' 
      });
      const earningsTotal = completedApps.reduce((sum, app) => sum + (app.proposedPrice || 0), 0);
      console.log(`- Historical Earnings from Applications: ${earningsTotal}`);

      // 2. Sum up all topups (from Transactions)
      const topups = await Transaction.find({
        user: user._id,
        type: 'topup',
        status: 'completed'
      });
      const topupTotal = topups.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      console.log(`- Total Topups: ${topupTotal}`);

      // 3. Sum up all completed withdrawals (from Transactions)
      const withdrawals = await Transaction.find({
        user: user._id,
        type: 'withdraw',
        status: 'completed'
      });
      const withdrawalTotal = withdrawals.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      console.log(`- Total Withdrawals: ${withdrawalTotal}`);

      // 4. Calculate Final Coin Balance
      // (Earnings + Topups - Withdrawals)
      const finalCoins = earningsTotal + topupTotal - withdrawalTotal;
      
      console.log(`- Final Calculated Balance: ${finalCoins}`);

      // 5. Update User Record
      user.coins = finalCoins;
      // Also update totalEarnings if it exists to be consistent
      if (user.totalEarnings !== undefined) user.totalEarnings = earningsTotal;
      if (user.walletBalance !== undefined) user.walletBalance = finalCoins;

      await user.save();
      console.log(`✅ User ${user.email} synchronized successfully.`);
    }

    console.log('\nAll influencer balances synchronized.');
    process.exit(0);
  } catch (error) {
    console.error('Synchronization Failed:', error);
    process.exit(1);
  }
}

syncAllBalances();
