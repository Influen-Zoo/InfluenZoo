import apiClient from './apiClient';

export const adminService = {
  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data?.data || response.data;
  },

  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    const data = response.data;
    return data?.data || (Array.isArray(data) ? data : (data?.users || []));
  },

  async getCampaigns(params = {}) {
    const response = await apiClient.get('/admin/campaigns', { params });
    const data = response.data;
    return data?.data || (Array.isArray(data) ? data : (data?.campaigns || []));
  },

  async getPosts(params = {}) {
    const response = await apiClient.get('/admin/posts', { params });
    const data = response.data;
    return data?.data || (Array.isArray(data) ? data : (data?.posts || []));
  },

  async updateCampaignStatus(id, status) {
    const response = await apiClient.put(`/admin/campaigns/${id}/status`, { status });
    return response.data?.data || response.data;
  },

  async verifyUser(id) {
    const response = await apiClient.put(`/admin/users/${id}/verify`);
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await apiClient.put(`/admin/users/${id}/status`, { status });
    return response.data?.data || response.data;
  },

  async updateUserFollowers(id, followers) {
    const response = await apiClient.put(`/admin/users/${id}/followers`, { followers });
    return response.data?.data || response.data;
  },

  async getDisputes() {
    const response = await apiClient.get('/admin/disputes');
    return response.data?.data || [];
  },

  async getPlatformAnalytics() {
    const response = await apiClient.get('/admin/analytics');
    return response.data?.data || {
      monthlyRevenue: [],
      platformDistribution: {},
      totalUsers: 0,
      activeUsers: 0
    };
  },

  async updateCampaignCost(campaignId, cost) {
    const response = await apiClient.put(`/admin/campaigns/${campaignId}/cost`, { cost });
    return response.data;
  },

  async getAdminAnnouncements() {
    const response = await apiClient.get('/admin/announcements');
    return response.data?.data || response.data;
  },

  async updateAnnouncementCoinCost(id, cost) {
    const response = await apiClient.put(`/admin/announcements/${id}/cost`, { cost });
    return response.data?.data || response.data;
  },

  async getFeeStructure() {
    const response = await apiClient.get('/admin/fee-structure');
    return response.data?.data || response.data;
  },

  async updateFeeStructure(fees = {}) {
    const response = await apiClient.put('/admin/fee-structure', fees);
    return response.data?.data || response.data;
  },

  async getRazorpaySettings() {
    const response = await apiClient.get('/admin/razorpay-settings');
    return response.data?.data || response.data;
  },

  async updateRazorpaySettings(settings) {
    const response = await apiClient.put('/admin/razorpay-settings', settings);
    return response.data?.data || response.data;
  },

  async getCategories() {
    const response = await apiClient.get('/categories');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  async updateCategories(categories) {
    const response = await apiClient.put('/categories', { categories });
    return response.data?.data || response.data;
  },

  async blockPost(postId, reason) {
    const response = await apiClient.put(`/admin/posts/${postId}/block`, { reason });
    return response.data?.data || response.data;
  },

  async unblockPost(postId) {
    const response = await apiClient.put(`/admin/posts/${postId}/unblock`);
    return response.data?.data || response.data;
  },

  async updatePostLikes(postId, likes) {
    const response = await apiClient.put(`/admin/posts/${postId}/likes`, { likes });
    return response.data?.data || response.data;
  },

  async blockCampaign(campaignId, reason) {
    const response = await apiClient.put(`/admin/campaigns/${campaignId}/block`, { reason });
    return response.data?.data || response.data;
  },

  async unblockCampaign(campaignId) {
    const response = await apiClient.put(`/admin/campaigns/${campaignId}/unblock`);
    return response.data?.data || response.data;
  },

  async getWithdrawals(status = 'pending') {
    const response = await apiClient.get('/admin/wallet/withdrawals', { params: { status } });
    const data = response.data;
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async approveWithdrawal(id) {
    const response = await apiClient.put(`/admin/wallet/withdrawals/${id}/approve`);
    return response.data?.data || response.data;
  },

  async rejectWithdrawal(id, reason) {
    const response = await apiClient.put(`/admin/wallet/withdrawals/${id}/reject`, { reason });
    return response.data?.data || response.data;
  },

  async getOverviewAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/overview', { params });
    return response.data;
  },

  async getPostAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/posts', { params });
    return response.data;
  },

  async getCampaignAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/campaigns', { params });
    return response.data;
  },

  async getInfluencerAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/influencers', { params });
    return response.data;
  },

  async getBrandAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/brands', { params });
    return response.data;
  },

  async getRevenueAnalytics(params = {}) {
    const response = await apiClient.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  async getAdminCampaignApplications(id) {
    const response = await apiClient.get(`/admin/campaigns/${id}/applications`);
    return response.data;
  },

  // Badge Management
  async getBadges() {
    const response = await apiClient.get('/admin/badges');
    return response.data?.data || [];
  },

  async createBadge(formData) {
    const response = await apiClient.post('/admin/badges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  async updateBadge(id, formData) {
    const response = await apiClient.put(`/admin/badges/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  async deleteBadge(id) {
    const response = await apiClient.delete(`/admin/badges/${id}`);
    return response.data;
  },

  async assignBadgeToUser(userId, badgeId) {
    const response = await apiClient.post(`/admin/users/${userId}/badges/${badgeId}`);
    return response.data?.data || response.data;
  },

  async removeBadgeFromUser(userId, badgeId) {
    const response = await apiClient.delete(`/admin/users/${userId}/badges/${badgeId}`);
    return response.data?.data || response.data;
  }
};

export default adminService;
