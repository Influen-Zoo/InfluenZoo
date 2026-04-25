import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Pagination } from '@mui/material';
import { Plus } from 'lucide-react';
import api from '../../../../services/api';
import { resolveAssetUrl } from '../../../../utils/helpers';
import './BrandCampaignsContent.css';

const CAMPAIGNS_PER_PAGE = 5;

export default function BrandCampaignsContent({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [error, setError] = useState(null);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // Load brand's campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMyCampaigns();
      const myCampaigns = (Array.isArray(response) ? response : response?.campaigns || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCampaigns(myCampaigns);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE);
  const startIdx = (currentPage - 1) * CAMPAIGNS_PER_PAGE;
  const endIdx = startIdx + CAMPAIGNS_PER_PAGE;
  const currentCampaigns = campaigns.slice(startIdx, endIdx);

  const toggleExpand = (campaignId) => {
    setExpandedCampaignId(expandedCampaignId === campaignId ? null : campaignId);
  };

  const handleImageError = (campaignId) => {
    setBrokenImages(prev => new Set([...prev, campaignId]));
  };

  // Format the campaign details for display
  const getCampaignStats = (campaign) => {
    return {
      views: campaign?.analytics?.views || campaign?.metadata?.views || 0,
      likes: campaign?.likes?.length || campaign?.metadata?.likes || 0,
      comments: campaign?.comments?.length || campaign?.metadata?.comments || 0,
      shares: campaign?.analytics?.shares || campaign?.metadata?.shares || 0,
    };
  };

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 3 }} />
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

  if (campaigns.length === 0) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 1 }}>
          📢 No campaigns yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
          Launch a campaign to see detailed analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Section Header */}
      <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Your Content
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
          {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
        </Typography>
      </Box>

      {/* Campaigns List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {currentCampaigns.map((campaign) => {
          const isExpanded = expandedCampaignId === campaign._id;
          const stats = getCampaignStats(campaign);
          const banner = campaign?.media?.[0];

          return (
            <div key={campaign._id} className="campaign-analytics-item">
              {/* Header/Collapsed View */}
              <div
                className={`campaign-analytics-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleExpand(campaign._id)}
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
                {/* Banner Thumbnail */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--surface-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-light)',
                }}>
                  {banner && !brokenImages.has(campaign._id) ? (
                    <img
                      src={resolveAssetUrl(banner.url || banner)}
                      alt="Campaign banner"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => handleImageError(campaign._id)}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>📢</span>
                  )}
                </div>

                {/* Campaign Title & Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {campaign.title || 'Untitled Campaign'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <span style={{ color: campaign.status === 'active' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {campaign.status?.toUpperCase()}
                    </span>
                    •
                    {(() => {
                      try {
                        const date = new Date(campaign.createdAt);
                        return date.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                      } catch (e) {
                        return 'Date unknown';
                      }
                    })()}
                  </Typography>
                </div>

                {/* Expand Button */}
                <button
                  className={`btn-campaign-expand ${isExpanded ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(campaign._id);
                  }}
                  type="button"
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isExpanded ? '#FFA500' : 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid ' + (isExpanded ? '#FFA500' : 'rgba(255, 255, 255, 0.1)'),
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                    padding: 0,
                    color: 'white',
                    boxShadow: isExpanded ? '0 4px 12px rgba(255, 165, 0, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFA500';
                    e.currentTarget.style.background = isExpanded ? '#FF8C00' : 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isExpanded ? '#FFA500' : 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = isExpanded ? '#FFA500' : 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Expandable Content */}
              <div className={`campaign-analytics-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className="campaign-analytics-inner">
                  <div className="campaign-analytics-content"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(24px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                      padding: '1.5rem 1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1rem',
                    }}
                  >
                    {/* Views Stat */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Views
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {stats.views >= 1000 ? (stats.views / 1000).toFixed(1) + 'K' : stats.views}
                      </Typography>
                    </div>

                    {/* Likes Stat */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Likes
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: '#ff6b9d', fontSize: '1.1rem' }}>
                        {stats.likes}
                      </Typography>
                    </div>

                    {/* Comments Stat */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Comments
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: '#4CAF50', fontSize: '1.1rem' }}>
                        {stats.comments}
                      </Typography>
                    </div>

                    {/* Shares Stat */}
                    <div className="stat-card glass-panel">
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', mb: 0.5, fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
                        Shares
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: '#FFA500', fontSize: '1.1rem' }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => {
              setCurrentPage(page);
              setExpandedCampaignId(null);
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
