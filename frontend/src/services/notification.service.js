import apiClient from './apiClient';

export const notificationService = {
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data?.data || [];
  },

  async markAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data?.data || response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
