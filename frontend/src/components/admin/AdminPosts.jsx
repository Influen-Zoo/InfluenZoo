import React, { useState } from 'react';
import { Check, Ban } from 'lucide-react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import adminService from '../../services/admin.service';

export default function AdminPosts({ 
  posts = [],
  postFilter = { search: '', category: '', status: '' },
  setPostFilter = () => {},
  onPostBlocked = () => {}
}) {
  const [blockedPosts, setBlockedPosts] = useState({});
  const [blockingPost, setBlockingPost] = useState(null);
  const [blockReason, setBlockReason] = useState('Not meeting community standards');
  const [selectedPost, setSelectedPost] = useState(null);

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

  const handleBlockPost = async () => {
    if (!blockingPost) return;
    try {
      await adminService.blockPost(blockingPost._id, blockReason);
      setBlockedPosts({...blockedPosts, [blockingPost._id]: true});
      setBlockingPost(null);
      onPostBlocked();
    } catch (error) {
      console.error('Error blocking post:', error);
      alert('Failed to block post: ' + error.message);
    }
  };

  const handleUnblockPost = async (postId) => {
    try {
      await adminService.unblockPost(postId);
      setBlockedPosts({...blockedPosts, [postId]: false});
      onPostBlocked();
    } catch (error) {
      console.error('Error unblocking post:', error);
      alert('Failed to unblock post');
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* KPI Section */}
      <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>📸</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL POSTS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{posts.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>❤️</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL ENGAGEMENT</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {posts.reduce((sum, p) => sum + ((Array.isArray(p.likes) ? p.likes.length : 0) + (Array.isArray(p.comments) ? p.comments.length : 0)), 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>📈</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>AVG. ENGAGEMENT</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {((posts.reduce((sum, p) => sum + ((Array.isArray(p.likes) ? p.likes.length : 0) + (Array.isArray(p.comments) ? p.comments.length : 0)), 0) / (posts.length || 1)).toFixed(1))}
          </div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent)' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🌊</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>EST. REACH</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {(posts.length * 150).toLocaleString('en-IN')}+
          </div>
        </div>
      </div>

      <div className="admin-section-filters" style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search Posts</label>
          <input 
            className="input" 
            placeholder="Search by caption or author..." 
            value={postFilter.search}
            onChange={e => setPostFilter({ ...postFilter, search: e.target.value })}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
          <select 
            className="select"
            value={postFilter.category}
            onChange={e => setPostFilter({ ...postFilter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Fashion">Fashion</option>
            <option value="Technology">Technology</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ minWidth: '180px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
          <select 
            className="select"
            value={postFilter.status}
            onChange={e => setPostFilter({ ...postFilter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="avatar" style={{ width: 64, height: 64, margin: '0 auto 1rem', fontSize: '1.5rem' }}>
                {selectedPost.author?.profilePicture ? <img src={selectedPost.author.profilePicture} alt="" /> : selectedPost.author?.name?.[0]}
              </div>
              <h3 style={{ fontWeight: 800 }}>{selectedPost.author?.name}</h3>
              <span className="badge badge-primary">{selectedPost.category || 'General'}</span>
            </div>

            <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {selectedPost.caption || selectedPost.content}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Likes</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>❤️ {Array.isArray(selectedPost.likes) ? selectedPost.likes.length : 0}</span>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Comments</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>💬 {Array.isArray(selectedPost.comments) ? selectedPost.comments.length : 0}</span>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Posted On</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>📅 {formatDate(selectedPost.createdAt)}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <LiquidButton variant="secondary" onClick={() => setSelectedPost(null)}>Close</LiquidButton>
            </div>
          </div>
        </div>
      )}

      {blockingPost && (
        <div className="modal-overlay" onClick={() => setBlockingPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBlockingPost(null)}>✕</button>
            <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Block Post</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              by {blockingPost.author?.name}
            </p>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Reason for blocking</label>
              <textarea 
                className="input" 
                rows="3"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Not meeting community standards..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <LiquidButton type="button" variant="secondary" onClick={() => setBlockingPost(null)} style={{ flex: 1 }}>Cancel</LiquidButton>
              <LiquidButton type="button" variant="error" onClick={handleBlockPost} style={{ flex: 1 }}>Block Post</LiquidButton>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, opacity: 0.5 }}>📸</div>
          <p>No posts found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table className="table" style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Influencer</th>
                <th style={{ minWidth: '150px' }}>Content</th>
                <th style={{ minWidth: '100px' }}>Category</th>
                <th style={{ minWidth: '80px' }}>Date</th>
                <th style={{ minWidth: '80px' }}>Likes</th>
                <th style={{ minWidth: '80px' }}>Status</th>
                <th style={{ minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => {
                const isBlocked = post.blocked || blockedPosts[post._id];
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
                        ❤️ {Array.isArray(post.likes) ? post.likes.length : 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                        {isBlocked ? '🚫' : '✓'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      {isBlocked ? (
                        <LiquidButton 
                          circular 
                          variant="success" 
                          onClick={(e) => { e.stopPropagation(); handleUnblockPost(post._id); }}
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
                            setBlockReason('Not meeting community standards');
                            setBlockingPost(post);
                          }}
                          title="Block post"
                        >
                          <Ban size={18} />
                        </LiquidButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}
