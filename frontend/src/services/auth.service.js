import apiClient from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export default authService;
