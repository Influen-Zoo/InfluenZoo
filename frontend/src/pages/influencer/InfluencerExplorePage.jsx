import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ExploreTab from '../../components/influencer/tabs/ExploreTab';
import ProfileViewerModal from '../../components/common/ProfileViewerModal/ProfileViewerModal';
import ApplyModal from '../../components/influencer/ApplyModal';
import CampaignDetailModal from '../../components/influencer/CampaignDetailModal';
import { getItemId } from '../../utils/helpers';
import useCategories from '../../hooks/useCategories';

export const InfluencerExplorePage = () => {
  const dashboard = useOutletContext();
  const { categories } = useCategories();

  return (
    <div className="tab-container">
      <ExploreTab 
        categories={categories}
        filters={dashboard.filters}
        setFilters={dashboard.setFilters}
        exploreSubTab={dashboard.exploreSubTab}
        setExploreSubTab={dashboard.setExploreSubTab}
        items={dashboard.exploreItems}
        appliedCampaignIds={dashboard.applications.map(a => a.campaignId?._id || a.campaignId)}
        savedCampaignIds={dashboard.savedCampaignIds}
        setApplyModal={dashboard.setApplyModal}
        handleToggleSave={dashboard.handleToggleSave}
        handleCardClick={dashboard.setSelectedCampaignDetail}
        handleFollow={dashboard.handleFollowBrand}
        handleUnfollow={dashboard.handleUnfollowBrand} 
        followingIds={dashboard.followingIds || []}
        currentUserId={dashboard.user?._id}
        onViewProfile={dashboard.setViewingProfileId}
      />

      {dashboard.viewingProfileId && (
        <ProfileViewerModal 
          userId={dashboard.viewingProfileId} 
          onClose={() => dashboard.setViewingProfileId(null)} 
        />
      )}

      {dashboard.applyModal && (
        <ApplyModal
          campaign={dashboard.applyModal}
          applyMsg={dashboard.applyMsg}
          setApplyMsg={dashboard.setApplyMsg}
          selectedOutlet={dashboard.applyOutlet}
          setSelectedOutlet={dashboard.setApplyOutlet}
          onClose={() => dashboard.setApplyModal(null)}
          onApply={() => dashboard.handleApply(dashboard.applyModal._id || dashboard.applyModal.id, dashboard.applyMsg, dashboard.applyOutlet)}
          loading={dashboard.loading}
          paymentConfig={dashboard.paymentConfig}
          coinBalance={dashboard.coinBalance}
        />
      )}

      {dashboard.selectedCampaignDetail && (
        <CampaignDetailModal
          campaign={dashboard.selectedCampaignDetail}
          onClose={() => dashboard.setSelectedCampaignDetail(null)}
          onApply={() => {
            dashboard.setApplyModal(dashboard.selectedCampaignDetail);
            dashboard.setSelectedCampaignDetail(null);
          }}
          applied={dashboard.applications.some(a => (a.campaignId?._id || a.campaignId) === getItemId(dashboard.selectedCampaignDetail))}
          saved={dashboard.savedCampaignIds.includes(getItemId(dashboard.selectedCampaignDetail))}
          onSave={() => dashboard.handleToggleSave(dashboard.selectedCampaignDetail)}
          onViewProfile={dashboard.setViewingProfileId}
          currentUserId={dashboard.user?._id}
        />
      )}
    </div>
  );
};

export default InfluencerExplorePage;
