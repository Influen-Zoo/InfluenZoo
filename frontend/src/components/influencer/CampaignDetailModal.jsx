import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Send, User } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import api from '../../services/api';
import { resolveAssetUrl, getItemId } from '../../utils/helpers';

export default function CampaignDetailModal({
  campaign: initialCampaign,
  onClose,
  onApply,
  applied = false,
  saved = false,
  onSave,
  onViewProfile,
  currentUserId
}) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [localLikes, setLocalLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const campaignId = getItemId(initialCampaign);
  const isLiked = localLikes.includes(currentUserId);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  useEffect(() => {
    const loadFullCampaign = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
        if (typeof initialCampaign === 'object') {
          setCampaign(initialCampaign);
          setLocalLikes(initialCampaign.likes || []);
          setComments(initialCampaign.comments || []);
        }
      } catch (e) {
        console.error('Failed to load campaign details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadFullCampaign();
  }, [initialCampaign, campaignId]);

  if (!campaign || typeof campaign !== 'object') {
    if (loading) {
      return (
        <div className="modal-overlay">
          <div className="modal">Loading...</div>
        </div>
      );
    }
    return null;
  }

  const handleLike = async () => {
    try {
      const resp = await api.likeCampaign(campaignId);
      if (resp.success) setLocalLikes(resp.likes);
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const resp = await api.commentOnCampaign(campaignId, newComment);
      if (resp.success) {
        setComments(resp.comments);
        setNewComment('');
      }
    } catch (e) {
      console.error('Comment error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/campaign/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const platformsArr = Array.isArray(campaign.platforms) && campaign.platforms.length > 0
    ? campaign.platforms
    : Array.isArray(campaign.platform)
      ? campaign.platform
      : typeof campaign.platform === 'string'
        ? [campaign.platform]
        : ['Various'];

  const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
  const isNotActive = campaign.status && campaign.status !== 'active';

  return (
    <div className="modal-overlay" onClick={() => onClose(null)}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: isMobile ? '100%' : '1000px',
          width: isMobile ? 'calc(100vw - 16px)' : '95%',
          maxHeight: isMobile ? '88vh' : '92vh',
          padding: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRadius: isMobile ? '24px' : '32px',
          position: 'relative',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <button
          className="modal-close"
          onClick={() => onClose(null)}
          style={{
            position: 'absolute',
            top: isMobile ? '0.75rem' : '1.25rem',
            right: isMobile ? '0.75rem' : '1.25rem',
            zIndex: 20,
            background: 'var(--surface)'
          }}
        >
          ×
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.25fr) minmax(300px, 0.75fr)'
          }}
        >
          <div
            style={{
              padding: isMobile ? '1rem' : '2rem',
              borderRight: isMobile ? 'none' : '1px solid var(--border)'
            }}
          >
            <div style={{ marginBottom: isMobile ? '1rem' : '1.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  background: 'var(--surface-alt)',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  maxWidth: '100%'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewProfile && campaign.author?._id) onViewProfile(campaign.author._id);
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {campaign.brandAvatar ? (
                    <img src={resolveAssetUrl(campaign.brandAvatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="brand avatar" />
                  ) : (
                    campaign.brandName?.[0]
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {campaign.brandName} • <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Verified Brand</span>
                </span>
              </div>

              <h1
                style={{
                  fontSize: isMobile ? '1.55rem' : '2.35rem',
                  fontWeight: '900',
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  marginBottom: '0.9rem',
                  paddingRight: isMobile ? '2.5rem' : 0
                }}
              >
                {campaign.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className={`badge ${campaign.type === 'paid' ? 'badge-paid' : 'badge-free'}`}>
                  {campaign.type === 'paid' ? 'Paid Collaboration' : 'Barter / Free Collab'}
                </span>
                <span className="badge" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                  {campaign.category}
                </span>
              </div>
            </div>

            <div
              style={{
                marginBottom: isMobile ? '1rem' : '1.5rem',
                padding: isMobile ? '1rem' : '1.25rem',
                background: 'var(--surface-alt)',
                borderRadius: '22px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.9rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
                <span>{localLikes.length} Likes</span>
                <span>{comments.length} Comments</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '0.9rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '0.5rem' }}>
                <button onClick={handleLike} style={socialButtonStyle(isLiked ? 'var(--danger)' : 'var(--text-secondary)')}>
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> Like
                </button>
                <button style={socialButtonStyle('var(--text-secondary)')}>
                  <MessageCircle size={18} /> Comment
                </button>
                <button onClick={handleShare} style={socialButtonStyle('var(--text-secondary)')}>
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
              <h4 style={sectionTitleStyle}>Campaign Overview</h4>
              <p style={{ fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {campaign.description || campaign.content}
              </p>
            </div>

            {campaign.media && campaign.media.length > 0 && (
              <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                <h4 style={sectionTitleStyle}>Campaign Visuals</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {campaign.media.map((m, i) => (
                    <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
                      {m.type === 'video' ? (
                        <video src={resolveAssetUrl(m.url)} controls style={{ width: '100%', display: 'block' }} />
                      ) : (
                        <img src={resolveAssetUrl(m.url)} style={{ width: '100%', display: 'block' }} alt="reference" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: campaign.requirements && campaign.deliverables?.length && !isMobile ? '1fr 1fr' : '1fr',
                gap: '1rem',
                background: 'var(--surface-alt)',
                padding: isMobile ? '1rem' : '1.25rem',
                borderRadius: '22px',
                border: '1px solid var(--border)',
                marginBottom: isMobile ? '1rem' : '1.5rem'
              }}
            >
              {campaign.requirements && (
                <div>
                  <h4 style={miniLabelStyle}>Requirements</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{campaign.requirements}</p>
                </div>
              )}

              {campaign.deliverables && campaign.deliverables.length > 0 && (
                <div style={{ paddingLeft: campaign.requirements && !isMobile ? '1rem' : 0, borderLeft: campaign.requirements && !isMobile ? '1px solid var(--border)' : 'none' }}>
                  <h4 style={miniLabelStyle}>Deliverables</h4>
                  <ul style={{ paddingLeft: '1rem', margin: 0, color: 'var(--text-secondary)' }}>
                    {campaign.deliverables.map((d, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '800' }}>Comments ({comments.length})</h3>

              <form onSubmit={handleComment} style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ask a question or express interest..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 3rem 1rem 1rem',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: '18px',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--primary)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      padding: '0.6rem',
                      borderRadius: '999px',
                      display: 'flex',
                      cursor: 'pointer',
                      opacity: newComment.trim() ? 1 : 0.5
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', background: 'var(--surface-alt)', borderRadius: '18px', border: '1px dashed var(--border)' }}>
                    No comments yet. Be the first to share your thoughts.
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        {c.user?.avatar ? (
                          <img src={resolveAssetUrl(c.user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, background: 'var(--surface-alt)', padding: '0.9rem 1rem', borderRadius: '0 18px 18px 18px', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{c.user?.name || 'User'}</div>
                        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface-alt)',
              padding: isMobile ? '1rem' : '1.5rem',
              borderTop: isMobile ? '1px solid var(--border)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ background: 'var(--surface)', padding: isMobile ? '1rem' : '1.25rem', borderRadius: '22px', border: '1px solid var(--border)' }}>
              <span style={miniLabelStyle}>Estimated Compensation</span>
              <div style={{ fontSize: isMobile ? '1.35rem' : '1.7rem', fontWeight: '900', color: 'var(--success)', lineHeight: 1.1 }}>
                {campaign.compensation === 'paid'
                  ? `₹${(campaign.budget || 0).toLocaleString()}`
                  : campaign.compensation === 'both'
                    ? `₹${(campaign.budget || 0).toLocaleString()} + Prod.`
                    : 'Product Only'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              <div style={infoCardStyle}>
                <span style={miniLabelStyle}>Timeline</span>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.15rem' }}>
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Immediate'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ends {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                </div>
              </div>

              <div style={infoCardStyle}>
                <span style={miniLabelStyle}>Platforms</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {platformsArr.slice(0, 3).map((p, i, arr) => (
                    <span key={p} style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                      {p}{i < arr.length - 1 && ','}
                    </span>
                  ))}
                  {platformsArr.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{platformsArr.length - 3} more</span>}
                </div>
              </div>
            </div>

            {campaign.tags && campaign.tags.length > 0 && (
              <div style={infoCardStyle}>
                <span style={miniLabelStyle}>Campaign Tags</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {campaign.tags.map((t) => (
                    <span key={t} style={{ fontSize: '0.75rem', padding: '0.38rem 0.7rem', background: 'var(--surface-alt)', borderRadius: '999px', color: 'var(--primary)', fontWeight: '600' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--surface)', padding: isMobile ? '1rem' : '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', marginTop: 'auto' }}>
              {applied ? (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--success)', color: 'white', borderRadius: '18px', fontWeight: '800', letterSpacing: '0.04em' }}>
                  APPLICATION SENT
                </div>
              ) : isExpired || isNotActive ? (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-alt)', color: 'var(--text-muted)', borderRadius: '18px', fontWeight: '800', border: '1px solid var(--border)' }}>
                  CAMPAIGN {isExpired ? 'EXPIRED' : (campaign.status?.toUpperCase() || 'CLOSED')}
                </div>
              ) : (
                <LiquidButton variant="primary" onClick={() => onApply(campaign)} style={{ width: '100%' }}>
                  Apply for {campaign.coinCost || 0} Coins
                </LiquidButton>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.9rem', lineHeight: 1.45 }}>
                Applying costs {campaign.coinCost || 0} credits from your balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: '1.05rem',
  marginBottom: '0.85rem',
  fontWeight: '800',
  color: 'var(--text)'
};

const miniLabelStyle = {
  fontSize: '0.68rem',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: '0.55rem',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

const infoCardStyle = {
  background: 'var(--surface)',
  padding: '1rem',
  borderRadius: '18px',
  border: '1px solid var(--border)'
};

const socialButtonStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minHeight: '44px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  color,
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '700'
});
