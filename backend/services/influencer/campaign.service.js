const Campaign = require('../../models/Campaign');
const User = require('../../models/User');
const Analytics = require('../../models/Analytics');
const { normalizeCampaignForResponse } = require('../../utils/campaignPayload');

const influencerCampaignService = {
  getCampaigns: async (userId, type = 'all') => {
    let query = { 
      blocked: false,
      status: 'active',           // Only show active campaigns in discover
      visibility: { $ne: 'private' },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gt: new Date() } }
      ]
    };

    if (type === 'followed' && userId) {
      const user = await User.findById(userId);
      if (user && user.following && user.following.length > 0) {
        query.author = { $in: user.following };
      } else if (user) {
        // User follows no one, return empty to satisfy the "Followed" filter
        return [];
      }
    }

    let dbQuery = Campaign.find(query)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });

    if (type === 'new') {
      dbQuery = dbQuery.limit(20);
    }

    const campaigns = await dbQuery;
    return campaigns.map(normalizeCampaignForResponse);
  },

  likeCampaign: async (campaignId, userId) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const index = campaign.likes.indexOf(userId);
    let action = 'liked';

    if (index === -1) {
      campaign.likes.push(userId);
      // Log to Analytics - Credit the Campaign AUTHOR
      await Analytics.create({
        userId: campaign.author,
        campaignId,
        type: 'engagement',
        metadata: { likes: 1, platform: 'Influence', action: 'like' }
      });
    } else {
      campaign.likes.splice(index, 1);
      action = 'unliked';
    }

    await campaign.save();
    return campaign.likes;
  },

  commentOnCampaign: async (campaignId, userId, text) => {
    if (!text || !text.trim()) throw new Error('Comment text is required');

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.comments.push({ user: userId, text: text.trim() });
    await campaign.save();

    // Log to Analytics - Credit the Campaign AUTHOR
    await Analytics.create({
      userId: campaign.author,
      campaignId,
      type: 'engagement',
      metadata: { comments: 1, platform: 'Influence', action: 'comment' }
    });

    const populated = await Campaign.findById(campaignId).populate('comments.user', 'name avatar');
    return populated.comments;
  }
};

module.exports = { influencerCampaignService };
