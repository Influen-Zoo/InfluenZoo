import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import AdminFeeStructure from '../../components/admin/AdminFeeStructure';
import useFeeStructure from '../../hooks/admin/useFeeStructure';

export const FeeStructurePage = () => {
  const { 
    feeStructure, razorpaySettings, stats, loading, toast, withdrawals, campaigns, posts,
    categories, handleUpdateFeeStructure, handleUpdateRazorpaySettings, handleUpdateCategories
  } = useFeeStructure();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts });

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
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default FeeStructurePage;
