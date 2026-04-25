const express = require('express');
const chatbotController = require('../../controllers/common/chatbot.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/chatbot
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post('/', authMiddleware, chatbotController.sendMessage);

/**
 * @route   GET /api/chatbot/history
 * @desc    Get chatbot message history
 * @access  Private
 */
router.get('/history', authMiddleware, chatbotController.getHistory);

module.exports = router;
