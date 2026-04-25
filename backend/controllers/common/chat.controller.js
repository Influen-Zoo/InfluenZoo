const chatService = require('../../services/common/chat.service');

const chatController = {
  getConversations: async (req, res) => {
    try {
      const conversations = await chatService.getConversations(req.userId);
      res.json({ success: true, data: conversations });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  getMessages: async (req, res) => {
    try {
      const messages = await chatService.getMessages(req.params.conversationId, req.userId);
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  initiateChat: async (req, res) => {
    try {
      const result = await chatService.initiateChat(req.userId, req.params.influencerId, req.body.text, req.role);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error.message.includes('Only brands')) return res.status(403).json({ error: error.message });
      if (error.message.includes('required')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  },

  replyToChat: async (req, res) => {
    try {
      const message = await chatService.replyToChat(req.params.conversationId, req.userId, req.body.text);
      res.json({ success: true, data: message });
    } catch (error) {
      if (error.message.includes('required')) return res.status(400).json({ error: error.message });
      if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = chatController;
