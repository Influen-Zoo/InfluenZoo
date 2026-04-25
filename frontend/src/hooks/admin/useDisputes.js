import { useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';

export const useDisputes = () => {
  const { 
    disputes, stats, loading, toast, showToast, withdrawals, campaigns, posts, loadAllData
  } = useAdminDashboard();

  const handleResolveDispute = async (id) => {
    try { 
      await adminService.resolveDispute(id, 'Resolved by admin review.'); 
      showToast('Dispute resolved! ✅'); 
      loadAllData(); 
    }
    catch (e) { showToast(e.message, 'danger'); }
  };

  return {
    disputes,
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    posts,
    handleResolveDispute
  };
};

export default useDisputes;
