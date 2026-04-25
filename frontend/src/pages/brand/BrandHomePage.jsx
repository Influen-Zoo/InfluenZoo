import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HomeTab from '../../components/brand/tabs/HomeTab';

export const BrandHomePage = () => {
  const { campaigns, announcements, setAnnouncements, loadAnnouncements, loadCampaigns, handleJumpToCampaign } = useOutletContext();

  return (
    <div className="tab-container">
      <HomeTab 
        announcements={announcements}
        setAnnouncements={setAnnouncements} 
        onCampaignCreated={() => { loadCampaigns(); loadAnnouncements(); }}
        onJumpToCampaign={handleJumpToCampaign}
      />
    </div>
  );
};

export default BrandHomePage;
