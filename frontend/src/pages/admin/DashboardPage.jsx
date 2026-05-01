import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminOverview from '../../components/admin/AdminOverview';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';

export const DashboardPage = () => {
  const { 
    stats, loading, toast, withdrawals, campaigns, posts 
  } = useAdminDashboard();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts });

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
