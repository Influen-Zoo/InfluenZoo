/**
 * discoveryProcessor.js
 * Business logic for filtering and aggregating data in Discovery (Influencer & Brand Feeds)
 */

export const mapCampaignExploreData = (data, searchQuery) => {
  let mapped = (Array.isArray(data) ? data : []).map(c => ({
    ...c,
    brandName: c.author?.name || 'Brand',
    brandAvatar: c.author?.avatar,
    type: c.compensation === 'paid' ? 'paid' : (c.compensation === 'both' ? 'both' : 'product'),
    description: c.content,
    coinCost: c.coinCost ?? 0,
    deliverables: Array.isArray(c.deliverables) ? c.deliverables : (c.deliverables ? [c.deliverables] : []),
    media: c.media || [],
  }));
  
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    mapped = mapped.filter(c => 
      c.brandName?.toLowerCase().includes(lowerQ) ||
      c.description?.toLowerCase().includes(lowerQ) ||
      c.deliverables?.some(d => typeof d === 'string' && d.toLowerCase().includes(lowerQ))
    );
  }
  return mapped;
};

export const filterBrandsBySearch = (data, searchQuery) => {
  let filtered = Array.isArray(data) ? data : [];
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    filtered = filtered.filter(u => 
      u.name?.toLowerCase().includes(lowerQ) || 
      u.category?.toLowerCase().includes(lowerQ)
    );
  }
  return filtered;
};

export const filterBrandPostsBySearch = (data, searchQuery) => {
  let filtered = data;
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    filtered = data.filter(p => 
      p.content?.toLowerCase().includes(lowerQ) || 
      p.author?.name?.toLowerCase().includes(lowerQ)
    );
  }
  return filtered;
};

export const filterInfluencersBySearch = (data, searchQuery) => {
  let filtered = data;
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    filtered = data.filter(u => 
      u.name?.toLowerCase().includes(lowerQ) || 
      u.category?.toLowerCase().includes(lowerQ) ||
      u.userBio?.bio?.toLowerCase().includes(lowerQ)
    );
  }
  return filtered;
};
