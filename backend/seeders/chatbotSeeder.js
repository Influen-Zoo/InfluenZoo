const ChatbotMessage = require('../models/ChatbotMessage');

const chatbotMessages = [
  {
    message: 'How can I find campaigns that match my niche?',
    response: 'You can filter campaigns by category, required followers, and engagement rate. Check the Discover section to browse active campaigns.',
    category: 'campaigns',
  },
  {
    message: 'What is the application process for a campaign?',
    response: 'Simply click on a campaign, review the details, and submit an application with your proposal. Brands will review and accept or reject your application.',
    category: 'applications',
  },
  {
    message: 'How do I increase my engagement rate?',
    response: 'Post consistently, engage with your audience, use trending hashtags, and create quality content. Check your Analytics dashboard for detailed metrics.',
    category: 'analytics',
  },
  {
    message: 'Can I edit my profile after registration?',
    response: 'Yes, you can update your profile information anytime from the Profile settings. Update your bio, social links, and profile picture.',
    category: 'profile',
  },
  {
    message: 'How long does it take to get accepted?',
    response: 'Acceptance time varies by brand, typically 3-7 days. You can track application status in your Applications dashboard.',
    category: 'applications',
  },
  {
    message: 'What payment methods do you support?',
    response: 'Payments are transferred directly after campaign completion. Check your Payments section for payout details and available methods.',
    category: 'payments',
  },
  {
    message: 'How do I report a campaign or brand?',
    response: 'You can report issues through the Report button on the campaign page. Our support team will review and take appropriate action.',
    category: 'support',
  },
  {
    message: 'Can I apply to multiple campaigns?',
    response: 'Yes! You can apply to as many campaigns as you want. However, ensure you can deliver on your commitments.',
    category: 'applications',
  },
  {
    message: 'How is my engagement rate calculated?',
    response: 'Engagement rate is calculated as (likes + comments + shares) / followers * 100. Higher engagement means better campaign performance.',
    category: 'analytics',
  },
  {
    message: 'What happens if I cannot deliver?',
    response: 'Late or incomplete deliveries may affect your rating and future campaign opportunities. Always communicate with brands about delays.',
    category: 'campaigns',
  },
  {
    message: 'How do I get verified on the platform?',
    response: 'Verified status is granted to established influencers with consistent growth and engagement. Contact support to request verification.',
    category: 'profile',
  },
  {
    message: 'Can I cancel an accepted application?',
    response: 'You can cancel before the campaign start date. Cancellations after start may result in penalties. Contact the brand first.',
    category: 'applications',
  },
  {
    message: 'What is the minimum follower requirement?',
    response: 'Requirements vary by campaign. Some accept micro-influencers with 10k followers, others require 100k+. Filter campaigns by your follower count.',
    category: 'campaigns',
  },
  {
    message: 'How do I improve my profile visibility?',
    response: 'Complete your profile, add clear photos, write an engaging bio, and keep your analytics updated. Top performers appear in Featured section.',
    category: 'profile',
  },
  {
    message: 'What content deliverables are most requested?',
    response: 'Instagram Reels, TikTok videos, and Stories are currently most popular. YouTube reviews and blog posts are also in high demand.',
    category: 'campaigns',
  },
];

const seedChatbot = async (userMap) => {
  try {
    console.log('🌱 Seeding chatbot messages...');
    
    // Create chatbot messages for random influencers
    const influencers = userMap.filter(u => u.role === 'influencer');

    const chatbotWithUserIds = chatbotMessages.map((msg, index) => {
      const influencer = influencers[Math.floor(Math.random() * influencers.length)];
      return {
        ...msg,
        userId: influencer?._id || userMap[0]._id,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      };
    });

    const createdMessages = await ChatbotMessage.insertMany(chatbotWithUserIds);
    console.log(`✅ ${createdMessages.length} chatbot messages seeded successfully`);
    return createdMessages;
  } catch (error) {
    console.error('❌ Error seeding chatbot messages:', error.message);
    throw error;
  }
};

module.exports = { seedChatbot };
