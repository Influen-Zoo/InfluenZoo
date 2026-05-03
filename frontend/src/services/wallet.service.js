import apiClient from './apiClient';

export const walletService = {
  async getPaymentConfig() {
    const response = await apiClient.get('/wallet/payment-config');
    return response.data?.data || response.data;
  },

  async createCoinOrder(amount) {
    const response = await apiClient.post('/wallet/buy-coins', { amount });
    return response.data?.data || response.data;
  },

  async verifyPayment(paymentDetails) {
    const response = await apiClient.post('/wallet/verify-payment', paymentDetails);
    return response.data?.data || response.data;
  },

  async getWallet() {
    const response = await apiClient.get('/wallet');
    return response.data?.data || response.data;
  },

  async getReferralSummary() {
    const response = await apiClient.get('/wallet/referrals');
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
