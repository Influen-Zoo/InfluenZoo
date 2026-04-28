import apiClient from './apiClient';

export const influencerService = {
  // Feed & Posts
  async getFeed() {
    const response = await apiClient.get('/posts');
    return response.data?.posts || response.data?.data || (Array.isArray(response.data) ? response.data : []);
  },

  async createPost(formData) {
    const response = await apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Campaigns & Applications
  async getCampaigns(params = {}) {
    const response = await apiClient.get('/influencer/campaigns', { params });
    return response.data?.campaigns || response.data?.data || response.data || [];
  },

  async getExploreItems(params = {}) {
    const response = await apiClient.get('/influencer/campaigns', { params });
    return response.data?.campaigns || response.data?.data || response.data || [];
  },

  async getNewBrands() {
    const response = await apiClient.get('/influencer/brands/new');
    return response.data?.brands || response.data?.data || (Array.isArray(response.data) ? response.data : []);
  },

  async getFollowedBrands() {
    const response = await apiClient.get('/influencer/brands/followed');
    return response.data?.brands || response.data?.data || (Array.isArray(response.data) ? response.data : []);
  },

  async applyToCampaign(campaignId, message) {
    const response = await apiClient.post('/influencer/applications', { 
      campaignId, 
      coverLetter: message 
    });
    return response.data;
  },

  async toggleSaveCampaign(campaignId) {
    const response = await apiClient.post(`/users/campaigns/${campaignId}/toggle-save`);
    return response.data;
  },

  async getMyApplications() {
    const response = await apiClient.get('/influencer/applications/my');
    return response.data?.data || response.data || [];
  },

  // Wallet & Transactions
  async getWalletData() {
    const response = await apiClient.get('/wallet');
    return response.data?.data || response.data;
  },

  async buyCoins(amount) {
    const response = await apiClient.post('/wallet/buy-coins', { amount });
    return response.data?.data || response.data;
  },

  async withdrawEarnings(amount, details) {
    const response = await apiClient.post('/wallet/withdraw', { amount, details });
    return response.data;
  },

  // Profile Management
  async getFullProfile(userId) {
    const response = await apiClient.get(`/users/profile/${userId}`);
    return response.data?.data || response.data;
  },

  async updateProfile(payload) {
    const response = await apiClient.put('/users/profile', payload);
    return response.data;
  },

  async saveUserBio(payload) {
    const response = await apiClient.put('/users/bio', payload);
    return response.data;
  },

  async addEducation(payload) {
    const response = await apiClient.post('/users/education', payload);
    return response.data;
  },

  async updateEducation(id, payload) {
    const response = await apiClient.put(`/users/education/${id}`, payload);
    return response.data;
  },

  async deleteEducation(id) {
    const response = await apiClient.delete(`/users/education/${id}`);
    return response.data;
  },

  async addWork(payload) {
    const response = await apiClient.post('/users/work', payload);
    return response.data;
  },

  async updateWork(id, payload) {
    const response = await apiClient.put(`/users/work/${id}`, payload);
    return response.data;
  },

  async deleteWork(id) {
    const response = await apiClient.delete(`/users/work/${id}`);
    return response.data;
  },

  // Social & Follow
  async followBrand(brandId) {
    const response = await apiClient.post(`/users/${brandId}/follow`);
    return response.data;
  },

  async unfollowBrand(brandId) {
    const response = await apiClient.delete(`/users/${brandId}/unfollow`);
    return response.data;
  },

  // Notifications
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data?.data || response.data?.notifications || [];
  },

  async markNotificationAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Chat
  async getConversations() {
    const response = await apiClient.get('/messages/conversations');
    return response.data?.data || response.data || [];
  },

  async getMessages(conversationId) {
    const response = await apiClient.get(`/messages/${conversationId}`);
    return response.data?.data || response.data || [];
  },

  async sendMessage(conversationId, text) {
    const response = await apiClient.post(`/messages/${conversationId}`, { text });
    return response.data?.data || response.data;
  }
};

export default influencerService;
