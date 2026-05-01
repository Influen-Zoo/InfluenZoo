import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import useAnalytics from '../../hooks/admin/useAnalytics';

export const AnalyticsPage = () => {
  const { 
    stats, toast, withdrawals, campaigns, posts
  } = useAnalytics();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts });

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
