const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/common/chat.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');

router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/:conversationId', authMiddleware, chatController.getMessages);
router.post('/initiate/:influencerId', authMiddleware, chatController.initiateChat);
router.post('/:conversationId', authMiddleware, chatController.replyToChat);

module.exports = router;
