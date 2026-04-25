import apiClient from './apiClient';

export const userService = {
  async getProfile(id) {
    const response = await apiClient.get(`/users/profile/${id}`);
    return response.data?.data || response.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put('/users/profile', data);
    return response.data?.data || response.data;
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.url || response.data;
  },

  async saveBio(data) {
    const response = await apiClient.post('/users/bio', data);
    return response.data?.data || response.data;
  },

  async addEducation(data) {
    const response = await apiClient.post('/users/education', data);
    return response.data?.data || response.data;
  },

  async updateEducation(id, data) {
    const response = await apiClient.put(`/users/education/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteEducation(id) {
    const response = await apiClient.delete(`/users/education/${id}`);
    return response.data?.data || response.data;
  },

  async addWork(data) {
    const response = await apiClient.post('/users/work', data);
    return response.data?.data || response.data;
  },

  async updateWork(id, data) {
    const response = await apiClient.put(`/users/work/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteWork(id) {
    const response = await apiClient.delete(`/users/work/${id}`);
    return response.data?.data || response.data;
  },

  async follow(userId) {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data?.data || response.data;
  },

  async unfollow(userId) {
    const response = await apiClient.delete(`/users/${userId}/unfollow`);
    return response.data?.data || response.data;
  },

  async checkIsFollowing(userId) {
    const response = await apiClient.get(`/users/${userId}/is-following`);
    return response.data?.data || response.data;
  },

  async connectSocialMedia(data) {
    const response = await apiClient.post('/users/social-media/connect', data);
    return response.data?.data || response.data;
  },

  async disconnectSocialMedia(platform) {
    const response = await apiClient.delete(`/users/social-media/disconnect/${platform}`);
    return response.data?.data || response.data;
  },

  async getStats(userId) {
    const response = await apiClient.get(`/users/${userId}/stats`);
    return response.data?.data || response.data;
  }
};

export default userService;
