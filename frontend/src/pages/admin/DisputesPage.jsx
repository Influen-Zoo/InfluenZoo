import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import DisputeList from '../../components/admin/DisputeList';
import useDisputes from '../../hooks/admin/useDisputes';

export const DisputesPage = () => {
  const { 
    disputes, stats, loading, toast, withdrawals, campaigns, posts, handleResolveDispute
  } = useDisputes();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts });

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
