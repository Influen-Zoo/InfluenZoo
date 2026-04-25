import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HomeTab from '../../components/influencer/tabs/HomeTab';

export const InfluencerHomePage = () => {
  const { feed, loadFeed, setViewingProfileId } = useOutletContext();

  return (
    <div className="tab-container">
      <HomeTab 
        feed={feed} 
        loadFeed={loadFeed} 
        onViewProfile={setViewingProfileId} 
      />
    </div>
  );
};

export default InfluencerHomePage;
