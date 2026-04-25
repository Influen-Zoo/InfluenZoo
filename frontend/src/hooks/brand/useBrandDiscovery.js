import { useState, useCallback, useEffect } from 'react';
import brandService from '../../services/brand.service';
import apiClient from '../../services/apiClient';
import { filterInfluencersBySearch, filterBrandPostsBySearch } from '../../features/common/discoveryProcessor';

export const useBrandDiscovery = (user, exploreSubTab, filters, searchQuery, showToast) => {
  const [posts, setPosts] = useState([]);
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(
    () => (user?.following || []).map(id => id?.toString ? id.toString() : String(id))
  );

  const loadInfluencers = useCallback(async () => {
    try {
      setLoading(true);
      if (exploreSubTab === 'all') {
        const data = await brandService.getAllPosts();
        
        const filtered = filterBrandPostsBySearch(data, searchQuery);
        setPosts(filtered);
        setExploreItems([]);
      } else {
        let data;
        if (exploreSubTab === 'new') {
          data = await brandService.getNewInfluencers();
        } else if (exploreSubTab === 'followed') {
          data = await brandService.getFollowedInfluencers();
        } else {
          data = await brandService.getInfluencers(filters);
        }

        const filtered = filterInfluencersBySearch(data, searchQuery);
        setExploreItems(filtered);
        setPosts([]);
      }
    } catch (e) {
      console.error('Error loading explore:', e);
    } finally {
      setLoading(false);
    }
  }, [exploreSubTab, filters, searchQuery]);

  const handleFollow = async (influencerId) => {
    try {
      await apiClient.post(`/users/${influencerId}/follow`);
      setFollowingIds(prev => [...prev, influencerId]);
      showToast('Following influencer! ✨');
    } catch (e) {
      showToast('Failed to follow', 'danger');
    }
  };

  const handleUnfollow = async (influencerId) => {
    try {
      await apiClient.delete(`/users/${influencerId}/unfollow`);
      setFollowingIds(prev => prev.filter(id => id !== influencerId));
      showToast('Unfollowed influencer.');
    } catch (e) {
      showToast('Failed to unfollow', 'danger');
    }
  };

  useEffect(() => {
    if (user) {
      loadInfluencers();
    }
  }, [user, loadInfluencers]);

  return {
    posts,
    exploreItems,
    loading,
    followingIds,
    handleFollow,
    handleUnfollow,
    loadInfluencers
  };
};

export default useBrandDiscovery;
