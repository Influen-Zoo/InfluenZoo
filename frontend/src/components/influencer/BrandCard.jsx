import React, { useState } from 'react';
import { UserCheck, MapPin, ExternalLink, Users, Star } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/helpers';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function BrandCard({ 
  brand, 
  onFollow, 
  onUnfollow, 
  isFollowing, 
  onClick 
}) {
  const [isHovering, setIsHovering] = useState(false);
  const followerCount = Array.isArray(brand.followers) ? brand.followers.length : (brand.followerCount || 0);

  return (
    <div className="brand-card-modern" onClick={onClick}>
      <div className="brand-card-cover">
        {brand.banner ? (
          <img src={resolveAssetUrl(brand.banner)} alt="Banner" className="cover-img" />
        ) : (
          <div className="cover-placeholder" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }} />
        )}
      </div>

      <div className="brand-card-content">
        <div className="brand-avatar-stack">
          <div className="brand-avatar-large">
            {brand.avatar ? (
              <img src={resolveAssetUrl(brand.avatar)} alt={brand.name} />
            ) : (
              <div className="avatar-placeholder">{brand.name?.[0]}</div>
            )}
          </div>
          {brand.isVerified && (
            <div className="verified-badge-large" title="Verified Brand" style={{ background: '#8b5cf6' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 11 3 3L22 4l-1.4-1.4L9 14.2l-3.6-3.6L4 12l5 5Z"/></svg>
            </div>
          )}
        </div>

        <div className="brand-info-main">
          <div className="brand-name-row">
            <h4>{brand.name}</h4>
            <span className="brand-category-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              {brand.category || 'Brand'}
            </span>
          </div>

          <p className="brand-bio-snippet">{brand.bio || "Leading brand focused on innovation and high-quality digital experiences."}</p>

          <div className="brand-meta-row">
            <div className="brand-meta-item">
              <MapPin size={14} />
              <span>{brand.location || 'Global'}</span>
            </div>
            <div className="brand-meta-item">
              <Users size={14} />
              <span>{followerCount} Followers</span>
            </div>
            <div className="brand-meta-item">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{brand.industry || 'Tech'} Ind.</span>
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
                onUnfollow(brand._id);
              } else {
                onFollow(brand._id);
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
