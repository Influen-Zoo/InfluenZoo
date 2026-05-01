import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import CampaignStats from '../../components/admin/CampaignStats';
import CampaignFilters from '../../components/admin/CampaignFilters';
import CampaignTable from '../../components/admin/CampaignTable';
import CampaignCostModal from '../../components/admin/modals/CampaignCostModal';
import CampaignDetailsModal from '../../components/admin/modals/CampaignDetailsModal';
import CampaignBlockModal from '../../components/admin/modals/CampaignBlockModal';
import useCampaigns from '../../hooks/admin/useCampaigns';

export const CampaignsPage = () => {
  const { 
    campaigns, filteredCampaigns, stats, loading, toast, withdrawals, posts,
    campaignFilter, setCampaignFilter, campaignCostModal, setCampaignCostModal,
    selectedCampaign, setSelectedCampaign, applications, appsLoading,
    handleCampaignClick, handleBlockCampaign, handleUnblockCampaign, handleUpdateCoinCost,
    blockingCampaign, setBlockingCampaign, blockReason, setBlockReason, statsData
  } = useCampaigns();

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

  return (
    <AdminLayout 
      activeSection="campaigns" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="page-enter" style={{ background: 'none' }}>
        <CampaignStats statsData={statsData} />

        <CampaignFilters 
          campaignFilter={campaignFilter} 
          setCampaignFilter={setCampaignFilter} 
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Crunching campaign data...
          </div>
        ) : (
          <CampaignTable 
            campaigns={filteredCampaigns}
            handleCampaignClick={handleCampaignClick}
            setCampaignCostModal={setCampaignCostModal}
            handleUnblockCampaign={handleUnblockCampaign}
            setBlockingCampaign={setBlockingCampaign}
          />
        )}

        <CampaignDetailsModal 
          selectedCampaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          applications={applications}
          appsLoading={appsLoading}
        />

        <CampaignBlockModal 
          blockingCampaign={blockingCampaign}
          onClose={() => setBlockingCampaign(null)}
          blockReason={blockReason}
          setBlockReason={setBlockReason}
          onConfirm={handleBlockCampaign}
        />

        <CampaignCostModal 
          isOpen={!!campaignCostModal}
          onClose={() => setCampaignCostModal(null)}
          campaign={campaignCostModal}
          onUpdate={handleUpdateCoinCost}
        />
      </div>
    </AdminLayout>
  );
};

export default CampaignsPage;
