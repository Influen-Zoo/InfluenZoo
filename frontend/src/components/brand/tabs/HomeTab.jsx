import React from 'react';
import CreateCampaign from '../CreateCampaign';
import BrandCampaignCard from '../BrandCampaignCard';
import { EmptyState } from '../../common/LayoutBlocks';
import { Megaphone } from 'lucide-react';

export default function HomeTab({ 
  announcements = [], 
  setAnnouncements, 
  onCampaignCreated,
  onJumpToCampaign 
}) {
  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
      <CreateCampaign onCampaignCreated={onCampaignCreated} />
      <div className="posts-feed responsive-feed">
        {announcements.map(campaign => (
          <BrandCampaignCard
            key={campaign._id}
            campaign={campaign}
            onCampaignUpdated={(updated) => setAnnouncements(announcements.map(a => a._id === updated._id ? updated : a))}
            onCampaignDeleted={(deletedId) => setAnnouncements(announcements.filter(a => a._id !== deletedId))}
            onJumpToCampaign={onJumpToCampaign}
          />
        ))}
        {announcements.length === 0 && (
          <EmptyState 
            icon={Megaphone} 
            message="No campaigns yet." 
            description="Create your first campaign and start finding talent!"
          />
        )}
      </div>
    </div>
  );
}
