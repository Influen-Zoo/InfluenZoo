const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seedMessages = async (userList) => {
    try {
        console.log('🌱 Seeding conversations and messages (100+ items)...');

        const influencers = userList.filter(u => u.role === 'influencer');
        const brands = userList.filter(u => u.role === 'brand');
        
        const createdConversations = [];
        const createdMessages = [];

        // Create 20 conversations between random influencers and brands
        for (let i = 0; i < 20; i++) {
            const influencer = influencers[i % influencers.length];
            const brand = brands[i % brands.length];

            const conversation = new Conversation({
                participants: [influencer._id, brand._id]
            });
            await conversation.save();
            createdConversations.push(conversation);

            // Generate 5-8 messages per conversation
            const msgCount = 5 + Math.floor(Math.random() * 4);
            for (let j = 0; j < msgCount; j++) {
                const isInfluencerSender = j % 2 === 0;
                const message = new Message({
                    conversationId: conversation._id,
                    sender: isInfluencerSender ? influencer._id : brand._id,
                    text: j === 0 ? `Hi ${brand.name}, I am interested in your campaign!` : `Reply message #${j} in the thread.`,
                });
                await message.save();
                createdMessages.push(message);
                
                // Update last message in conversation
                if (j === msgCount - 1) {
                    conversation.lastMessage = message._id;
                    await conversation.save();
                }
            }
        }

        console.log(`✅ ${createdConversations.length} conversations and ${createdMessages.length} messages seeded successfully`);
        return { createdConversations, createdMessages };
    } catch (error) {
        console.error('❌ Error seeding messages:', error.message);
        throw error;
    }
};

module.exports = { seedMessages };
