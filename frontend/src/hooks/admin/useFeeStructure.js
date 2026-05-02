import { useEffect, useState } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';
import { DEFAULT_CATEGORIES } from '../../constants/common';

export const useFeeStructure = () => {
  const { 
    feeStructure, razorpaySettings, stats, loading, toast, showToast, withdrawals, campaigns, posts, loadAllData
  } = useAdminDashboard();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    let active = true;
    adminService.getCategories()
      .then((data) => {
        if (active && Array.isArray(data) && data.length) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories(DEFAULT_CATEGORIES);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleUpdateFeeStructure = async (fees) => {
    try {
      await adminService.updateFeeStructure(fees);
      showToast('Fee structure updated successfully! ✅');
      loadAllData();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleUpdateRazorpaySettings = async (settings) => {
    try {
      await adminService.updateRazorpaySettings(settings);
      showToast('Razorpay settings updated successfully!');
      loadAllData();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleUpdateCategories = async (nextCategories) => {
    try {
      const updated = await adminService.updateCategories(nextCategories);
      setCategories(updated);
      showToast('Categories updated successfully!');
    } catch (e) {
      showToast(e.message, 'danger');
      throw e;
    }
  };

  return {
    feeStructure,
    razorpaySettings,
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    posts,
    categories,
    handleUpdateFeeStructure,
    handleUpdateRazorpaySettings,
    handleUpdateCategories
  };
};

export default useFeeStructure;
