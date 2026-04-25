import apiClient from './apiClient';

export const postService = {
  async getPosts() {
    const response = await apiClient.get('/posts');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.posts || []);
  },

  async createPost(formData) {
    const response = await apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.post || response.data;
  },

  async updatePost(id, formData) {
    const response = await apiClient.put(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.post || response.data;
  },

  async deletePost(id) {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },

  async likePost(id) {
    const response = await apiClient.post(`/posts/${id}/like`);
    return response.data;
  },

  async commentOnPost(id, text) {
    const response = await apiClient.post(`/posts/${id}/comment`, { text });
    return response.data;
  }
};

export default postService;
