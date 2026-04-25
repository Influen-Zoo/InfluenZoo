/**
 * adminProcessor.js
 * Business logic for filtering and aggregating data in the Admin Panel
 */

export const filterAdminCampaigns = (campaigns, filter) => {
  return campaigns.filter(c => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.category && (c.category || 'Other') !== filter.category) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) && !(c.author?.name || c.brandName)?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};

export const getAdminCampaignStats = (campaigns) => {
  return {
    total: campaigns.length,
    activeCount: campaigns.filter(c => c.status === 'active').length,
    totalApps: campaigns.reduce((sum, c) => sum + (c.applicationsCount || 0), 0),
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
  };
};

export const filterAdminPosts = (posts, filter) => {
  return posts.filter(p => {
    if (filter.category && (p.category || 'Other') !== filter.category) return false;
    if (filter.status) {
      const isBlocked = p.blocked === true;
      if (filter.status === 'blocked' && !isBlocked) return false;
      if (filter.status === 'active' && isBlocked) return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!(p.caption || p.content)?.toLowerCase().includes(q) && !p.author?.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};

export const getAdminPostStats = (posts) => {
  const totalEngagement = posts.reduce((sum, p) => sum + ((Array.isArray(p.likes) ? p.likes.length : 0) + (Array.isArray(p.comments) ? p.comments.length : 0)), 0);
  const avgEngagement = (totalEngagement / (posts.length || 1)).toFixed(1);
  return {
    total: posts.length,
    totalEngagement,
    avgEngagement,
    estReach: (posts.length * 150)
  };
};

export const filterAdminUsers = (users, filter) => {
  return users.filter(u => {
    if (filter.role && u.role !== filter.role) return false;
    if (filter.status && u.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};
