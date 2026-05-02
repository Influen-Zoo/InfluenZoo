import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import HomeTab from '../../components/influencer/tabs/HomeTab';
import ProfileViewerModal from '../../components/common/ProfileViewerModal/ProfileViewerModal';

export const InfluencerHomePage = () => {
  const { feed, loadFeed } = useOutletContext();
  const [viewingProfileId, setViewingProfileId] = useState(null);

  return (
    <div className="tab-container">
      <HomeTab 
        feed={feed} 
        loadFeed={loadFeed} 
        onViewProfile={setViewingProfileId}
      />

      {viewingProfileId && (
        <ProfileViewerModal
          userId={viewingProfileId}
          onClose={() => setViewingProfileId(null)}
        />
      )}
    </div>
  );
};

export default InfluencerHomePage;
