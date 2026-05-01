import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardTab from '../../components/influencer/tabs/DashboardTab';
import CampaignDetailModal from '../../components/influencer/CampaignDetailModal';
import ApplyModal from '../../components/influencer/ApplyModal';
import ProfileViewerModal from '../../components/common/ProfileViewerModal/ProfileViewerModal';
import { getItemId } from '../../utils/helpers';

export const InfluencerDashboardPage = () => {
  const { 
    dashboardSubTab, 
    setDashboardSubTab, 
    applications, 
    coinBalance, 
    paymentConfig,
    walletTransactions,
    setShowTopUp,
    handleToggleSave,
    loadWallet,
    handleWithdraw,
    user,
    filters,
    setFilters,
    exploreItems,
    selectedCampaignDetail,
    setSelectedCampaignDetail,
    savedCampaignIds,
    applyModal,
    setApplyModal,
    applyMsg,
    setApplyMsg,
    applyOutlet,
    setApplyOutlet,
    handleApply,
    loading,
    viewingProfileId,
    setViewingProfileId
  } = useOutletContext();

  return (
    <div className="tab-container">
      <DashboardTab 
        user={user}
        setShowTopUp={setShowTopUp}
        filters={filters}
        setFilters={setFilters}
        applications={applications}
        walletTransactions={walletTransactions}
        coinBalance={coinBalance}
        savedCampaignIds={savedCampaignIds}
        exploreItems={exploreItems}
        onCampaignClick={(campaign) => setSelectedCampaignDetail(campaign)}
        onWithdraw={handleWithdraw}
        activeSubTab={dashboardSubTab}
        setActiveSubTab={setDashboardSubTab}
      />

      {viewingProfileId && (
        <ProfileViewerModal 
          userId={viewingProfileId} 
          onClose={() => setViewingProfileId(null)} 
        />
      )}

      {applyModal && (
        <ApplyModal
          campaign={applyModal}
          applyMsg={applyMsg}
          setApplyMsg={setApplyMsg}
          selectedOutlet={applyOutlet}
          setSelectedOutlet={setApplyOutlet}
          onClose={() => setApplyModal(null)}
          onApply={() => handleApply(applyModal._id || applyModal.id, applyMsg, applyOutlet)}
          loading={loading}
          paymentConfig={paymentConfig}
          coinBalance={coinBalance}
        />
      )}

      {selectedCampaignDetail && (
        <CampaignDetailModal
          campaign={selectedCampaignDetail}
          onClose={() => setSelectedCampaignDetail(null)}
          onApply={() => {
            setApplyModal(selectedCampaignDetail);
            setSelectedCampaignDetail(null);
          }}
          applied={applications.some(a => (a.campaignId?._id || a.campaignId) === getItemId(selectedCampaignDetail))}
          saved={savedCampaignIds.includes(getItemId(selectedCampaignDetail))}
          onSave={() => handleToggleSave(selectedCampaignDetail)}
        />
      )}
    </div>
  );
};

export default InfluencerDashboardPage;
