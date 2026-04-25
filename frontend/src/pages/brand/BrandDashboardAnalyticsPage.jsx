import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardTab from '../../components/brand/tabs/DashboardTab';
import CreateCampaign from '../../components/brand/CreateCampaign';

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
    loadCampaigns
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
    </div>
  );
};

export default BrandDashboardAnalyticsPage;
