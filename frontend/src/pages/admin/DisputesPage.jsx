import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DisputeList from '../../components/admin/DisputeList';
import useDisputes from '../../hooks/admin/useDisputes';

export const DisputesPage = () => {
  const { 
    disputes, stats, loading, toast, withdrawals, campaigns, posts, handleResolveDispute
  } = useDisputes();

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
      activeSection="disputes" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="table-container page-enter" style={{ background: 'none', padding: 0 }}>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Platform Disputes</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Investigating conflicts...
          </div>
        ) : (
          <DisputeList 
            disputes={disputes} 
            handleResolveDispute={handleResolveDispute} 
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default DisputesPage;
