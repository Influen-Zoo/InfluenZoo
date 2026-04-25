import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import useAnalytics from '../../hooks/admin/useAnalytics';

export const AnalyticsPage = () => {
  const { 
    stats, toast, withdrawals, campaigns, posts
  } = useAnalytics();

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
      activeSection="analytics" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <AdminAnalytics />
    </AdminLayout>
  );
};

export default AnalyticsPage;
