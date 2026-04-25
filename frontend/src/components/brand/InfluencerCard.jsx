import React, { useState } from 'react';
import { UserCheck, MapPin, Users, Heart, Star } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/helpers';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function InfluencerCard({ 
  influencer, 
  onFollow, 
  onUnfollow, 
  isFollowing, 
  onClick 
}) {
  const [isHovering, setIsHovering] = useState(false);
  const followerCount = Array.isArray(influencer.followers) ? influencer.followers.length : (influencer.followerCount || 0);

  return (
    <div className="brand-card-modern" onClick={onClick}>
      <div className="brand-card-cover">
        {influencer.banner ? (
          <img src={resolveAssetUrl(influencer.banner)} alt="Banner" className="cover-img" />
        ) : (
          <div className="cover-placeholder" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }} />
        )}
      </div>

      <div className="brand-card-content">
        <div className="brand-avatar-stack">
          <div className="brand-avatar-large">
            {influencer.avatar ? (
              <img src={resolveAssetUrl(influencer.avatar)} alt={influencer.name} />
            ) : (
              <div className="avatar-placeholder">{influencer.name?.[0]}</div>
            )}
          </div>
          {influencer.isVerified && (
            <div className="verified-badge-large" title="Verified Creator" style={{ background: '#ec4899' }}>
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 11 3 3L22 4l-1.4-1.4L9 14.2l-3.6-3.6L4 12l5 5Z"/></svg>
            </div>
          )}
        </div>

        <div className="brand-info-main">
          <div className="brand-name-row">
            <h4>{influencer.name}</h4>
            <span className="brand-category-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              {influencer.category || 'Creator'}
            </span>
          </div>

          <p className="brand-bio-snippet">{influencer.bio || "Passionate creator sharing unique perspectives and high-quality content."}</p>

          <div className="brand-meta-row">
            <div className="brand-meta-item">
              <MapPin size={14} />
              <span>{influencer.location || 'Global'}</span>
            </div>
            <div className="brand-meta-item">
              <Users size={14} />
              <span>{followerCount} Followers</span>
            </div>
            <div className="brand-meta-item">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{influencer.engagement || '4.5%'} Eng.</span>
            </div>
          </div>
        </div>

        <div className="brand-card-actions">
          <LiquidButton 
            variant="secondary" 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Profile
          </LiquidButton>
          
          <LiquidButton 
            variant={isFollowing ? "secondary" : "primary"}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (isFollowing) {
                onUnfollow(influencer._id);
              } else {
                onFollow(influencer._id);
              }
            }}
          >
            {isFollowing ? (
              isHovering ? "Unfollow" : (
                <>
                  <UserCheck size={16} />
                  <span>Following</span>
                </>
              )
            ) : "Follow"}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
