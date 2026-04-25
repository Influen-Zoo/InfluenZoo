import { useState, useCallback, useEffect } from 'react';
import influencerService from '../../services/influencer.service';
import { getItemId } from '../../utils/helpers';
import { mapCampaignExploreData, filterBrandsBySearch } from '../../features/common/discoveryProcessor';

export const useInfluencerCampaigns = (user, searchQuery, showToast) => {
  const [exploreItems, setExploreItems] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedCampaignIds, setSavedCampaignIds] = useState([]);
  const [exploreSubTab, setExploreSubTab] = useState('all');
  
  const [applyModal, setApplyModal] = useState(null);
  const [applyMsg, setApplyMsg] = useState('');
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);

  const loadExploreItems = useCallback(async () => {
    try {
      let data;
      if (exploreSubTab === 'new') {
        data = await influencerService.getNewBrands();
      } else if (exploreSubTab === 'followed') {
        data = await influencerService.getFollowedBrands();
      } else {
        data = await influencerService.getExploreItems({ type: exploreSubTab });
      }

      if (exploreSubTab === 'all') {
        const mapped = mapCampaignExploreData(data, searchQuery);
        setExploreItems(mapped);
      } else {
        const filtered = filterBrandsBySearch(data, searchQuery);
        setExploreItems(filtered);
      }
    } catch (e) {
      console.error('Error loading explore items:', e);
      setExploreItems([]);
    }
  }, [exploreSubTab, searchQuery]);

  const loadApplications = useCallback(async () => {
    try {
      const data = await influencerService.getMyApplications();
      setApplications(data);
    } catch (e) {
      console.error('Error loading applications:', e);
    }
  }, []);

  const loadSavedCampaigns = useCallback(async () => {
    try {
      const resp = await influencerService.getFullProfile(user._id);
      if (resp?.savedCampaigns) {
        setSavedCampaignIds(resp.savedCampaigns);
      }
    } catch (e) {
      console.error('Error loading saved campaigns:', e);
    }
  }, [user?._id]);

  const handleToggleSave = async (campaign) => {
    const id = getItemId(campaign);
    if (!id) return;
    try {
      const resp = await influencerService.toggleSaveCampaign(id);
      if (resp.success) {
        if (resp.saved) {
          setSavedCampaignIds(prev => [...prev, id]);
          showToast('Campaign saved!', 'success');
        } else {
          setSavedCampaignIds(prev => prev.filter(cid => cid !== id));
          showToast('Campaign removed from saved', 'info');
        }
      }
    } catch (e) {
      showToast('Failed to update save state', 'error');
    }
  };

  const handleApply = async (itemId, message) => {
    try {
      await influencerService.applyToCampaign(itemId, message);
      showToast('Application submitted successfully! 🎉');
      setApplyModal(null);
      setApplyMsg('');
      loadApplications();
      loadExploreItems();
      return true;
    } catch (e) {
      showToast(e.message, 'danger');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadExploreItems();
      loadApplications();
      if (user._id) loadSavedCampaigns();
    }
  }, [user, loadExploreItems, loadApplications, loadSavedCampaigns]);

  return {
    exploreItems,
    applications,
    savedCampaignIds,
    exploreSubTab,
    setExploreSubTab,
    applyModal,
    setApplyModal,
    applyMsg,
    setApplyMsg,
    selectedCampaignDetail,
    setSelectedCampaignDetail,
    loadExploreItems,
    loadApplications,
    loadSavedCampaigns,
    handleToggleSave,
    handleApply
  };
};

export default useInfluencerCampaigns;
