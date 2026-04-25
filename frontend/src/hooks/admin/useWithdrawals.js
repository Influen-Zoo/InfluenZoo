import { useState, useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';

export const useWithdrawals = () => {
  const { 
    withdrawals, loading, toast, handleApproveWithdrawal, handleRejectWithdrawal, stats, campaigns, posts
  } = useAdminDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: ''
  });

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (searchTerm && !w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filters.fromDate && new Date(w.createdAt) < new Date(filters.fromDate)) return false;
      if (filters.toDate && new Date(w.createdAt) > new Date(filters.toDate)) return false;
      return true;
    });
  }, [withdrawals, statusFilter, searchTerm, filters]);

  const statsData = useMemo(() => {
    return {
      pendingCount: withdrawals.filter(w => w.status === 'pending').length,
      completedCount: withdrawals.filter(w => w.status === 'completed').length,
      pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + (w.amount || 0), 0),
      completedAmount: withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.amount || 0), 0)
    };
  }, [withdrawals]);

  return {
    withdrawals,
    filteredWithdrawals,
    loading,
    toast,
    handleApproveWithdrawal,
    handleRejectWithdrawal,
    stats,
    campaigns,
    posts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filters,
    setFilters,
    statsData
  };
};

export default useWithdrawals;
