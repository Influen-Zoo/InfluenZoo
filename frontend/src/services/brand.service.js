import apiClient from './apiClient';

export const brandService = {
  // Campaigns
  async getMyCampaigns() {
    const response = await apiClient.get('/brand/campaigns/my');
    return response.data?.campaigns || response.data?.data || (Array.isArray(response.data) ? response.data : []);
  },

  async getAllCampaigns() {
    const response = await apiClient.get('/influencer/campaigns');
    return response.data?.campaigns || response.data?.data || response.data || [];
  },

  async getAllPosts() {
    const response = await apiClient.get('/posts');
    return response.data?.posts || response.data?.data || (Array.isArray(response.data) ? response.data : []);
  },

  async createCampaign(formData) {
    const response = await apiClient.post('/brand/campaigns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data?.campaign || response.data;
  },

  async updateCampaign(id, formData) {
    const response = await apiClient.put(`/brand/campaigns/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data?.campaign || response.data;
  },

  async deleteCampaign(id) {
    const response = await apiClient.delete(`/brand/campaigns/${id}`);
    return response.data;
  },

  async getCampaignApplications(campaignId) {
    const response = await apiClient.get(`/brand/campaigns/${campaignId}/applications`);
    return response.data?.data || response.data?.applications || [];
  },

  async acceptApplication(id) {
    const response = await apiClient.put(`/brand/applications/${id}/accept`);
    return response.data;
  },

  async rejectApplication(id) {
    const response = await apiClient.put(`/brand/applications/${id}/reject`);
    return response.data;
  },

  // Influencer Discovery
  async getInfluencers(params = {}) {
    const response = await apiClient.get('/users/influencers', { params });
    return response.data?.data || response.data || [];
  },

  async getNewInfluencers() {
    const response = await apiClient.get('/brand/influencers/new');
    return response.data?.influencers || response.data || [];
  },

  async getFollowedInfluencers() {
    const response = await apiClient.get('/brand/influencers/followed');
    return response.data?.influencers || response.data || [];
  },

  // Wallet & Transactions
  async getWalletData() {
    const response = await apiClient.get('/wallet');
    return response.data?.data || response.data;
  },

  async buyCoins(amount) {
    const response = await apiClient.post('/wallet/topup', { amount });
    return response.data;
  },

  // Profile Management
  async getBrandProfile() {
    const response = await apiClient.get('/brand/profile');
    return response.data?.data || response.data;
  },

  async updateBrandProfile(payload) {
    const response = await apiClient.put('/brand/profile', payload);
    return response.data;
  },

  // Analytics
  async getDashboardAnalytics(timeframe = '28') {
    const response = await apiClient.get(`/analytics/brand?timeframe=${timeframe}`);
    return response.data?.data || response.data;
  },

  async getCampaignAnalytics(campaignId) {
    const response = await apiClient.get(`/analytics/campaign/${campaignId}`);
    return response.data?.data || response.data;
  },

  // Notifications
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data?.data || [];
  },

  async markNotificationAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Chat
  async getConversations() {
    const response = await apiClient.get('/messages/conversations');
    return response.data?.data || [];
  },

  async getMessages(conversationId) {
    const response = await apiClient.get(`/messages/${conversationId}`);
    return response.data?.data || [];
  },

  async sendMessage(conversationId, text) {
    const response = await apiClient.post(`/messages/${conversationId}`, { text });
    return response.data?.data || response.data;
  },

  async initiateChat(influencerId, text) {
    const response = await apiClient.post(`/messages/initiate/${influencerId}`, { text });
    return response.data?.data || response.data;
  }
};

export default brandService;
