const Transaction = require('../../models/Transaction');
const User = require('../../models/User');

/**
 * GET /api/admin/wallet/withdrawals
 * List all pending withdrawal requests
 */
exports.getWithdrawalRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = { type: 'withdraw' };
    
    if (status !== 'all') {
      filter.status = status;
    }

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get Withdrawal Requests Error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal requests' });
  }
};

/**
 * PUT /api/admin/wallet/withdrawals/:id/approve
 * Approve a withdrawal request and deduct coins
 */
exports.approveWithdrawal = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: `Transaction is already ${transaction.status}` });
    }

    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.coins < transaction.amount) {
      return res.status(400).json({ error: 'User has insufficient coins balance for this withdrawal' });
    }

    // Deduct coins and complete transaction
    user.coins -= transaction.amount;
    await user.save();

    transaction.status = 'completed';
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ 
      success: true, 
      message: 'Withdrawal approved and coins deducted',
      data: transaction 
    });
  } catch (error) {
    console.error('Approve Withdrawal Error:', error);
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
};

/**
 * PUT /api/admin/wallet/withdrawals/:id/reject
 * Reject a withdrawal request
 */
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: `Transaction is already ${transaction.status}` });
    }

    transaction.status = 'failed';
    transaction.description = `${transaction.description}${reason ? ' - Reason: ' + reason : ' - Rejected by Admin'}`;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ 
      success: true, 
      message: 'Withdrawal request rejected',
      data: transaction 
    });
  } catch (error) {
    console.error('Reject Withdrawal Error:', error);
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
};
