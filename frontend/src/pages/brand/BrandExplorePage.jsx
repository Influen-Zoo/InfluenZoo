import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ExploreTab from '../../components/brand/tabs/ExploreTab';
import ProfileViewerModal from '../../components/common/ProfileViewerModal/ProfileViewerModal';

export const BrandExplorePage = () => {
  const dashboard = useOutletContext();

  return (
    <div className="tab-container">
      <ExploreTab 
        filters={dashboard.filters}
        setFilters={dashboard.setFilters}
        exploreSubTab={dashboard.exploreSubTab}
        setExploreSubTab={dashboard.setExploreSubTab}
        items={dashboard.exploreItems}
        posts={dashboard.posts}
        onViewProfile={dashboard.setViewingProfileId}
        loading={dashboard.loading}
        loadingItems={dashboard.loading}
        handleFollow={dashboard.handleFollow}
        handleUnfollow={dashboard.handleUnfollow}
        followingIds={dashboard.followingIds || []}
      />

      {dashboard.viewingProfileId && (
        <ProfileViewerModal 
          userId={dashboard.viewingProfileId} 
          onClose={() => dashboard.setViewingProfileId(null)} 
        />
      )}
    </div>
  );
};

export default BrandExplorePage;
