const express = require('express');
const walletAdminController = require('../../controllers/admin/wallet.admin.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { adminOnly } = require('../../middleware/admin/admin.middleware');

const router = express.Router();

router.use(authMiddleware, adminOnly);

/**
 * @route   GET /api/admin/wallet/withdrawals
 * @desc    Get all pending withdrawal requests
 * @access  Private (Admin)
 */
router.get('/withdrawals', walletAdminController.getWithdrawalRequests);

/**
 * @route   PUT /api/admin/wallet/withdrawals/:id/approve
 * @desc    Approve withdrawal
 * @access  Private (Admin)
 */
router.put('/withdrawals/:id/approve', walletAdminController.approveWithdrawal);

/**
 * @route   PUT /api/admin/wallet/withdrawals/:id/reject
 * @desc    Reject withdrawal
 * @access  Private (Admin)
 */
router.put('/withdrawals/:id/reject', walletAdminController.rejectWithdrawal);

module.exports = router;
