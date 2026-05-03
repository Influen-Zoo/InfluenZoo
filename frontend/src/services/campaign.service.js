import apiClient from './apiClient';

export const campaignService = {
  async getCampaigns(params = {}) {
    const response = await apiClient.get('/influencer/campaigns', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.campaigns || data?.data || []);
  },

  async getMyCampaigns() {
    const response = await apiClient.get('/brand/campaigns/my');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.campaigns || data?.data || []);
  },

  async createCampaign(formData) {
    const response = await apiClient.post('/brand/campaigns', formData, {
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
  },

  async updateCampaign(id, formData) {
    const response = await apiClient.put(`/brand/campaigns/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.campaign || response.data;
  },

  async deleteCampaign(id) {
    const response = await apiClient.delete(`/brand/campaigns/${id}`);
    return response.data;
  },

  async applyToCampaign(campaignId, data) {
    const response = await apiClient.post('/influencer/applications', { campaignId, ...data });
    return response.data?.data || response.data;
  },

  async getMyApplications() {
    const response = await apiClient.get('/influencer/applications/my');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.applications || []);
  },

  async getCampaignApplications(campaignId) {
    const response = await apiClient.get(`/brand/campaigns/${campaignId}/applications`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.applications || []);
  },

  async acceptApplication(id) {
    const response = await apiClient.put(`/brand/applications/${id}/accept`);
    return response.data?.data || response.data;
  },

  async rejectApplication(id) {
    const response = await apiClient.put(`/brand/applications/${id}/reject`);
    return response.data?.data || response.data;
  },

  async toggleSaveCampaign(id) {
    const response = await apiClient.post(`/users/campaigns/${id}/toggle-save`);
    return response.data;
  },

  async getCampaignAnalytics(campaignId) {
    const response = await apiClient.get(`/analytics/campaign/${campaignId}`);
    return response.data?.data || response.data;
  }
};

export default campaignService;
