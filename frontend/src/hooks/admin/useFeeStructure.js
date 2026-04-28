import { useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';

export const useFeeStructure = () => {
  const { 
    feeStructure, razorpaySettings, stats, loading, toast, showToast, withdrawals, campaigns, posts, loadAllData
  } = useAdminDashboard();

  const handleUpdateFeeStructure = async (fees) => {
    try {
      await adminService.updateFeeStructure(fees.campaignFee, fees.applicationFee);
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

  return {
    feeStructure,
    razorpaySettings,
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    posts,
    handleUpdateFeeStructure,
    handleUpdateRazorpaySettings
  };
};

export default useFeeStructure;
