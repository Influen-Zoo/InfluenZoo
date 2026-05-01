import React, { useEffect, useState } from 'react';
import { Bookmark, Share2 } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import { resolveAssetUrl, getItemId } from '../../utils/helpers';

export default function CampaignDetailModal({
  campaign: initialCampaign,
  onClose,
  onApply,
  applied = false,
  saved = false,
  onSave,
  onViewProfile
}) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [isSaved, setIsSaved] = useState(saved);
  const [loading, setLoading] = useState(false);

  const campaignId = getItemId(initialCampaign);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  useEffect(() => {
    const loadFullCampaign = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
        if (typeof initialCampaign === 'object') setCampaign(initialCampaign);
      } catch (error) {
        console.error('Failed to load campaign details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFullCampaign();
  }, [initialCampaign, campaignId]);

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

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

  const platformsArr = Array.isArray(campaign.platforms) && campaign.platforms.length > 0
    ? campaign.platforms
    : Array.isArray(campaign.platform)
      ? campaign.platform
      : typeof campaign.platform === 'string'
        ? [campaign.platform]
        : ['Various'];

  const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
  const isNotActive = campaign.status && campaign.status !== 'active';
  const brandAvatar = campaign.brandAvatar || campaign.author?.avatar;
  const brandName = campaign.brandName || campaign.author?.name || 'Brand';
  const compensationLabel = getCompensationLabel(campaign.compensation);

  const handleSave = (event) => {
    event.stopPropagation();
    setIsSaved((current) => !current);
    if (onSave) onSave(campaign);
  };

  const handleShare = (event) => {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/campaign/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description || campaign.content,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(null)}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
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
          x
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  marginBottom: '1rem',
                  maxWidth: '100%'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--surface-alt)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    maxWidth: '100%'
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
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
                    {brandAvatar ? (
                      <img src={resolveAssetUrl(brandAvatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="brand avatar" />
                    ) : (
                      brandName[0]
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {brandName} - <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Verified Brand</span>
                  </span>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', flex: '0 0 auto', marginRight: isMobile ? '2.5rem' : 0 }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    title={isSaved ? 'Saved' : 'Save campaign'}
                    aria-label={isSaved ? 'Saved' : 'Save campaign'}
                    style={detailIconButtonStyle('#facc15', isSaved)}
                  >
                    <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share campaign"
                    aria-label="Share campaign"
                    style={detailIconButtonStyle('#22c55e')}
                  >
                    <Share2 size={18} />
                  </button>
                </div>
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
                <span className={`badge ${campaign.compensation === 'product' ? 'badge-free' : 'badge-paid'}`}>
                  {compensationLabel}
                </span>
                <span className="badge" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                  {campaign.category}
                </span>
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
                  {campaign.media.map((media, index) => (
                    <div key={index} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
                      {media.type === 'video' ? (
                        <video src={resolveAssetUrl(media.url)} controls style={{ width: '100%', display: 'block' }} />
                      ) : (
                        <img src={resolveAssetUrl(media.url)} style={{ width: '100%', display: 'block' }} alt="reference" />
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
                    {campaign.deliverables.map((deliverable, index) => (
                      <li key={index} style={{ marginBottom: '0.4rem' }}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                {getCompensationValue(campaign)}
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
                  {platformsArr.slice(0, 3).map((platform, index, arr) => (
                    <span key={platform} style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                      {platform}{index < arr.length - 1 && ','}
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
                  {campaign.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: '0.75rem', padding: '0.38rem 0.7rem', background: 'var(--surface-alt)', borderRadius: '999px', color: 'var(--primary)', fontWeight: '600' }}>
                      #{tag}
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

const getCompensationLabel = (compensation) => {
  if (compensation === 'product') return 'Barter';
  if (compensation === 'both') return 'Paid + Barter';
  return 'Paid';
};

const getCompensationValue = (campaign) => {
  const amount = Number(campaign.budget || 0).toLocaleString('en-IN');
  if (campaign.compensation === 'product') return 'Barter';
  if (campaign.compensation === 'both') return `INR ${amount} + Barter`;
  return `INR ${amount}`;
};

const detailIconButtonStyle = (color, active = false) => ({
  width: 40,
  height: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${color}`,
  borderRadius: 12,
  background: active ? color : 'var(--surface-alt)',
  color: active ? '#111827' : color,
  cursor: 'pointer',
  flex: '0 0 auto'
});

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
