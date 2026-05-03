const mongoose = require('mongoose');
const crypto = require('crypto');
const https = require('https');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const AppSetting = require('../../models/AppSetting');

const RAZORPAY_SETTING_KEY = 'payment.razorpay';
const REFERRAL_DEFAULTS = {
  requiredCompletedReferrals: 10,
  referrerRewardMode: 'percentage',
  referrerRewardValue: 5,
  referredRewardCoins: 200,
};

const getRazorpaySettings = async () => {
  const setting = await AppSetting.findOne({ key: RAZORPAY_SETTING_KEY });
  const value = setting?.value || {};
  return {
    enabled: Boolean(value.enabled),
    keyId: value.keyId || '',
    keySecret: value.keySecret || '',
    coinRate: Number(value.coinRate) > 0 ? Number(value.coinRate) : 1,
    currency: value.currency || 'INR'
  };
};

const getReferralSettings = async () => {
  const [
    requiredCompletedReferrals,
    referrerRewardMode,
    referrerRewardValue,
    referredRewardCoins,
  ] = await Promise.all([
    AppSetting.findOne({ key: 'referral.requiredCompletedReferrals' }),
    AppSetting.findOne({ key: 'referral.referrerRewardMode' }),
    AppSetting.findOne({ key: 'referral.referrerRewardValue' }),
    AppSetting.findOne({ key: 'referral.referredRewardCoins' }),
  ]);

  const mode = referrerRewardMode?.value === 'fixed' ? 'fixed' : 'percentage';

  return {
    requiredCompletedReferrals: Number(requiredCompletedReferrals?.value) > 0
      ? Number(requiredCompletedReferrals.value)
      : REFERRAL_DEFAULTS.requiredCompletedReferrals,
    referrerRewardMode: mode,
    referrerRewardValue: Number(referrerRewardValue?.value) >= 0
      ? Number(referrerRewardValue.value)
      : REFERRAL_DEFAULTS.referrerRewardValue,
    referredRewardCoins: Number(referredRewardCoins?.value) >= 0
      ? Number(referredRewardCoins.value)
      : REFERRAL_DEFAULTS.referredRewardCoins,
  };
};

const getCompletedReferralUserIds = async (referrerId) => {
  const referredUsers = await User.find({ referredBy: referrerId }).select('_id');
  const referredUserIds = referredUsers.map((user) => user._id);
  if (referredUserIds.length === 0) return [];

  return await Transaction.distinct('user', {
    user: { $in: referredUserIds },
    type: 'topup',
    status: 'completed',
  });
};

const ensureReferralCode = async (user) => {
  if (user.referralCode) return user.referralCode;
  const base = String(user.name || 'USER').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'USER';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `${base}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const exists = await User.exists({ referralCode: code });
    if (!exists) {
      user.referralCode = code;
      await user.save({ validateBeforeSave: false });
      return code;
    }
  }

  user.referralCode = `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  await user.save({ validateBeforeSave: false });
  return user.referralCode;
};

const processReferralRewards = async (referredUser, topupTransaction) => {
  if (!referredUser?.referredBy || !topupTransaction) return null;

  const settings = await getReferralSettings();
  const referredRewardCoins = Math.floor(settings.referredRewardCoins);
  const rewards = {};

  const referredAlreadyRewarded = await Transaction.exists({
    user: referredUser._id,
    method: 'referral_bonus',
    $or: [
      { 'details.rewardType': 'referred_first_payment' },
      { description: 'Referral signup reward after first payment' }
    ]
  });

  if (!referredAlreadyRewarded && referredRewardCoins > 0) {
    referredUser.coins = (referredUser.coins || 0) + referredRewardCoins;
    await referredUser.save({ validateBeforeSave: false });
    rewards.referredTransaction = await Transaction.create({
      user: referredUser._id,
      type: 'earning',
      amount: referredRewardCoins,
      asset: 'coins',
      status: 'completed',
      method: 'referral_bonus',
      description: 'Referral signup reward after first payment',
      referenceId: referredUser.referredBy,
      referenceModel: 'User',
      details: {
        rewardType: 'referred_first_payment',
        referrer: referredUser.referredBy,
        sourceTransaction: topupTransaction._id,
      }
    });
  }

  const completedReferralUserIds = await getCompletedReferralUserIds(referredUser.referredBy);
  if (completedReferralUserIds.length < settings.requiredCompletedReferrals) {
    return Object.keys(rewards).length ? rewards : null;
  }

  const referrerAlreadyRewarded = await Transaction.exists({
    user: referredUser.referredBy,
    method: 'referral_bonus',
    'details.referredUser': referredUser._id,
  });

  const referrerRewardCoins = settings.referrerRewardMode === 'fixed'
    ? Math.floor(settings.referrerRewardValue)
    : Math.floor((topupTransaction.amount * settings.referrerRewardValue) / 100);

  if (!referrerAlreadyRewarded && referrerRewardCoins > 0) {
    await User.findByIdAndUpdate(referredUser.referredBy, { $inc: { coins: referrerRewardCoins } });
    rewards.referrerTransaction = await Transaction.create({
      user: referredUser.referredBy,
      type: 'earning',
      amount: referrerRewardCoins,
      asset: 'coins',
      status: 'completed',
      method: 'referral_bonus',
      description: `Referral reward from ${referredUser.name}'s first payment`,
      referenceId: referredUser._id,
      referenceModel: 'User',
      details: {
        rewardType: 'referrer_threshold_payment',
        referredUser: referredUser._id,
        sourceTransaction: topupTransaction._id,
        completedReferrals: completedReferralUserIds.length,
        requiredCompletedReferrals: settings.requiredCompletedReferrals,
        rewardMode: settings.referrerRewardMode,
        rewardValue: settings.referrerRewardValue,
      }
    });
  }

  return Object.keys(rewards).length ? rewards : null;
};

const postToRazorpay = (path, payload, settings) => new Promise((resolve, reject) => {
  const body = JSON.stringify(payload);
  const request = https.request({
    hostname: 'api.razorpay.com',
    path,
    method: 'POST',
    auth: `${settings.keyId}:${settings.keySecret}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      let parsed = {};
      try {
        parsed = data ? JSON.parse(data) : {};
      } catch (error) {
        return reject(new Error('Invalid response from Razorpay'));
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return resolve(parsed);
      }

      reject(new Error(parsed?.error?.description || 'Razorpay request failed'));
    });
  });

  request.on('error', reject);
  request.write(body);
  request.end();
});

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

  getPaymentConfig: async (req, res) => {
    try {
      const settings = await getRazorpaySettings();
      const ready = settings.enabled && settings.keyId && settings.keySecret;
      
      const minRechargeSetting = await AppSetting.findOne({ key: 'platformFeeStructure.minRechargeAmount' });
      const minRechargeAmount = minRechargeSetting?.value !== undefined ? Number(minRechargeSetting.value) : 500;

      const minBalanceSetting = await AppSetting.findOne({ key: 'platformFeeStructure.minInfluencerBalance' });
      const minInfluencerBalance = minBalanceSetting?.value !== undefined ? Number(minBalanceSetting.value) : 500;

      const firstCampaignCoinCostSetting = await AppSetting.findOne({ key: 'platformFeeStructure.firstCampaignCoinCost' });
      const firstCampaignCoinCost = firstCampaignCoinCostSetting?.value !== undefined ? Number(firstCampaignCoinCostSetting.value) : 50;

      res.json({
        success: true,
        data: {
          enabled: Boolean(ready),
          keyId: ready ? settings.keyId : '',
          coinRate: settings.coinRate,
          currency: settings.currency,
          minRechargeAmount,
          minInfluencerBalance,
          firstCampaignCoinCost,
          referral: await getReferralSettings()
        }
      });
    } catch (error) {
      console.error('Payment Config Error:', error);
      res.status(500).json({ error: 'Failed to fetch payment configuration' });
    }
  },

  createCoinOrder: async (req, res) => {
    try {
      const rupeeAmount = Number(req.body.amount);
      if (!Number.isFinite(rupeeAmount) || rupeeAmount < 1) {
        return res.status(400).json({ error: 'Invalid purchase amount' });
      }

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const settings = await getRazorpaySettings();
      if (!settings.enabled || !settings.keyId || !settings.keySecret) {
        return res.status(400).json({ error: 'Coin purchases are not enabled yet' });
      }

      const payablePaise = Math.round(rupeeAmount * 100);
      const coinAmount = Math.floor(rupeeAmount * settings.coinRate);
      if (coinAmount <= 0) {
        return res.status(400).json({ error: 'Purchase amount is too low for the configured coin rate' });
      }

      const receipt = `coin_${Date.now()}_${String(req.userId).slice(-8)}`;
      const order = await postToRazorpay('/v1/orders', {
        amount: payablePaise,
        currency: settings.currency,
        receipt,
        notes: {
          userId: String(req.userId),
          coins: String(coinAmount)
        }
      }, settings);

      const transaction = await Transaction.create({
        user: req.userId,
        type: 'topup',
        amount: coinAmount,
        asset: 'coins',
        status: 'pending',
        method: 'razorpay',
        description: `Razorpay purchase pending for ${coinAmount} coins`,
        details: {
          provider: 'razorpay',
          razorpayOrderId: order.id,
          payableAmount: rupeeAmount,
          payablePaise,
          currency: settings.currency,
          coinRate: settings.coinRate
        }
      });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: settings.keyId,
          coins: coinAmount,
          transactionId: transaction._id
        }
      });
    } catch (error) {
      console.error('Create Coin Order Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
  },

  verifyCoinPayment: async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing Razorpay payment details' });
      }

      const settings = await getRazorpaySettings();
      if (!settings.keySecret) {
        return res.status(400).json({ error: 'Razorpay is not configured' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', settings.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }

      const transaction = await Transaction.findOneAndUpdate({
        user: req.userId,
        type: 'topup',
        method: 'razorpay',
        status: 'pending',
        'details.razorpayOrderId': razorpay_order_id
      }, {
        status: 'completed',
        description: 'Razorpay coin purchase completed',
        $set: {
          'details.razorpayPaymentId': razorpay_payment_id,
          'details.verifiedAt': new Date()
        }
      }, {
        new: true
      });

      if (!transaction) {
        const existingTransaction = await Transaction.findOne({
          user: req.userId,
          type: 'topup',
          method: 'razorpay',
          'details.razorpayOrderId': razorpay_order_id
        });

        if (existingTransaction?.status === 'completed') {
          const existingUser = await User.findById(req.userId);
          const referralRewards = existingUser
            ? await processReferralRewards(existingUser, existingTransaction)
            : null;
          return res.json({
            success: true,
            data: {
              coins: existingUser?.coins || 0,
              transaction: existingTransaction,
              referralRewards
            }
          });
        }

        return res.status(404).json({ error: 'Payment order not found' });
      }

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.coins = (user.coins || 0) + transaction.amount;
      await user.save({ validateBeforeSave: false });

      transaction.description = `Purchased ${transaction.amount} coins via Razorpay`;
      await transaction.save();

      const referralRewards = await processReferralRewards(user, transaction);

      res.json({ success: true, data: { coins: user.coins, transaction, referralRewards } });
    } catch (error) {
      console.error('Verify Coin Payment Error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
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
  },

  getReferralSummary: async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate('referredBy', 'name referralCode');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const referralCode = await ensureReferralCode(user);
      const referredUsers = await User.find({ referredBy: req.userId })
        .select('name email role createdAt')
        .sort({ createdAt: -1 });
      const referredUserIds = referredUsers.map((item) => item._id);
      const completedUserIds = referredUserIds.length > 0
        ? await Transaction.distinct('user', {
            user: { $in: referredUserIds },
            type: 'topup',
            status: 'completed',
          })
        : [];
      const completedSet = new Set(completedUserIds.map(String));
      const settings = await getReferralSettings();

      res.json({
        success: true,
        data: {
          referralCode,
          referredBy: user.referredBy || null,
          settings,
          stats: {
            totalReferrals: referredUsers.length,
            completedReferrals: completedUserIds.length,
            pendingReferrals: Math.max(0, referredUsers.length - completedUserIds.length),
            remainingForReward: Math.max(0, settings.requiredCompletedReferrals - completedUserIds.length),
          },
          referrals: referredUsers.map((item) => ({
            _id: item._id,
            name: item.name,
            email: item.email,
            role: item.role,
            createdAt: item.createdAt,
            completed: completedSet.has(String(item._id)),
          })),
        }
      });
    } catch (error) {
      console.error('Referral Summary Error:', error);
      res.status(500).json({ error: 'Failed to fetch referral summary' });
    }
  }
};

module.exports = walletController;
