/**
 * analyticsProcessor.js
 * Business logic module for computing platform analytics and aggregating charts.
 */

export const calculateEngagementMetrics = (engagementTrend) => {
  const safeTrend = engagementTrend || [];
  const totalEngagement = safeTrend.reduce((sum, item) => sum + (item.value || 0), 0);
  const avgEngagement = safeTrend.length ? (totalEngagement / safeTrend.length).toFixed(1) : 0;
  
  const totalLikes = safeTrend.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalComments = safeTrend.reduce((sum, item) => sum + (item.comments || 0), 0);

  return { totalEngagement, avgEngagement, totalLikes, totalComments };
};

export const mapCategoryDistribution = (entities) => {
  const categories = (entities || []).reduce((acc, entity) => {
    const cat = entity.category || entity.niche || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
};

export const mapStatusDistribution = (entities) => {
  const statuses = (entities || []).reduce((acc, entity) => {
    const s = entity.blocked ? 'Blocked' : 'Active';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(statuses).map(([name, value]) => ({ name, value }));
};

export const calculateCampaignMetrics = (campaigns, budgetRoi) => {
  const safeCampaigns = campaigns || [];
  const totalBudget = safeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const activeCampaigns = safeCampaigns.filter(c => c.status === 'active').length;

  const totalAppsFromRoi = (budgetRoi || []).reduce((sum, item) => sum + (item.applications || 0), 0);
  const avgApps = safeCampaigns.length ? (totalAppsFromRoi / safeCampaigns.length).toFixed(1) : 0;

  return { totalBudget, activeCampaigns, totalAppsFromRoi, avgApps };
};

export const mapBudgetSegmentation = (campaigns) => {
  const safeCampaigns = campaigns || [];
  return [
    { name: 'Micro (<10k)', value: safeCampaigns.filter(c => (c.budget || 0) < 10000).length },
    { name: 'Standard (10k-50k)', value: safeCampaigns.filter(c => (c.budget || 0) >= 10000 && (c.budget || 0) <= 50000).length },
    { name: 'Enterprise (>50k)', value: safeCampaigns.filter(c => (c.budget || 0) > 50000).length }
  ];
};

export const mapInfluencerGrowthLeaderboard = (influencers, reachTrend, growthTrend) => {
  const totalFollowers = (influencers || []).reduce((sum, inf) => sum + (inf.followers?.length || 0), 0);
  const avgEngagement = ((influencers || []).reduce((sum, inf) => sum + (parseFloat(inf.engagementRate) || 0), 0) / Math.max((influencers || []).length, 1)).toFixed(1);
  const totalEarnings = (influencers || []).reduce((sum, inf) => sum + (inf.totalEarnings || 0), 0);

  const combinedReachData = (reachTrend || []).map(r => {
    const growth = (growthTrend || []).find(g => g.month === r.month);
    return { ...r, followers: growth ? growth.count : 0 };
  });

  return { totalFollowers, avgEngagement, totalEarnings, combinedReachData };
};

export const resolveAuthorName = (post, masterInfluencers) => {
  if (post.authorDetails?.name) return post.authorDetails.name;
  
  const authorId = post.authorId || post.influencerId || post.author?._id || post.author;
  if (authorId && typeof authorId === 'string' && authorId.length > 20) {
    const found = masterInfluencers.find(i => i._id === authorId);
    if (found?.name) return found.name;
  }
  if (typeof post.author === 'string') return post.author;

  return post.authorName || post.author?.name || 'Influencer';
};
