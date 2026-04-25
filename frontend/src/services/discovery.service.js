import apiClient from './apiClient';

export const discoveryService = {
  async getInfluencers(params = {}) {
    const response = await apiClient.get('/users/influencers', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  async getNewBrands() {
    const response = await apiClient.get('/influencer/brands/new');
    return Array.isArray(response.data?.brands) ? response.data.brands : [];
  },

  async getFollowedBrands() {
    const response = await apiClient.get('/influencer/brands/followed');
    return Array.isArray(response.data?.brands) ? response.data.brands : [];
  },

  async getNewInfluencers() {
    const response = await apiClient.get('/brand/influencers/new');
    return Array.isArray(response.data?.influencers) ? response.data.influencers : [];
  },

  async getFollowedInfluencers() {
    const response = await apiClient.get('/brand/influencers/followed');
    return Array.isArray(response.data?.influencers) ? response.data.influencers : [];
  }
};

export default discoveryService;
