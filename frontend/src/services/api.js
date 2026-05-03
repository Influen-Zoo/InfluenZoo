import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE}/api`,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.isRefreshing = false;
    this.refreshSubscribers = [];

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;
        const originalRequest = config;

        if (response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Already refreshing, queue this request
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token) => {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token available');

            const res = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            this.isRefreshing = false;
            
            // Re-run original request
            originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
            const retryOriginalRequest = this.client(originalRequest);

            // Notify all subscribers
            this.refreshSubscribers.forEach((callback) => callback(accessToken));
            this.refreshSubscribers = [];

            return retryOriginalRequest;
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // Only redirect if we are not already on the auth page
            if (!window.location.pathname.includes('/auth')) {
              window.location.href = '/auth';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  }

  async register(data) {
    const response = await this.client.post('/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Legacy campaign helpers (re-route to getCampaigns for InfluencerDashboard explore)
  async getBrandCampaigns(params = {}) {
    return this.getMyCampaigns();
  }

  async applyToCampaign(campaignId, data) {
    const response = await this.client.post('/influencer/applications', { campaignId, ...data });
    return response.data?.data || response.data;
  }

  async getMyApplications() {
    const response = await this.client.get('/influencer/applications/my');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.applications || []);
  }

  async getCampaignApplications(campaignId) {
    const response = await this.client.get(`/brand/campaigns/${campaignId}/applications`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.applications || []);
  }

  async acceptApplication(id) {
    const response = await this.client.put(`/brand/applications/${id}/accept`);
    return response.data?.data || response.data;
  }

  async rejectApplication(id) {
    const response = await this.client.put(`/brand/applications/${id}/reject`);
    return response.data?.data || response.data;
  }

  // Posts
  async getPosts() {
    const response = await this.client.get('/posts');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.posts || []);
  }

  // Financials & Wallet
  async buyCoins(amount) {
    const response = await this.client.post('/wallet/buy-coins', { amount });
    return response.data?.data || response.data;
  }

  async getWallet() {
    const response = await this.client.get('/wallet');
    return response.data?.data || response.data;
  }

  async withdrawEarnings(amount, details) {
    const response = await this.client.post('/wallet/withdraw', { amount, details });
    return response.data?.data || response.data;
  }

  async createPost(formData) {
    const response = await this.client.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.post || response.data;
  }

  async likePost(id) {
    const response = await this.client.post(`/posts/${id}/like`);
    return response.data;
  }

  async commentOnPost(id, text) {
    const response = await this.client.post(`/posts/${id}/comment`, { text });
    return response.data;
  }

  async updatePost(id, formData) {
    const response = await this.client.put(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.post || response.data;
  }

  async deletePost(id) {
    const response = await this.client.delete(`/posts/${id}`);
    return response.data;
  }

  // Campaigns (unified — was Brand Announcements)
  async getCampaigns(params = {}) {
    const response = await this.client.get('/influencer/campaigns', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.campaigns || data?.data || []);
  }

  async getMyCampaigns() {
    const response = await this.client.get('/brand/campaigns/my');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.campaigns || data?.data || []);
  }

  async createCampaign(formData) {
    const response = await this.client.post('/brand/campaigns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data;
    if (data?.campaign) {
      return {
        ...data.campaign,
        creationFeeCharged: data.creationFeeCharged,
        updatedCoinBalance: data.updatedCoinBalance,
        message: data.message
      };
    }
    return data;
  }

  async likeCampaign(id) {
    const response = await this.client.post(`/influencer/campaigns/${id}/like`);
    return response.data;
  }

  async commentOnCampaign(id, text) {
    const response = await this.client.post(`/influencer/campaigns/${id}/comment`, { text });
    return response.data;
  }

  async updateCampaign(id, formData) {
    const response = await this.client.put(`/brand/campaigns/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.campaign || response.data;
  }

  async deleteCampaign(id) {
    const response = await this.client.delete(`/brand/campaigns/${id}`);
    return response.data;
  }

  // Users
  async getUserProfile(id) {
    const response = await this.client.get(`/users/profile/${id}`);
    const data = response.data;
    return data?.data || data;
  }

  async updateProfile(data) {
    const response = await this.client.put('/users/profile', data);
    return response.data?.data || response.data;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.url || response.data;
  }

  // Analytics
  async getInfluencerDashboardAnalytics(timeframe = '28') {
    const response = await this.client.get(`/influencer/analytics?timeframe=${timeframe}`);
    return response.data?.data || response.data;
  }
  async getBrandAnalytics() {
    const response = await this.client.get('/analytics/brand');
    const data = response.data;
    return data?.data || data;
  }

  // Full brand analytics with timeframe filter (for Campaign Analytics Dashboard)
  async getBrandDashboardAnalytics(timeframe = '28') {
    const response = await this.client.get(`/analytics/brand?timeframe=${timeframe}`);
    return response.data?.data || response.data;
  }

  async getCampaignAnalytics(campaignId) {
    const response = await this.client.get(`/analytics/campaign/${campaignId}`);
    const data = response.data;
    return data?.data || data;
  }

  // Notifications
  async getNotifications() {
    const response = await this.client.get('/notifications');
    return response.data?.data || [];
  }

  async markNotificationAsRead(id) {
    const response = await this.client.put(`/notifications/${id}/read`);
    return response.data?.data || response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.put('/notifications/read-all');
    return response.data;
  }

  // Messaging
  async getConversations() {
    const response = await this.client.get('/messages/conversations');
    return response.data?.data || [];
  }

  async getMessages(conversationId) {
    const response = await this.client.get(`/messages/${conversationId}`);
    return response.data?.data || [];
  }

  async sendMessage(conversationId, text) {
    const response = await this.client.post(`/messages/${conversationId}`, { text });
    return response.data?.data || response.data;
  }

  async initiateChat(influencerId, text) {
    const response = await this.client.post(`/messages/initiate/${influencerId}`, { text });
    return response.data?.data || response.data;
  }

  // Wallet & Coins (placeholder - returns mock data for now)
  async getWalletTransactions() {
    const response = await this.client.get('/wallet/transactions');
    return response.data?.data || { transactions: [], balance: 0 };
  }

  async uploadBanner(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.url || response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async getBrandLogos() {
    try {
      const response = await this.client.get('/brand-logos');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      if (error.response?.status === 404) return [];
      throw error;
    }
  }

  async getBrandLogoSettings() {
    try {
      const response = await this.client.get('/brand-logos/settings');
      return response.data?.data || { scrollSpeed: 18, spacing: 40, showSeparator: false };
    } catch (error) {
      return { scrollSpeed: 18, spacing: 40, showSeparator: false };
    }
  }

  async getAdminBrandLogos() {
    try {
      const response = await this.client.get('/admin/brand-logos');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Brand logo API was not found. Restart the backend server so the new routes are loaded.');
      }
      throw error;
    }
  }

  async createAdminBrandLogo(formData) {
    const response = await this.client.post('/admin/brand-logos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  }

  async updateAdminBrandLogo(id, formData) {
    const response = await this.client.put(`/admin/brand-logos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  }

  async deleteAdminBrandLogo(id) {
    const response = await this.client.delete(`/admin/brand-logos/${id}`);
    return response.data?.data || response.data;
  }

  async getAdminBrandLogoSettings() {
    const response = await this.client.get('/admin/carousel-settings');
    return response.data?.data || { scrollSpeed: 18, spacing: 40, showSeparator: false };
  }

  async updateAdminBrandLogoSettings(settings) {
    const response = await this.client.put('/admin/carousel-settings', settings);
    return response.data?.data || response.data;
  }

  async getAdminCategories() {
    const response = await this.client.get('/categories');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async updateAdminCategories(categories) {
    const response = await this.client.put('/categories', { categories });
    return response.data?.data || response.data;
  }

  async uploadProfilePicture(formData) {
    const response = await this.client.post('/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  }

  async updateUserAvatar(avatar) {
    const response = await this.client.put('/users/profile', { avatar });
    return response.data?.data || response.data;
  }

  async saveUserBio(data) {
    const response = await this.client.post('/users/bio', data);
    return response.data?.data || response.data;
  }

  async addEducation(data) {
    const response = await this.client.post('/users/education', data);
    return response.data?.data || response.data;
  }

  async updateEducation(id, data) {
    const response = await this.client.put(`/users/education/${id}`, data);
    return response.data?.data || response.data;
  }

  async deleteEducation(id) {
    const response = await this.client.delete(`/users/education/${id}`);
    return response.data?.data || response.data;
  }

  async addWork(data) {
    const response = await this.client.post('/users/work', data);
    return response.data?.data || response.data;
  }

  async updateWork(id, data) {
    const response = await this.client.put(`/users/work/${id}`, data);
    return response.data?.data || response.data;
  }

  async deleteWork(id) {
    const response = await this.client.delete(`/users/work/${id}`);
    return response.data?.data || response.data;
  }

  // Chatbot
  async chat(messages) {
    const response = await this.client.post('/chatbot', { messages });
    const data = response.data;
    return data?.data || data;
  }

  async getChatHistory() {
    const response = await this.client.get('/chatbot/history');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.history || []);
  }

  // Admin
  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    const data = response.data;
    return data?.data || data;
  }

  async getAdminUsers(params = {}) {
    const response = await this.client.get('/admin/users', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.users || []);
  }

  async getAdminCampaigns(params = {}) {
    const response = await this.client.get('/admin/campaigns', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.campaigns || []);
  }

  async getAdminPosts(params = {}) {
    const response = await this.client.get('/admin/posts', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.posts || []);
  }

  async updateCampaignStatus(id, status) {
    const response = await this.client.put(`/admin/campaigns/${id}/status`, { status });
    return response.data?.data || response.data;
  }

  async verifyUser(id) {
    const response = await this.client.put(`/admin/users/${id}/verify`);
    return response.data;
  }

  async getAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics', { params });
    return response.data;
  }

  // Admin - Additional methods
  async getDisputes() {
    const response = await this.client.get('/admin/disputes');
    return response.data?.data || [];
  }

  async getPlatformAnalytics() {
    const response = await this.client.get('/admin/analytics');
    return response.data?.data || {
      monthlyRevenue: [],
      platformDistribution: {},
      totalUsers: 0,
      activeUsers: 0
    };
  }

  async updateUserStatus(userId, status) {
    const response = await this.client.put(`/admin/users/${userId}/status`, { status });
    return response.data?.data || response.data;
  }

  async updateCampaignCost(campaignId, cost) {
    const response = await this.client.put(`/admin/campaigns/${campaignId}/cost`, { cost });
    return response.data;
  }

  async updateCampaignCoinCost(campaignId, cost) {
    const response = await this.client.put(`/admin/campaigns/${campaignId}/cost`, { cost });
    return response.data;
  }

  async getAdminAnnouncements() {
    const response = await this.client.get('/admin/announcements');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async updateAnnouncementCoinCost(id, cost) {
    const response = await this.client.put(`/admin/announcements/${id}/cost`, { cost });
    return response.data?.data || response.data;
  }

  async getFeeStructure() {
    const response = await this.client.get('/admin/fee-structure');
    return response.data?.data || response.data;
  }

  async updateFeeStructure(feesOrCampaignFee, applicationFee) {
    const payload = typeof feesOrCampaignFee === 'object'
      ? feesOrCampaignFee
      : { campaignFee: feesOrCampaignFee, applicationFee };
    const response = await this.client.put('/admin/fee-structure', payload);
    return response.data?.data || response.data;
  }

  async blockPost(postId, reason = 'Not meeting community standards') {
    const response = await this.client.put(`/admin/posts/${postId}/block`, { reason });
    return response.data?.data || response.data;
  }

  async unblockPost(postId) {
    const response = await this.client.put(`/admin/posts/${postId}/unblock`);
    return response.data?.data || response.data;
  }

  async blockCampaign(campaignId, reason = 'Not meeting community standards') {
    const response = await this.client.put(`/admin/campaigns/${campaignId}/block`, { reason });
    return response.data?.data || response.data;
  }

  async unblockCampaign(campaignId) {
    const response = await this.client.put(`/admin/campaigns/${campaignId}/unblock`);
    return response.data?.data || response.data;
  }

  // Admin Wallet
  async getAdminWithdrawals(status = 'pending') {
    const response = await this.client.get(`/admin/wallet/withdrawals`, { params: { status } });
    return response.data?.data || response.data;
  }

  async getAdminCampaignApplications(campaignId) {
    const response = await this.client.get(`/admin/campaigns/${campaignId}/applications`);
    return response.data;
  }

  async approveWithdrawal(id) {
    const response = await this.client.put(`/admin/wallet/withdrawals/${id}/approve`);
    return response.data?.data || response.data;
  }

  async rejectWithdrawal(id, reason) {
    const response = await this.client.put(`/admin/wallet/withdrawals/${id}/reject`, { reason });
    return response.data?.data || response.data;
  }

  // Follow/Unfollow
  async followUser(userId) {
    const response = await this.client.post(`/users/${userId}/follow`);
    return response.data?.data || response.data;
  }

  async unfollowUser(userId) {
    const response = await this.client.delete(`/users/${userId}/unfollow`);
    return response.data?.data || response.data;
  }

  async checkIsFollowing(userId) {
    const response = await this.client.get(`/users/${userId}/is-following`);
    return response.data?.data || response.data;
  }

  // Social Media
  async connectSocialMedia(platform, accountId, accountName, accountUrl) {
    const response = await this.client.post('/users/social-media/connect', {
      platform,
      accountId,
      accountName,
      accountUrl,
    });
    return response.data?.data || response.data;
  }

  async getYouTubeAuthUrl() {
    const response = await this.client.get('/users/social-media/youtube/auth-url');
    return response.data?.data || response.data;
  }

  async disconnectSocialMedia(platform) {
    const response = await this.client.delete(`/users/social-media/disconnect/${platform}`);
    return response.data?.data || response.data;
  }

  async getUserStats(userId) {
    const response = await this.client.get(`/users/${userId}/stats`);
    return response.data?.data || response.data;
  }

  // Influencers (for Brand explore)
  async getInfluencers(params = {}) {
    const response = await this.client.get('/users/influencers', { params });
    return response.data;
  }

  async toggleSaveCampaign(id) {
    const response = await this.client.post(`/users/campaigns/${id}/toggle-save`);
    return response.data;
  }

  async getNewBrands() {
    const response = await this.client.get('/influencer/brands/new');
    return Array.isArray(response.data?.brands) ? response.data.brands : [];
  }

  async getFollowedBrands() {
    const response = await this.client.get('/influencer/brands/followed');
    return Array.isArray(response.data?.brands) ? response.data.brands : [];
  }

  // Brand-side Influencer Discovery
  async getNewInfluencers() {
    const response = await this.client.get('/brand/influencers/new');
    return Array.isArray(response.data?.influencers) ? response.data.influencers : [];
  }

  async getFollowedInfluencers() {
    const response = await this.client.get('/brand/influencers/followed');
    return Array.isArray(response.data?.influencers) ? response.data.influencers : [];
  }

  // Brand Profile
  async getBrandProfile() {
    const response = await this.client.get('/brand/profile');
    return response.data?.data || response.data;
  }

  async getBrandProfileById(id) {
    const response = await this.client.get(`/brand/profile/${id}`);
    return response.data?.data || response.data;
  }

  async updateBrandProfile(data) {
    const response = await this.client.put('/brand/profile', data);
    return response.data?.data || response.data;
  }

  async createBrandProfile(data) {
    const response = await this.client.post('/brand/profile', data);
    return response.data?.data || response.data;
  }

  // Advanced Admin Analytics
  async getAdminOverviewAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics/overview', { params });
    return response.data;
  }

  async getAdminPostAnalytics(params = {}) {
    // Axios handles params automatically if passed as second argument object
    const response = await this.client.get('/admin/analytics/posts', { params });
    return response.data;
  }

  async getAdminCampaignAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics/campaigns', { params });
    return response.data;
  }

  async getAdminInfluencerAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics/influencers', { params });
    return response.data;
  }

  async getAdminBrandAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics/brands', { params });
    return response.data;
  }

  async getAdminRevenueAnalytics(params = {}) {
    const response = await this.client.get('/admin/analytics/revenue', { params });
    return response.data;
  }

  // Badge Management
  async getBadges() {
    const response = await this.client.get('/admin/badges');
    return response.data?.data || [];
  }

  async createBadge(formData) {
    const response = await this.client.post('/admin/badges', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  }

  async updateBadge(id, formData) {
    const response = await this.client.put(`/admin/badges/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  }

  async deleteBadge(id) {
    const response = await this.client.delete(`/admin/badges/${id}`);
    return response.data;
  }

  async assignBadgeToUser(userId, badgeId) {
    const response = await this.client.post(`/admin/users/${userId}/badges/${badgeId}`);
    return response.data?.data || response.data;
  }

  async removeBadgeFromUser(userId, badgeId) {
    const response = await this.client.delete(`/admin/users/${userId}/badges/${badgeId}`);
    return response.data?.data || response.data;
  }
}

export default new ApiClient();
