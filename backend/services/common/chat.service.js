const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

const chatService = {
  getConversations: async (userId) => {
    return await Conversation.find({ participants: userId })
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  },

  getMessages: async (conversationId, userId) => {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );
    return messages;
  },

  initiateChat: async (brandId, influencerId, text, role) => {
    if (role !== 'brand') throw new Error('Only brands can initiate chats');
    if (!text) throw new Error('Message text is required');

    let conversation = await Conversation.findOne({
      participants: { $all: [brandId, influencerId] }
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [brandId, influencerId] });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: brandId,
      text
    });
    await message.save();

    conversation.lastMessage = message._id;
    await conversation.save();

    const sender = await User.findById(brandId);
    const notification = new Notification({
      recipient: influencerId,
      sender: brandId,
      type: 'message',
      title: 'New Message',
      message: `New message from ${sender?.name || 'a brand'}`,
      relatedId: conversation._id
    });
    await notification.save();

    return { conversation, message };
  },

  replyToChat: async (conversationId, userId, text) => {
    if (!text) throw new Error('Message text is required');
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (!conversation.participants.includes(userId)) throw new Error('Not authorized');

    const message = new Message({
      conversationId: conversation._id,
      sender: userId,
      text
    });
    await message.save();

    conversation.lastMessage = message._id;
    await conversation.save();

    const recipientId = conversation.participants.find(p => p.toString() !== userId.toString());
    const sender = await User.findById(userId);
    const notification = new Notification({
      recipient: recipientId,
      sender: userId,
      type: 'message',
      title: 'New Reply',
      message: `New message from ${sender?.name || 'User'}`,
      relatedId: conversation._id
    });
    await notification.save();

    return message;
  }
};

module.exports = chatService;
