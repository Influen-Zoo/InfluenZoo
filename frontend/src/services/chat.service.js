import apiClient from './apiClient';

export const chatService = {
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
  },

  async chatbotSendMessage(messages) {
    const response = await apiClient.post('/chatbot', { messages });
    const data = response.data;
    return data?.data || data;
  },

  async getChatbotHistory() {
    const response = await apiClient.get('/chatbot/history');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data?.history || []);
  }
};

export default chatService;
