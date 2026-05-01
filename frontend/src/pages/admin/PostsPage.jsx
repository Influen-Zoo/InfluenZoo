import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import PostStats from '../../components/admin/PostStats';
import PostFilters from '../../components/admin/PostFilters';
import PostTable from '../../components/admin/PostTable';
import PostDetailsModal from '../../components/admin/modals/PostDetailsModal';
import PostBlockModal from '../../components/admin/modals/PostBlockModal';
import PostLikesEditModal from '../../components/admin/modals/PostLikesEditModal';
import usePosts from '../../hooks/admin/usePosts';

export const PostsPage = () => {
  const { 
    filteredPosts, stats, loading, toast, withdrawals, campaigns,
    postFilter, setPostFilter, blockingPost, setBlockingPost,
    blockReason, setBlockReason, selectedPost, setSelectedPost,
    likesEditModal, setLikesEditModal,
    handleBlockPost, handleUnblockPost, handleUpdatePostLikes, statsData
  } = usePosts();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts: filteredPosts });

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
            setLikesEditModal={setLikesEditModal}
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

        <PostLikesEditModal
          isOpen={!!likesEditModal}
          onClose={() => setLikesEditModal(null)}
          post={likesEditModal}
          onUpdate={handleUpdatePostLikes}
        />
      </div>
    </AdminLayout>
  );
};

export default PostsPage;
