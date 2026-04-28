const express = require('express');
const router = express.Router();
const walletController = require('../controllers/common/wallet.controller');
const { authMiddleware } = require('../middleware/auth/auth.middleware');

router.get('/', authMiddleware, walletController.getWallet);
router.get('/payment-config', authMiddleware, walletController.getPaymentConfig);
router.post('/buy-coins', authMiddleware, walletController.createCoinOrder);
router.post('/verify-payment', authMiddleware, walletController.verifyCoinPayment);
router.post('/withdraw', authMiddleware, walletController.withdrawEarnings);

module.exports = router;
