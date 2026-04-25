const express = require('express');
const router = express.Router();
const walletController = require('../controllers/common/wallet.controller');
const { authMiddleware } = require('../middleware/auth/auth.middleware');

router.get('/', authMiddleware, walletController.getWallet);
router.post('/topup', authMiddleware, walletController.topUpCoins);
router.post('/withdraw', authMiddleware, walletController.withdrawEarnings);

module.exports = router;
