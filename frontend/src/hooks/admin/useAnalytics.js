import { useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';

export const useAnalytics = () => {
  const { 
    stats, loading, toast, withdrawals, campaigns, posts
  } = useAdminDashboard();

  return {
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    posts
  };
};

export default useAnalytics;
