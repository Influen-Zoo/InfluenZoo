import { useState, useCallback, useEffect } from 'react';
import brandService from '../../services/brand.service';

export const useBrandAnalytics = (user) => {
  const [analytics, setAnalytics] = useState(null);
  const [coinBalance, setCoinBalance] = useState(user?.coins || 0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadAnalytics = useCallback(async (timeframe = '28') => {
    try {
      const data = await brandService.getDashboardAnalytics(timeframe);
      setAnalytics(data);
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await brandService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }, []);

  const loadWallet = useCallback(async () => {
    try {
      const data = await brandService.getWalletData();
      setWalletTransactions(data?.transactions || []);
      setCoinBalance(data?.coinBalance || 0);
    } catch (e) {
      console.error('Error loading wallet:', e);
    }
  }, []);

  const handleTopUp = async (amount) => {
    try {
      await brandService.buyCoins(amount);
      showToast(`Purchased ${amount} coins successfully! ✨`);
      loadWallet();
      return true;
    } catch (e) {
      showToast('Error purchasing coins: ' + e.message, 'danger');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadWallet();
      loadAnalytics();
    }
  }, [user, loadNotifications, loadWallet, loadAnalytics]);

  return {
    analytics,
    coinBalance,
    walletTransactions,
    notifications,
    toast,
    showToast,
    loadAnalytics,
    loadNotifications,
    loadWallet,
    handleTopUp
  };
};

export default useBrandAnalytics;
