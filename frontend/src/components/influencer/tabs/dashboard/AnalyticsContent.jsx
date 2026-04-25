import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Skeleton, Pagination } from '@mui/material';
import { Plus, X } from 'lucide-react';
import api from '../../../../services/api';
import { resolveAssetUrl } from '../../../../utils/helpers';
import './AnalyticsContent.css';

const POSTS_PER_PAGE = 10;

export default function AnalyticsContent({ user, selectedTab }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [error, setError] = useState(null);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // Load user's posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all posts and filter by author
      const response = await api.getPosts();
      const userPosts = (Array.isArray(response) ? response : response?.posts || [])
        .filter(post => post?.author?._id === user?._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(userPosts);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const endIdx = startIdx + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIdx, endIdx);

  const toggleExpand = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleImageError = (postId) => {
    setBrokenImages(prev => new Set([...prev, postId]));
  };

  // Format the post details for display
  const getPostStats = (post) => {
    return {
      views: post?.analytics?.views ?? post?.metadata?.views ?? 0,
      likes: post?.likes?.length ?? 0,
      comments: post?.comments?.length ?? 0,
      shares: post?.analytics?.shares ?? post?.metadata?.shares ?? 0,
    };
  };

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography color="error" variant="body2">{error}</Typography>
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 1 }}>
          📝 No posts yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
          Start creating content to see analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Content Header */}
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Your Content
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </Typography>
      </Box>

      {/* Posts List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {currentPosts.map((post) => {
          const isExpanded = expandedPostId === post._id;
          const stats = getPostStats(post);
          const thumbnail = post?.media?.[0];

          return (
            <div key={post._id} className="post-analytics-item">
              {/* Header/Collapsed View */}
              <div
                className={`post-analytics-header ${isExpanded ? 'expanded' : ''}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(24px) saturate(150%)',
                  padding: '1rem',
                  borderRadius: isExpanded ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--surface-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {thumbnail && !brokenImages.has(post._id) ? (
                    <img
                      src={resolveAssetUrl(thumbnail.url)}
                      alt="Post thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => handleImageError(post._id)}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>📸</span>
                  )}
                </div>

                {/* Title & Post Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.content?.split(' ').slice(0, 8).join(' ') || 'Untitled Post'}
                    {post.content?.split(' ').length > 8 ? '...' : ''}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                  >
                    {(() => {
                      try {
                        const date = new Date(post.createdAt);
                        if (isNaN(date.getTime())) throw new Error('Invalid date');
                        const dateStr = date.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                        const timeStr = date.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return `${dateStr} • ${timeStr}`;
                      } catch (e) {
                        return 'Date unknown';
                      }
                    })()}
                  </Typography>
                </div>

                {/* Expand Button */}
                <button
                  className={`btn-post-expand ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleExpand(post._id)}
                  type="button"
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isExpanded ? 'var(--accent)' : 'var(--surface-alt)',
                    border: '1.5px solid ' + (isExpanded ? 'var(--accent)' : 'var(--border-light)'),
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                    padding: 0,
                    color: isExpanded ? 'white' : 'var(--text-primary)',
                    boxShadow: isExpanded ? '0 4px 12px rgba(255, 165, 0, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = isExpanded ? 'var(--accent)' : 'var(--surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isExpanded ? 'var(--accent)' : 'var(--border-light)';
                    e.currentTarget.style.background = isExpanded ? 'var(--accent)' : 'var(--surface-alt)';
                  }}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Expandable Content */}
              <div className={`post-analytics-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className="post-analytics-inner">
                  <div className="post-analytics-content"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(24px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderTop: 'none',
                      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                      padding: '1.25rem 1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1rem',
                    }}
                  >
                    {/* Views Stat - Compact */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Views
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: 'var(--primary)',
                          fontSize: '1.1rem',
                        }}
                      >
                        {stats.views >= 1000 ? (stats.views / 1000).toFixed(1) + 'K' : stats.views}
                      </Typography>
                    </div>

                    {/* Likes Stat - Compact */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Likes
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#ff6b9d',
                          fontSize: '1.1rem',
                        }}
                      >
                        {stats.likes}
                      </Typography>
                    </div>

                    {/* Comments Stat - Compact */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Comments
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#4CAF50',
                          fontSize: '1.1rem',
                        }}
                      >
                        {stats.comments}
                      </Typography>
                    </div>

                    {/* Shares Stat - Compact */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Shares
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#FFA500',
                          fontSize: '1.1rem',
                        }}
                      >
                        {stats.shares}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => {
              setCurrentPage(page);
              setExpandedPostId(null);
              // Scroll to top of content
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                '&.Mui-selected': {
                  background: 'var(--primary)',
                  color: 'white',
                  border: '1px solid var(--primary)',
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
