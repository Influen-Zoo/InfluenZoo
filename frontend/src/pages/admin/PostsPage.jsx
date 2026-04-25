import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PostStats from '../../components/admin/PostStats';
import PostFilters from '../../components/admin/PostFilters';
import PostTable from '../../components/admin/PostTable';
import PostDetailsModal from '../../components/admin/modals/PostDetailsModal';
import PostBlockModal from '../../components/admin/modals/PostBlockModal';
import usePosts from '../../hooks/admin/usePosts';

export const PostsPage = () => {
  const { 
    filteredPosts, stats, loading, toast, withdrawals, campaigns,
    postFilter, setPostFilter, blockingPost, setBlockingPost,
    blockReason, setBlockReason, selectedPost, setSelectedPost,
    handleBlockPost, handleUnblockPost, statsData
  } = usePosts();

  const sidebarItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'withdrawals', icon: '🏦', label: 'Withdrawals', badge: withdrawals.length || undefined },
    { key: 'users', icon: '👥', label: 'Users', badge: Number(stats?.totalUsers) || 0 },
    { key: 'campaigns', icon: '📢', label: 'Campaigns', badge: campaigns.length || 0 },
    { key: 'posts', icon: '📸', label: 'Posts', badge: filteredPosts.length || 0 },
    { key: 'fee-structure', icon: '💰', label: 'Fee Structure' },
    { key: 'analytics', icon: '📈', label: 'Analytics' },
    { key: 'disputes', icon: '⚖️', label: 'Disputes', badge: Number(stats?.openDisputes) || 0 },
  ];

  return (
    <AdminLayout 
      activeSection="posts" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="page-enter" style={{ background: 'none' }}>
        <PostStats statsData={statsData} />

        <PostFilters postFilter={postFilter} setPostFilter={setPostFilter} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Crunching post data...
          </div>
        ) : (
          <PostTable 
            posts={filteredPosts}
            setSelectedPost={setSelectedPost}
            handleUnblockPost={handleUnblockPost}
            setBlockingPost={setBlockingPost}
          />
        )}

        <PostDetailsModal 
          selectedPost={selectedPost}
          onClose={() => setSelectedPost(null)}
        />

        <PostBlockModal 
          blockingPost={blockingPost}
          onClose={() => setBlockingPost(null)}
          blockReason={blockReason}
          setBlockReason={setBlockReason}
          onConfirm={handleBlockPost}
        />
      </div>
    </AdminLayout>
  );
};

export default PostsPage;
