import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminOverview from '../../components/admin/AdminOverview';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';

export const DashboardPage = () => {
  const { 
    stats, loading, toast, withdrawals, campaigns, posts 
  } = useAdminDashboard();

  // sidebarItems definition moved here or to a constant
  const sidebarItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'withdrawals', icon: '🏦', label: 'Withdrawals', badge: withdrawals.length || undefined },
    { key: 'users', icon: '👥', label: 'Users', badge: Number(stats?.totalUsers) || 0 },
    { key: 'campaigns', icon: '📢', label: 'Campaigns', badge: campaigns.length || 0 },
    { key: 'posts', icon: '📸', label: 'Posts', badge: posts.length || 0 },
    { key: 'brand-logos', icon: 'B', label: 'Brand Logos' },
    { key: 'fee-structure', icon: '💰', label: 'Fee Structure' },
    { key: 'analytics', icon: '📈', label: 'Analytics' },
    { key: 'disputes', icon: '⚖️', label: 'Disputes', badge: Number(stats?.openDisputes) || 0 },
  ];

  const [activeSection, setActiveSection] = useState('overview');

  return (
    <AdminLayout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <AdminOverview stats={stats} />
      )}
    </AdminLayout>
  );
};

export default DashboardPage;
