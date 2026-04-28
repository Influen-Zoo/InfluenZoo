import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminFeeStructure from '../../components/admin/AdminFeeStructure';
import useFeeStructure from '../../hooks/admin/useFeeStructure';

export const FeeStructurePage = () => {
  const { 
    feeStructure, razorpaySettings, stats, loading, toast, withdrawals, campaigns, posts,
    handleUpdateFeeStructure, handleUpdateRazorpaySettings
  } = useFeeStructure();

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
      activeSection="fee-structure" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <AdminFeeStructure 
        feeStructure={feeStructure}
        razorpaySettings={razorpaySettings}
        onUpdateFees={handleUpdateFeeStructure}
        onUpdateRazorpaySettings={handleUpdateRazorpaySettings}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default FeeStructurePage;
