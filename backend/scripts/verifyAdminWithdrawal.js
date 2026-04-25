const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const walletAdminController = require('../controllers/admin/wallet.admin.controller');

dotenv.config();

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Find user Priya or use any influencer
    let user = await User.findOne({ email: 'priya@example.com' });
    if (!user) {
      user = await User.findOne({ role: 'influencer' });
    }
    
    if (!user) {
      console.log('No influencer found to test with.');
      process.exit(1);
    }

    // Ensure user has some coins
    if (user.coins < 5000) {
      user.coins = 10000;
      await user.save();
    }

    console.log(`Initial State - Priya Coins: ${user.coins}`);

    // 2. Create a pending withdrawal request (simulating wallet.controller.withdrawEarnings)
    const withdrawalAmount = 5000;
    const pendingTx = await Transaction.create({
      user: user._id,
      type: 'withdraw',
      amount: withdrawalAmount,
      asset: 'coins',
      status: 'pending',
      description: 'Test withdrawal request'
    });
    console.log(`Pending withdrawal created for ${withdrawalAmount} coins.`);

    // 3. Mock the request/response for getting withdrawals
    const mockRes = { json: (data) => console.log('Pending Withdrawals:', data.data.length) };
    await walletAdminController.getWithdrawalRequests({ query: {} }, mockRes);

    // 4. Mock the approve request
    const approveReq = { params: { id: pendingTx._id } };
    const approveRes = { 
        status: (code) => ({ json: (d) => console.log(`Error (${code}):`, d) }),
        json: (data) => console.log('Approval Response:', data.message) 
    };
    
    console.log('Approving withdrawal...');
    await walletAdminController.approveWithdrawal(approveReq, approveRes);

    // 5. Check final state
    const updatedUser = await User.findById(user._id);
    console.log(`Final State - Priya Coins: ${updatedUser.coins}`);

    if (updatedUser.coins === user.coins - withdrawalAmount) {
      console.log('✅ VERIFICATION SUCCESSFUL: Coins deducted correctly after approval.');
    } else {
      console.log('❌ VERIFICATION FAILED: Coin deduction mismatch.');
    }

    // Cleanup
    await Transaction.deleteOne({ _id: pendingTx._id });
    process.exit(0);
  } catch (error) {
    console.error('Verification Error:', error);
    process.exit(1);
  }
}

verify();
