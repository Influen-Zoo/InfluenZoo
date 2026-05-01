const Campaign = require('../../models/Campaign');
const campaignRevenueService = require('../campaignRevenue.service');
const {
  parseStringList,
  normalizePlatforms,
  normalizeCampaignForResponse,
} = require('../../utils/campaignPayload');

const parseMedia = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => {
    let type = 'image';
    if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype.startsWith('audio/')) type = 'audio';
    else if (file.mimetype === 'image/gif') type = 'gif';
    return { url: `/uploads/${file.filename}`, type };
  });
};

const parseTags = (tags) => {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()); }
};

const parseDeliverables = (deliverables) => {
  if (!deliverables) return [];
  try { return JSON.parse(deliverables); }
  catch { return Array.isArray(deliverables) ? deliverables : [deliverables]; }
};

const isCampaignDetailsEnabled = (data) => data.campaignDetailsEnabled === true || data.campaignDetailsEnabled === 'true';

const brandCampaignService = {
  createCampaign: async (authorId, data, files) => {
    const platforms = normalizePlatforms(data.platforms, data.platform);
    const outlets = parseStringList(data.outlets);
    if (isCampaignDetailsEnabled(data) && platforms.length === 0) {
      throw new Error('At least one platform is required');
    }

    const newCampaign = await Campaign.create({
      author: authorId,
      title: data.title || undefined,
      content: data.content,
      media: parseMedia(files),
      tags: parseTags(data.tags),
      budget: data.budget || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      category: data.category || undefined,
      compensation: data.compensation || 'paid',
      status: data.status || 'active',
      visibility: data.visibility || 'public',
      requirements: data.requirements || undefined,
      deliverables: parseDeliverables(data.deliverables),
      ...(platforms.length > 0 ? { platforms, platform: platforms[0] } : {}),
      outlets,
    });

    const populated = await Campaign.findById(newCampaign._id).populate('author', 'name avatar');
    // Record platform revenue snapshot with current fee rates (fire-and-forget)
    campaignRevenueService.recordCampaignCreation(newCampaign).catch(() => {});
    return normalizeCampaignForResponse(populated);
  },

  getMyCampaigns: async (authorId) => {
    // Brand should see all their campaigns including blocked ones
    const campaigns = await Campaign.find({ author: authorId })
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });
    return campaigns.map(normalizeCampaignForResponse);
  },

  updateCampaign: async (campaignId, authorId, data, files) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.author.toString() !== authorId) {
      throw new Error('Not authorized to edit this campaign');
    }

    let parsedRetainedMedia = [];
    if (data.retainedMedia) {
      try { parsedRetainedMedia = JSON.parse(data.retainedMedia); } catch { parsedRetainedMedia = []; }
    }

    campaign.media = [...parsedRetainedMedia, ...parseMedia(files)];
    if(data.tags !== undefined) campaign.tags = parseTags(data.tags);
    if(data.deliverables !== undefined) campaign.deliverables = parseDeliverables(data.deliverables);
    if(data.content !== undefined) campaign.content = data.content;
    if(data.title !== undefined) campaign.title = data.title;
    if(data.budget !== undefined) campaign.budget = data.budget;
    if(data.startDate !== undefined) campaign.startDate = data.startDate;
    if(data.endDate !== undefined) campaign.endDate = data.endDate;
    if(data.category !== undefined) campaign.category = data.category;
    if(data.compensation !== undefined) campaign.compensation = data.compensation;
    if(data.platforms !== undefined) {
      const platforms = normalizePlatforms(data.platforms, data.platform);
      if (isCampaignDetailsEnabled(data) && platforms.length === 0) {
        throw new Error('At least one platform is required');
      }
      campaign.platforms = platforms;
      campaign.platform = platforms[0] || 'Other';
    }
    if(data.outlets !== undefined) campaign.outlets = parseStringList(data.outlets);
    if(data.status !== undefined) campaign.status = data.status;
    if(data.visibility !== undefined) campaign.visibility = data.visibility;
    if(data.requirements !== undefined) campaign.requirements = data.requirements;

    await campaign.save();

    const populated = await Campaign.findById(campaign._id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');
    return normalizeCampaignForResponse(populated);
  },

  deleteCampaign: async (campaignId, userId, userRole) => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.author.toString() !== userId && userRole !== 'admin') {
      throw new Error('Not authorized to delete this campaign');
    }
    await campaign.deleteOne();
    return { success: true };
  }
};

module.exports = { brandCampaignService };
