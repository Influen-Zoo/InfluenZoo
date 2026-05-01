import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardTab from '../../components/brand/tabs/DashboardTab';
import CreateCampaign from '../../components/brand/CreateCampaign';
import ProfileViewerModal from '../../components/common/ProfileViewerModal/ProfileViewerModal';

export const BrandDashboardAnalyticsPage = () => {
  const { 
    user,
    dashboardSubTab, 
    setDashboardSubTab, 
    campaigns, 
    applications,
    analytics,
    coinBalance, 
    walletTransactions,
    setShowTopUp,
    filters,
    setFilters,
    setSelectedCampaign,
    selectedCampaign,
    showCreateForm,
    setShowCreateForm,
    handleAcceptReject,
    jumpToCampaignId,
    setJumpToCampaignId,
    loadWallet,
    loadCampaigns,
    viewingProfileId,
    setViewingProfileId
  } = useOutletContext();

  return (
    <div className="tab-container">
      <DashboardTab 
        user={user}
        activeSubTab={dashboardSubTab}
        setActiveSubTab={setDashboardSubTab}
        campaigns={campaigns}
        applications={applications}
        analytics={analytics}
        coinBalance={coinBalance}
        walletTransactions={walletTransactions}
        setShowTopUp={setShowTopUp}
        filters={filters}
        setFilters={setFilters}
        onCampaignClick={setSelectedCampaign}
        loadWallet={loadWallet}
        onAcceptReject={handleAcceptReject}
        jumpToId={jumpToCampaignId}
        onClearJump={() => setJumpToCampaignId(null)}
        onViewProfile={setViewingProfileId}
      />

      {(showCreateForm || selectedCampaign) && (
        <CreateCampaign 
          onClose={() => {
            setShowCreateForm(false);
            setSelectedCampaign(null);
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            setSelectedCampaign(null);
            loadCampaigns();
          }}
          editData={selectedCampaign}
        />
      )}

      {viewingProfileId && (
        <ProfileViewerModal 
          userId={viewingProfileId} 
          onClose={() => setViewingProfileId(null)} 
        />
      )}
    </div>
  );
};

export default BrandDashboardAnalyticsPage;
