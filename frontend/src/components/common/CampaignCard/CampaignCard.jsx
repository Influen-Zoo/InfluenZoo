import React, { useEffect, useState } from 'react';
import { Bookmark, UserCheck, UserPlus } from 'lucide-react';
import { resolveAssetUrl } from '../../../utils/helpers';
import './CampaignCard.css';

export default function CampaignCard({
  campaign,
  applied,
  onApply,
  saved,
  onSave,
  onClick,
  currentUserId,
  onViewBrand,
  isFollowing: initialIsFollowing,
  onFollow,
  onUnfollow
}) {
  const [isSaved, setIsSaved] = useState(saved || false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const brandId = campaign.author?._id;
  const isAuthor = brandId === currentUserId;
  const brandName = campaign.brandName || campaign.author?.name || 'Brand';
  const category = campaign.category || 'Other';
  const coinCost = Number(campaign.coinCost || 0);
  const compensation = campaign.compensation || campaign.type || 'paid';
  const campaignPayout = Number(campaign.budget || 0);
  const payoutLabel = compensation === 'product'
    ? 'Barter'
    : compensation === 'both'
      ? `${campaignPayout > 0 ? `₹${campaignPayout.toLocaleString('en-IN')}` : 'Paid'} + Barter`
      : campaignPayout > 0
        ? `₹${campaignPayout.toLocaleString('en-IN')}`
        : 'Paid';

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleSave = (event) => {
    event.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(campaign);
  };

  const handleFollowClick = async (event) => {
    event.stopPropagation();
    if (!brandId || isAuthor || loadingFollow) return;

    try {
      setLoadingFollow(true);
      if (isFollowing) {
        if (onUnfollow) await onUnfollow(brandId);
        setIsFollowing(false);
      } else {
        if (onFollow) await onFollow(brandId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleApplyClick = (event) => {
    event.stopPropagation();
    if (onClick) onClick();
  };

  const coinAmount = (
    <span className="campaign-coin-amount">
      <span>{coinCost}</span>
      <span className="campaign-coin-icon" aria-label="coins" role="img">{'\u{1FA99}'}</span>
    </span>
  );

  if (campaign.blocked && !isAuthor) return null;

  if (campaign.blocked && isAuthor) {
    return (
      <div className="campaign-card" style={{ padding: '1.5rem' }}>
        <div className="campaign-blocked-notice">
          <strong>Campaign Removed by Admin</strong>
          <p>Your campaign was removed for not meeting community standards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-card explore-campaign-card" onClick={onClick}>
      <div className="campaign-card-header">
        <div
          className="brand-info-box"
          onClick={(event) => {
            event.stopPropagation();
            if (onViewBrand && brandId) onViewBrand(brandId);
          }}
        >
          <div className="brand-logo-circle">
            {campaign.author?.avatar ? (
              <img src={resolveAssetUrl(campaign.author.avatar)} alt="Brand avatar" />
            ) : (
              brandName[0]
            )}
          </div>
          <div className="brand-text-content">
            <div className="brand-name-verified">{brandName}</div>
            <span className="brand-subtitle">Brand • {category}</span>
          </div>
        </div>

        <div className="header-actions">
          {!isAuthor && (
            <button
              className={`btn-follow ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowClick}
              disabled={loadingFollow}
              type="button"
              title={isFollowing ? 'Following' : 'Follow'}
              aria-label={isFollowing ? 'Following' : 'Follow'}
            >
              {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            </button>
          )}
          <button
            className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            title={isSaved ? 'Saved' : 'Save for later'}
            type="button"
          >
            <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="campaign-body">
        <h3 className="campaign-title-large">{campaign.title}</h3>
        <p className="campaign-desc-snippet">{campaign.description}</p>
        <div className="campaign-tags">
          <span className="tag-yellow">#{brandName.replace(/\s+/g, '')}</span>
          <span className="tag-yellow">#{category}</span>
        </div>
      </div>

      <div className="campaign-footer-bar">
        <div className="fee-display">
          <span className="fee-label">Campaign Payout</span>
          <div className="fee-value">
            <span>{payoutLabel}</span>
          </div>
        </div>

        <div className="campaign-primary-actions">
          <button
            className={`btn-apply-now ${applied ? 'is-applied' : ''}`}
            onClick={handleApplyClick}
            disabled={applied}
            type="button"
          >
            <span>{applied ? 'Applied' : 'Apply'}</span>
            <span aria-hidden="true">•</span>
            {coinAmount}
          </button>
        </div>
      </div>
    </div>
  );
}
