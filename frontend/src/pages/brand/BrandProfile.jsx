import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Mail, Building2, Globe, Users, Calendar, Link, ArrowLeft, Edit3, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';
import { resolveAssetUrl } from '../../utils/helpers';
import './BrandProfile.css';

export default function BrandProfile({ forcedUserId = null, embedded = false, onEditProfile = null }) {
  const params = useParams();
  const navigate = useNavigate();
  const userId = forcedUserId || params.userId;
  const { user: currentUser, updateUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, postsCount: 0 });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const isOwnProfile = currentUser && currentUser._id === userId;
  const displayUserId = userId || currentUser?._id;

  useEffect(() => {
    loadProfile();
  }, [displayUserId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getUserProfile(displayUserId);
      const userData = res.data || res;
      setProfile(userData);

      try {
        const statsData = await api.getUserStats(displayUserId);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    } catch (error) {
      console.error('Error loading brand profile:', error);
      showToast('Error loading profile', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadRes = await api.uploadProfilePicture(uploadFormData);
      const imageUrl = typeof uploadRes === 'string' ? uploadRes : (uploadRes?.url || uploadRes?.data?.url);

      if (!imageUrl) throw new Error('Upload failed');

      await api.updateUserAvatar(imageUrl);
      updateUser({ avatar: imageUrl });
      
      showToast('Profile picture updated successfully');
      await loadProfile();
    } catch (error) {
      showToast('Error uploading logo', 'danger');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadRes = await api.uploadBanner(file);
      const imageUrl = typeof uploadRes === 'string' ? uploadRes : (uploadRes?.url || uploadRes?.data?.url);

      if (!imageUrl) throw new Error('Upload failed');

      await api.updateProfile({ banner: imageUrl });
      showToast('Cover photo updated successfully');
      await loadProfile();
    } catch (error) {
      showToast('Error uploading cover photo', 'danger');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const isFollowing = currentUser?.following?.includes(userId);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.unfollowUser(userId);
        showToast('Unfollowed');
      } else {
        await api.followUser(userId);
        showToast('Brand followed!');
      }
      // Update follow state in AuthContext to reflect immediately
      const newFollowing = isFollowing 
        ? currentUser.following.filter(id => id !== userId)
        : [...(currentUser.following || []), userId];
      updateUser({ following: newFollowing });
      loadProfile();
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: embedded ? '240px' : '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Profile not found</p>
        <LiquidButton variant="primary" onClick={() => navigate(-1)}>Go Back</LiquidButton>
      </div>
    );
  }

  const brandInfo = profile.brandProfile || {};

  return (
    <div className="user-profile-page" data-theme={theme}>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="profile-wrapper">
        <div 
          className="profile-banner"
          style={{ 
            backgroundImage: profile.banner ? `url(${resolveAssetUrl(profile.banner)})` : undefined,
            backgroundColor: profile.banner ? undefined : 'var(--accent-gradient)'
          }}
        >
          {!embedded && (
            <button onClick={() => navigate(-1)} className="btn-back-banner">
               Back
            </button>
          )}
          {isOwnProfile && (
            <div className="banner-upload-wrapper">
              <input type="file" id="banner-upload" accept="image/*" onChange={handleBannerUpload} disabled={uploading} style={{ display: 'none' }} />
              <label htmlFor="banner-upload" className="banner-upload-btn" title={uploading ? 'Uploading...' : 'Update Cover Photo'}>
                <Camera size={20} />
              </label>
            </div>
          )}
        </div>

        <div className="profile-container">
          <div className="profile-header-section">
            <div className="profile-header-top">
              <div className="profile-avatar-large">
                <div className="profile-avatar-inner">
                  {profile.avatar ? (
                    <img src={resolveAssetUrl(profile.avatar)} alt={profile.name} />
                  ) : (
                    <div className="avatar-placeholder">{profile.name?.[0]}</div>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} style={{ display: 'none' }} />
                    <label htmlFor="avatar-upload" className="avatar-upload-btn" title={uploading ? 'Uploading...' : 'Upload Brand Logo'}>
                      <Camera size={20} />
                    </label>
                  </>
                )}
              </div>

              <div className="profile-header-info">
                <div className="header-name-section">
                  <h1>{brandInfo.brandName || profile.name}</h1>
                </div>
                
                <div className="profile-stats-inline">
                  {(stats?.followersCount || 0) >= 1000 ? (stats.followersCount / 1000).toFixed(1) + 'K' : (stats?.followersCount || 0)} followers • {(stats?.postsCount || 0)} campaigns • {(stats?.followingCount || 0) >= 1000 ? (stats.followingCount / 1000).toFixed(1) + 'K' : (stats?.followingCount || 0)} following
                </div>
                
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                  brand {brandInfo.industry ? ` || ${brandInfo.industry}` : ''}
                </div>
                
                <div className="profile-actions">
                  {isOwnProfile ? (
                    <LiquidButton variant="secondary" onClick={onEditProfile} style={{ padding: '0.4rem 1.5rem', fontWeight: '600' }}>
                      <Edit3 size={16} /> 
                      Edit Profile
                    </LiquidButton>
                  ) : (
                    <>
                      <LiquidButton variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </LiquidButton>
                      
                      {currentUser?.role === 'brand' && (
                        <LiquidButton variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MessageCircle size={18} />
                          Contact Brand
                        </LiquidButton>
                      )}
                    </>
                  )}
                </div>

                <div className="profile-bio-text">
                  {/* Brand Profile does not use bio line */}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main-grid" style={{ marginTop: '2rem' }}>
            <div className="profile-main-content">
              {/* About Section */}
              {brandInfo.about && (
                <div className="profile-bio-card">
                  <h3>About</h3>
                  <p>{brandInfo.about}</p>
                </div>
              )}

              {/* Social Media Links Section - Moved after About */}
              {brandInfo.socialLinks && (Object.values(brandInfo.socialLinks).some(v => !!v)) && (
                <div className="profile-social-links">
                  <h3>Social Media Links</h3>
                  <div className="social-links-grid">
                    {Object.entries(brandInfo.socialLinks).map(([platform, url]) => (
                      url ? (
                        <a key={platform} href={url} target="_blank" rel="noreferrer" className="social-link-btn">
                          <Link size={16} /> {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Summary Card - Matches Influencer Specializations/Category flow */}
              <div className="profile-niche-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={20} /> Brand Highlights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.2rem' }}>
                  <div className="info-item-mini">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Industry</span>
                    <div style={{ fontWeight: 600 }}>{brandInfo.industry || 'Other'}</div>
                  </div>
                  <div className="info-item-mini">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Company Size</span>
                    <div style={{ fontWeight: 600 }}>{brandInfo.companySize || 'N/A'}</div>
                  </div>
                  <div className="info-item-mini">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Founded</span>
                    <div style={{ fontWeight: 600 }}>{brandInfo.foundedYear || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Campaign Preferences Card */}
              <div className="profile-bio-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} /> Campaign Preferences</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Target Niches</span>
                    <div className="niche-tags" style={{ marginTop: '0.5rem' }}>
                      {(brandInfo.campaignPreferences?.categories || []).length > 0 ? (
                        brandInfo.campaignPreferences.categories.map(cat => <span key={cat} className="niche-badge">{cat}</span>)
                      ) : <span style={{ color: 'var(--text-muted)' }}>Any</span>}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Budget Range</span>
                    <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{brandInfo.campaignPreferences?.budgetRange || 'Flexible'}</div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section - Matches Influencer Parity */}
              <div className="bio-section">
                <h3>Brand Information</h3>
                <div className="bio-details-grid">
                  {brandInfo.headquarters && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Headquarters</span>
                      <span className="bio-value">{brandInfo.headquarters}</span>
                    </div>
                  )}
                  {brandInfo.hometown && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Current Location</span>
                      <span className="bio-value">{brandInfo.hometown}</span>
                    </div>
                  )}
                  {brandInfo.location && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Global Location</span>
                      <span className="bio-value">{brandInfo.location}</span>
                    </div>
                  )}
                  {brandInfo.address && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Address</span>
                      <span className="bio-value">{brandInfo.address}</span>
                    </div>
                  )}
                  {brandInfo.city && (
                    <div className="bio-detail-item">
                      <span className="bio-label">City</span>
                      <span className="bio-value">{brandInfo.city}</span>
                    </div>
                  )}
                  {brandInfo.state && (
                    <div className="bio-detail-item">
                      <span className="bio-label">State</span>
                      <span className="bio-value">{brandInfo.state}</span>
                    </div>
                  )}
                  {brandInfo.country && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Country</span>
                      <span className="bio-value">{brandInfo.country}</span>
                    </div>
                  )}
                  {brandInfo.zipCode && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Zip Code</span>
                      <span className="bio-value">{brandInfo.zipCode}</span>
                    </div>
                  )}
                  {brandInfo.phone && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Phone</span>
                      <span className="bio-value">{brandInfo.phone}</span>
                    </div>
                  )}
                  {brandInfo.website && (
                    <div className="bio-detail-item">
                      <span className="bio-label">Website</span>
                      <div className="bio-value">
                        <a href={brandInfo.website} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{brandInfo.website}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
