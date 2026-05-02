import React from 'react';
import { Check, Ban, Heart } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const getCount = (value) => Array.isArray(value) ? value.length : (Number(value) || 0);

const PostTable = ({ posts, setSelectedPost, handleUnblockPost, setBlockingPost, setLikesEditModal }) => {
  const truncate = (text, length = 30) => {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="admin-post-table-wrap">
      <table className="table admin-post-table" style={{ width: '100%', minWidth: '860px' }}>
        <thead>
          <tr>
            <th style={{ minWidth: '120px' }}>Influencer</th>
            <th style={{ minWidth: '150px' }}>Content</th>
            <th style={{ minWidth: '100px' }}>Category</th>
            <th style={{ minWidth: '80px' }}>Date</th>
            <th style={{ minWidth: '80px' }}>Likes</th>
            <th style={{ minWidth: '80px' }}>Status</th>
            <th style={{ minWidth: '100px' }}>Moderation</th>
            <th style={{ minWidth: '140px' }}>Growth</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => {
            const isBlocked = post.blocked;
            const likeCount = getCount(post.likes);
            const postId = post._id || post.id;

            return (
              <tr
                key={post._id}
                style={{ opacity: isBlocked ? 0.6 : 1, cursor: 'pointer' }}
                onClick={() => setSelectedPost(post)}
              >
                <td title={post.author?.name || '-'}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {truncate(post.author?.name || '-', 15)}
                  </span>
                </td>
                <td title={post.caption || post.content}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {truncate(post.caption || post.content, 25)}
                  </span>
                </td>
                <td>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {truncate(post.category || 'General', 10)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(post.createdAt)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8125rem' }}>
                    {likeCount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                    {isBlocked ? 'Blocked' : 'Live'}
                  </span>
                </td>
                <td>
                  <div className="admin-post-action-cell">
                    {isBlocked ? (
                      <LiquidButton
                        circular
                        variant="success"
                        onClick={(e) => { e.stopPropagation(); handleUnblockPost(postId); }}
                        title="Unblock post"
                      >
                        <Check size={18} />
                      </LiquidButton>
                    ) : (
                      <LiquidButton
                        circular
                        variant="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlockingPost(post);
                        }}
                        title="Block post"
                      >
                        <Ban size={18} />
                      </LiquidButton>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-post-growth-cell">
                    <LiquidButton
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLikesEditModal({ postId, currentLikes: likeCount });
                      }}
                      title="Add likes"
                      style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.9rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Heart size={16} />
                      Add Likes
                    </LiquidButton>
                  </div>
                </td>
              </tr>
            );
          })}
          {posts.length === 0 && (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No posts found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
