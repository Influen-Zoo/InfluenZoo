import { useState, useCallback, useEffect } from 'react';
import influencerService from '../../services/influencer.service';
import apiClient from '../../services/apiClient';

export const useInfluencerContent = (user, showToast) => {
  const [feed, setFeed] = useState([]);
  const [followingIds, setFollowingIds] = useState(
    () => (user?.following || []).map(id => id?.toString ? id.toString() : String(id))
  );

  const loadFeed = useCallback(async () => {
    try {
      const data = await influencerService.getFeed();
      setFeed(data);
    } catch (e) {
      console.error('Error loading feed:', e);
    }
  }, []);

  const handleFollowBrand = async (brandId) => {
    try {
      await apiClient.post(`/users/${brandId}/follow`);
      setFollowingIds(prev => [...prev, brandId]);
      showToast('Following brand! ✨');
    } catch (e) {
      showToast('Failed to follow', 'danger');
    }
  };

  const handleUnfollowBrand = async (brandId) => {
    try {
      await apiClient.delete(`/users/${brandId}/unfollow`);
      setFollowingIds(prev => prev.filter(id => id !== brandId));
      showToast('Unfollowed brand.');
    } catch (e) {
      showToast('Failed to unfollow', 'danger');
    }
  };

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user, loadFeed]);

  return {
    feed,
    followingIds,
    loadFeed,
    handleFollowBrand,
    handleUnfollowBrand
  };
};

export default useInfluencerContent;
