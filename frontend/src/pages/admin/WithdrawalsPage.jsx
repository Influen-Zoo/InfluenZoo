import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import useWithdrawals from '../../hooks/admin/useWithdrawals';
import WithdrawalStats from '../../components/admin/WithdrawalStats';
import WithdrawalFilters from '../../components/admin/WithdrawalFilters';
import WithdrawalTable from '../../components/admin/WithdrawalTable';

export const WithdrawalsPage = () => {
  const { 
    filteredWithdrawals, loading, toast, handleApproveWithdrawal, handleRejectWithdrawal, stats, 
    withdrawals, campaigns, posts, searchTerm, setSearchTerm, statusFilter, setStatusFilter, filters, setFilters, statsData
  } = useWithdrawals();

  const sidebarItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'withdrawals', icon: '🏦', label: 'Withdrawals', badge: withdrawals.length || undefined },
    { key: 'users', icon: '👥', label: 'Users', badge: Number(stats?.totalUsers) || 0 },
    { key: 'campaigns', icon: '📢', label: 'Campaigns', badge: campaigns.length || 0 },
    { key: 'posts', icon: '📸', label: 'Posts', badge: posts.length || 0 },
    { key: 'fee-structure', icon: '💰', label: 'Fee Structure' },
    { key: 'analytics', icon: '📈', label: 'Analytics' },
    { key: 'disputes', icon: '⚖️', label: 'Disputes', badge: Number(stats?.openDisputes) || 0 },
  ];

  return (
    <AdminLayout 
      activeSection="withdrawals" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="page-enter" style={{ background: 'none' }}>
        <WithdrawalStats statsData={statsData} />

        <WithdrawalFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          statusFilter={statusFilter} 
          setStatusFilter={setStatusFilter} 
          filters={filters} 
          setFilters={setFilters} 
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Crunching financial data...
          </div>
        ) : (
          <WithdrawalTable 
            withdrawals={filteredWithdrawals} 
            handleApproveWithdrawal={handleApproveWithdrawal} 
            handleRejectWithdrawal={handleRejectWithdrawal} 
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default WithdrawalsPage;
