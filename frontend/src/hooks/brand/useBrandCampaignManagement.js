import { useState, useCallback, useEffect } from 'react';
import brandService from '../../services/brand.service';

export const useBrandCampaignManagement = (user, showToast) => {
  const [campaigns, setCampaigns] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [jumpToCampaignId, setJumpToCampaignId] = useState(null);

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await brandService.getMyCampaigns();
      setCampaigns(data);
    } catch (e) {
      console.error('Error loading campaigns:', e);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await brandService.getAllCampaigns();
      setAnnouncements(data);
    } catch (e) {
      console.error('Error loading global campaigns:', e);
    }
  }, []);

  const handleAcceptReject = async (appId, action) => {
    try {
      if (action === 'accept') {
        await brandService.acceptApplication(appId);
        showToast('Application accepted! 🎉');
      } else {
        await brandService.rejectApplication(appId);
        showToast('Application rejected.', 'info');
      }
      loadCampaigns();
    } catch (e) {
      showToast('Error processing application', 'danger');
    }
  };

  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadAnnouncements();
    }
  }, [user, loadCampaigns, loadAnnouncements]);

  return {
    campaigns,
    setCampaigns,
    announcements,
    setAnnouncements,
    showCreateForm,
    setShowCreateForm,
    jumpToCampaignId,
    setJumpToCampaignId,
    loadCampaigns,
    loadAnnouncements,
    handleAcceptReject
  };
};

export default useBrandCampaignManagement;
