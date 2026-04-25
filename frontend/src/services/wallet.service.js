import apiClient from './apiClient';

export const walletService = {
  async buyCoins(amount) {
    const response = await apiClient.post('/wallet/topup', { amount });
    return response.data?.data || response.data;
  },

  async getWallet() {
    const response = await apiClient.get('/wallet');
    return response.data?.data || response.data;
  },

  async withdrawEarnings(amount, details) {
    const response = await apiClient.post('/wallet/withdraw', { amount, details });
    return response.data?.data || response.data;
  },

  async getTransactions() {
    const response = await apiClient.get('/wallet/transactions');
    return response.data?.data || { transactions: [], balance: 0 };
  }
};

export default walletService;
