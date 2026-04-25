import { useState, useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';
import { filterAdminPosts, getAdminPostStats } from '../../features/admin/adminProcessor';

export const usePosts = () => {
  const { 
    posts, stats, loading, toast, showToast, withdrawals, campaigns, setPosts
  } = useAdminDashboard();

  const [postFilter, setPostFilter] = useState({ search: '', category: '', status: '' });
  const [blockingPost, setBlockingPost] = useState(null);
  const [blockReason, setBlockReason] = useState('Not meeting community standards');
  const [selectedPost, setSelectedPost] = useState(null);

  const filteredPosts = useMemo(() => filterAdminPosts(posts, postFilter), [posts, postFilter]);
  const statsData = useMemo(() => getAdminPostStats(posts), [posts]);

  const handleBlockPost = async () => {
    if (!blockingPost) return;
    try {
      await adminService.blockPost(blockingPost._id, blockReason);
      setBlockingPost(null);
      const updated = await adminService.getPosts();
      setPosts(updated);
      showToast('Post blocked successfully');
    } catch (error) {
      showToast('Failed to block post: ' + error.message, 'danger');
    }
  };

  const handleUnblockPost = async (postId) => {
    try {
      await adminService.unblockPost(postId);
      const updated = await adminService.getPosts();
      setPosts(updated);
      showToast('Post unblocked successfully');
    } catch (error) {
      showToast('Failed to unblock post', 'danger');
    }
  };

  return {
    posts,
    filteredPosts,
    stats,
    loading,
    toast,
    withdrawals,
    campaigns,
    postFilter,
    setPostFilter,
    blockingPost,
    setBlockingPost,
    blockReason,
    setBlockReason,
    selectedPost,
    setSelectedPost,
    handleBlockPost,
    handleUnblockPost,
    statsData
  };
};

export default usePosts;
