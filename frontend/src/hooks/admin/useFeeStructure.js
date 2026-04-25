import { useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';

export const useFeeStructure = () => {
  const { 
    feeStructure, stats, loading, toast, showToast, withdrawals, campaigns, posts, loadAllData
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

  return {
    feeStructure,
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    posts,
    handleUpdateFeeStructure
  };
};

export default useFeeStructure;
