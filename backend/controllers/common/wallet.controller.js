const mongoose = require('mongoose');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const AppSetting = require('../../models/AppSetting');

const walletController = {
  getWallet: async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('coins');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 });

      const pendingWithdrawals = transactions
        .filter(t => t.type === 'withdraw' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const availableBalance = (user.coins || 0) - pendingWithdrawals;

      res.json({
        success: true,
        coinBalance: availableBalance, // This is the unified balance (Coins - Pending)
        transactions
      });
    } catch (error) {
      console.error('Get Wallet Error:', error);
      res.status(500).json({ error: 'Failed to fetch wallet data' });
    }
  },

  topUpCoins: async (req, res) => {
    try {
      const { amount } = req.body;
      const numAmount = parseInt(amount, 10);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.coins = (user.coins || 0) + numAmount;
      await user.save();

      const transaction = await Transaction.create({
        user: req.userId,
        type: 'topup',
        amount: numAmount,
        asset: 'coins',
        status: 'completed',
        description: `Purchased ${numAmount} coins`
      });

      res.json({ success: true, coins: user.coins, transaction });
    } catch (error) {
      console.error('Top Up Error:', error);
      res.status(500).json({ error: 'Failed to top up coins' });
    }
  },

  withdrawEarnings: async (req, res) => {
    try {
      const { amount, details } = req.body;
      const numAmount = parseInt(amount, 10);

      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Invalid withdrawal amount' });
      }

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      let minWithdrawal = 500;
      const setting = await AppSetting.findOne({ key: 'minimumWithdrawalLimit' });
      if (setting && setting.value) {
        minWithdrawal = parseInt(setting.value, 10);
      }

      if (numAmount < minWithdrawal) {
        return res.status(400).json({ error: `Minimum withdrawal amount is ${minWithdrawal} coins` });
      }

      // Calculate available balance to prevent double-spending
      const pendingTransactions = await Transaction.find({ user: req.userId, type: 'withdraw', status: 'pending' });
      const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
      const availableBalance = (user.coins || 0) - pendingAmount;

      if (availableBalance < numAmount) {
        return res.status(400).json({ error: 'Insufficient available coins balance' });
      }

      // Create pending transaction (amount is NOT deducted from user.coins yet)
      const transaction = await Transaction.create({
        user: req.userId,
        type: 'withdraw',
        amount: numAmount,
        asset: 'coins',
        status: 'pending',
        method: req.body.method || 'bank_transfer',
        details: details || {},
        description: `Withdrawal request for ${numAmount} coins`
      });

      res.json({ success: true, transaction });
    } catch (error) {
      console.error('Withdrawal Error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  }
};

module.exports = walletController;
