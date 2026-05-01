import { useState, useCallback, useEffect } from 'react';
import influencerService from '../../services/influencer.service';

export const useInfluencerAnalytics = (user) => {
  const [coinBalance, setCoinBalance] = useState(user?.coins || 0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await influencerService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }, []);

  const loadPaymentConfig = useCallback(async () => {
    try {
      const walletService = (await import('../../services/wallet.service')).default;
      const config = await walletService.getPaymentConfig();
      setPaymentConfig(config);
    } catch (e) {
      console.error('Error loading payment config:', e);
    }
  }, []);

  const loadWallet = useCallback(async () => {
    try {
      const data = await influencerService.getWalletData();
      setWalletTransactions(data?.transactions || []);
      setCoinBalance(data?.coinBalance || 0);
    } catch (e) {
      console.error('Error loading wallet:', e);
    }
  }, []);

  const handleTopUp = async (amount) => {
    try {
      showToast(`Purchased ${amount} coins successfully! ✨`);
      loadWallet();
      return true;
    } catch (e) {
      showToast('Error purchasing coins: ' + e.message, 'danger');
      return false;
    }
  };

  const handleWithdraw = async (amount, details) => {
    try {
      await influencerService.withdrawEarnings(amount, details);
      showToast(`Withdrawal of ₹${amount} requested successfully! ✨`);
      loadWallet();
      return true;
    } catch (e) {
      showToast('Error withdrawing: ' + e.message, 'danger');
      throw e;
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadWallet();
      loadPaymentConfig();
    }
  }, [user, loadNotifications, loadWallet, loadPaymentConfig]);

  return {
    coinBalance,
    walletTransactions,
    notifications,
    paymentConfig,
    toast,
    showToast,
    loadNotifications,
    loadWallet,
    loadPaymentConfig,
    handleTopUp,
    handleWithdraw
  };
};

export default useInfluencerAnalytics;
