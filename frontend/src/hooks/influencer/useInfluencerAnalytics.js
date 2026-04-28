import { useState, useCallback, useEffect } from 'react';
import influencerService from '../../services/influencer.service';

export const useInfluencerAnalytics = (user) => {
  const [coinBalance, setCoinBalance] = useState(user?.coins || 0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
    }
  }, [user, loadNotifications, loadWallet]);

  return {
    coinBalance,
    walletTransactions,
    notifications,
    toast,
    showToast,
    loadNotifications,
    loadWallet,
    handleTopUp,
    handleWithdraw
  };
};

export default useInfluencerAnalytics;
