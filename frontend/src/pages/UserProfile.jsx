import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Link as LinkIcon, Camera, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import LiquidButton from '../components/common/LiquidButton/LiquidButton';
import BrandProfile from './brand/BrandProfile';
import { normalizeProfile } from '../features/common/profileNormalizer';
import './UserProfile.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserProfile({ forcedUserId = null, embedded = false, onEditProfile = null }) {
  const params = useParams();
  const userId = forcedUserId || params.userId;
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { theme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [uploading, setUploading] = useState(false);
  const [connectingSocial, setConnectingSocial] = useState(false);
  const [socialFormData, setSocialFormData] = useState({
    accountId: '',
    accountName: '',
    accountUrl: '',
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [initMessage, setInitMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const resolveAssetUrl = (value) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }
    return `${API_BASE}${value.startsWith('/') ? value : `/${value}`}`;
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load primary profile data
      const profileData = await api.getUserProfile(userId);
      const userData = profileData.data || profileData;
      setProfile(normalizeProfile(userData));

      // Load secondary data gracefully
      try {
        const statsData = await api.getUserStats(userId);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading stats:', err);
      }

      if (currentUser && currentUser._id !== userId) {
        try {
          const checkData = await api.checkIsFollowing(userId);
          setIsFollowing(checkData.isFollowing || false);
        } catch (err) {
          console.error('Error checking follow status:', err);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Error loading profile', 'danger');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const reloadProfileAndStats = async () => {
    const [updatedProfile, updatedStats] = await Promise.all([
      api.getUserProfile(userId),
      api.getUserStats(userId),
    ]);
    setProfile(normalizeProfile(updatedProfile.data || updatedProfile));
    setStats(updatedStats);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.unfollowUser(userId);
        setIsFollowing(false);
        setStats((prev) => ({ ...prev, followersCount: Math.max(0, (prev?.followersCount || 0) - 1) }));
        showToast('Unfollowed successfully');
      } else {
        await api.followUser(userId);
        setIsFollowing(true);
        setStats((prev) => ({ ...prev, followersCount: (prev?.followersCount || 0) + 1 }));
        showToast('Following successfully');
      }
    } catch (error) {
      showToast(error.message || 'Error updating follow status', 'danger');
    }
  };

  const handleConnectSocial = async () => {
    try {
      if (selectedPlatform === 'youtube') {
        setConnectingSocial(true);
        const data = await api.getYouTubeAuthUrl();
        if (!data?.authUrl) throw new Error('Unable to start YouTube connection');
        window.location.href = data.authUrl;
        return;
      }

      if (!socialFormData.accountName && !socialFormData.accountUrl) {
        showToast('Please enter an account URL or handle', 'danger');
        return;
      }

      setConnectingSocial(true);
      await api.connectSocialMedia(
        selectedPlatform,
        socialFormData.accountId,
        socialFormData.accountName,
        socialFormData.accountUrl
      );

      showToast(`Connected ${selectedPlatform} and synced metrics`);
      setShowSocialModal(false);
      setSocialFormData({
        accountId: '',
        accountName: '',
        accountUrl: '',
      });

      await reloadProfileAndStats();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error connecting account', 'danger');
    } finally {
      setConnectingSocial(false);
    }
  };

  const handleDisconnectSocial = async (platform) => {
    if (!window.confirm(`Disconnect ${platform}?`)) return;

    try {
      await api.disconnectSocialMedia(platform);
      showToast(`Disconnected ${platform}`);
      await reloadProfileAndStats();
    } catch (error) {
      showToast('Error disconnecting account', 'danger');
    }
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

      if (!imageUrl) {
        throw new Error('Upload failed');
      }

      await api.updateUserAvatar(imageUrl);
      updateUser({ avatar: imageUrl });

      const postFormData = new FormData();
      postFormData.append('content', 'Updated my profile picture!');
      postFormData.append('media', file);
      await api.createPost(postFormData);

      showToast('Profile picture updated successfully');
      await reloadProfileAndStats();
    } catch (error) {
      showToast('Error uploading profile picture', 'danger');
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

      if (!imageUrl) {
        throw new Error('Upload failed');
      }

      await api.updateProfile({ banner: imageUrl });

      // Create a post about the banner update
      try {
        const postFormData = new FormData();
        postFormData.append('content', 'Updated my profile cover! 🎨');
        postFormData.append('media', file);
        await api.createPost(postFormData);
      } catch (postErr) {
        console.error('Failed to create banner update post:', postErr);
      }

      showToast('Banner updated successfully');
      await reloadProfileAndStats();
    } catch (error) {
      showToast('Error uploading banner picture', 'danger');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleStartChat = async () => {
    if (!initMessage.trim()) {
      showToast('Please enter a message', 'danger');
      return;
    }
    try {
      setSendingMessage(true);
      await api.initiateChat(userId, initMessage);
      showToast('Message sent successfully!');
      setShowMessageModal(false);
      setInitMessage('');
    } catch (error) {
      showToast(error.message || 'Error sending message', 'danger');
    } finally {
      setSendingMessage(false);
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
        <p>User not found</p>
        <LiquidButton variant="primary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          Go Back
        </LiquidButton>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === userId;

  if (profile.role === 'brand') {
    return <BrandProfile forcedUserId={userId} embedded={embedded} onEditProfile={onEditProfile} />;
  }

  return (
    <div className={`user-profile-page${embedded ? ' embedded-profile' : ''}`} data-theme={theme}>
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
            backgroundColor: profile.banner ? undefined : 'var(--accent-gradient)',
          }}
        >
          {!embedded && (
            <button onClick={() => navigate(-1)} className="btn-back-banner">
              Back
            </button>
          )}
          {isOwnProfile && (
            <div className="banner-upload-wrapper">
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="banner-upload"
                className="banner-upload-btn"
                title={uploading ? 'Uploading...' : 'Update Cover Photo'}
              >
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
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-btn"
                      title={uploading ? 'Uploading...' : 'Upload new profile picture'}
                    >
                      <Camera size={20} />
                    </label>
                  </>
                )}
              </div>

              <div className="profile-header-info">
                <div className="header-name-section">
                  <h1>{profile.name} {profile.username ? `(${profile.username})` : ''}</h1>
                </div>
                <div className="profile-stats-inline">
                  {stats?.followersCount >= 1000 ? (stats.followersCount / 1000).toFixed(1) + 'K' : (stats?.followersCount || 0)} followers • {stats?.postsCount || 0} posts • {stats?.followingCount >= 1000 ? (stats.followingCount / 1000).toFixed(1) + 'K' : (stats?.followingCount || 0)} following
                </div>
                
                {profile.role ? <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{profile.role}{profile.category ? ` || ${profile.category}` : ''}</div> : null}
                <div className="profile-actions">
                  {!isOwnProfile && (
                    <LiquidButton variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </LiquidButton>
                  )}
                  {!isOwnProfile && currentUser?.role === 'brand' && profile.role === 'influencer' && (
                    <LiquidButton variant="secondary" onClick={() => setShowMessageModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageCircle size={18} />
                      Message
                    </LiquidButton>
                  )}
                  {isOwnProfile && (
                    <>
                      <LiquidButton variant="secondary" onClick={() => (onEditProfile ? onEditProfile() : null)} style={{ padding: '0.4rem 1.5rem', fontSize: '0.95rem', fontWeight: '600' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> 
                        Edit Profile
                      </LiquidButton>
                      {/*<LiquidButton variant="secondary" onClick={() => {}} style={{ padding: '0.4rem 0.6rem', background: '#e4e6eb', color: '#1c1e21', border: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </LiquidButton>*/}
                    </>
                  )}
                </div>

                <div className="profile-bio-text">
                  {profile.bio}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-main-grid">
            <div className="profile-main-content">
              

              {profile.userBio?.about && (
                <div className="profile-bio-card">
                  <h3>About</h3>
                  <p>{profile.userBio.about}</p>
                </div>
              )}

              {profile.niche && profile.niche.length > 0 && (
                <div className="profile-niche-card">
                  <h3>Specializations</h3>
                  <div className="niche-tags">
                    {profile.niche.map((item) => (
                      <span key={item} className="niche-badge">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {profile.socialMediaAccounts && profile.socialMediaAccounts.length > 0 && (
            <div className="connected-social-section">
              <h3>Connected Social Media Accounts</h3>
              <div className="social-accounts-grid">
                {profile.socialMediaAccounts.map((account) => {
                  const audienceCount = account.platform === 'youtube'
                    ? (account.subscribers ?? account.followers ?? 0)
                    : (account.followers ?? 0);

                  return (
                  <div key={account.platform} className="social-account-card">
                    <div className="social-account-header">
                      <span className="platform-badge">{account.platform.toUpperCase()}</span>
                      {isOwnProfile && (
                        <button
                          className="btn-disconnect"
                          onClick={() => handleDisconnectSocial(account.platform)}
                          title="Disconnect"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="social-account-name">{account.accountName}</div>

                    <div className="social-account-stats">
                      <div className="account-stat">
                        <span className="stat-label">
                          {account.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                        </span>
                        <span className="stat-value">{(audienceCount / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="account-stat">
                        <span className="stat-label">{account.platform === 'youtube' ? 'Videos' : 'Posts'}</span>
                        <span className="stat-value">{account.platform === 'youtube' ? account.videos : account.posts}</span>
                      </div>
                    </div>

                    <a href={account.accountUrl} target="_blank" rel="noreferrer" className="social-account-link">
                      Visit Profile <LinkIcon size={14} />
                    </a>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div className="education-section">
              <LiquidButton variant="secondary" onClick={() => setShowSocialModal(true)} style={{ width: '100%' }}>
                Connect Social Media Account
              </LiquidButton>
            </div>
          )}

          {profile.education && profile.education.length > 0 && (
            <div className="education-section">
              <h3>Education</h3>
              <div className="info-items">
                {profile.education.map((edu) => (
                  <div key={edu._id} className="info-item">
                    <div className="info-item-title">{edu.schoolName}</div>
                    {edu.degree && (
                      <div className="info-item-subtitle">
                        {edu.degree}
                        {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                      </div>
                    )}
                    {edu.startDate && (
                      <div className="info-item-date">
                        {new Date(edu.startDate).getFullYear()}
                        {edu.endDate && ` - ${new Date(edu.endDate).getFullYear()}`}
                        {edu.currentlyStudying && ' (Currently Studying)'}
                      </div>
                    )}
                    {edu.grade && <div className="info-item-subtitle">Grade: {edu.grade}</div>}
                    {edu.activities && edu.activities.length > 0 && (
                      <div className="skills-list">
                        {edu.activities.map((activity) => (
                          <span key={activity} className="skill-tag">
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}
                    {edu.description && <div className="info-item-description">{edu.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.work && profile.work.length > 0 && (
            <div className="work-section">
              <h3>Work Experience</h3>
              <div className="info-items">
                {profile.work.map((work) => (
                  <div key={work._id} className="info-item">
                    <div className="info-item-title">{work.jobTitle}</div>
                    <div className="info-item-company">{work.companyName}</div>
                    {work.employmentType && (
                      <div className="info-item-subtitle">{work.employmentType.replace('-', ' ')}</div>
                    )}
                    {work.startDate && (
                      <div className="info-item-date">
                        {new Date(work.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        {work.endDate
                          ? ` - ${new Date(work.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                          : ' - Present'}
                        {work.currentlyWorking && ' (Current)'}
                      </div>
                    )}
                    {work.location && <div className="info-item-location">{work.location}</div>}
                    {work.description && <div className="info-item-description">{work.description}</div>}
                    {work.skills && work.skills.length > 0 && (
                      <div className="skills-list">
                        {work.skills.map((skill) => (
                          <span key={skill} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.userBio && (
            <div className="bio-section">
              <h3>Personal Information</h3>
              <div className="bio-details-grid">
                {profile.userBio.dateOfBirth && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Date of Birth</span>
                    <span className="bio-value">{new Date(profile.userBio.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {profile.userBio.gender && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Gender</span>
                    <span className="bio-value">{profile.userBio.gender.replace('-', ' ')}</span>
                  </div>
                )}
                {profile.userBio.relationshipStatus && profile.userBio.relationshipStatus !== 'not-specified' && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Relationship</span>
                    <span className="bio-value">{profile.userBio.relationshipStatus.replace('-', ' ')}</span>
                  </div>
                )}
                {profile.userBio.city && (
                  <div className="bio-detail-item">
                    <span className="bio-label">City</span>
                    <span className="bio-value">{profile.userBio.city}</span>
                  </div>
                )}
                {profile.userBio.currentCity && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Current Location</span>
                    <span className="bio-value">{profile.userBio.currentCity}</span>
                  </div>
                )}
                {profile.userBio.hometown && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Hometown</span>
                    <span className="bio-value">{profile.userBio.hometown}</span>
                  </div>
                )}
                {profile.userBio.address && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Address</span>
                    <span className="bio-value">{profile.userBio.address}</span>
                  </div>
                )}
                {profile.userBio.state && (
                  <div className="bio-detail-item">
                    <span className="bio-label">State</span>
                    <span className="bio-value">{profile.userBio.state}</span>
                  </div>
                )}
                {profile.userBio.country && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Country</span>
                    <span className="bio-value">{profile.userBio.country}</span>
                  </div>
                )}
                {profile.userBio.zipCode && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Zip Code</span>
                    <span className="bio-value">{profile.userBio.zipCode}</span>
                  </div>
                )}
                {profile.userBio.phone && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Phone</span>
                    <span className="bio-value">{profile.userBio.phone}</span>
                  </div>
                )}
                {profile.userBio.website && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Website</span>
                    <a href={profile.userBio.website} target="_blank" rel="noreferrer" className="bio-value">
                      {profile.userBio.website}
                    </a>
                  </div>
                )}
                {profile.userBio.pronouns && (
                  <div className="bio-detail-item">
                    <span className="bio-label">Pronouns</span>
                    <span className="bio-value">{profile.userBio.pronouns}</span>
                  </div>
                )}
              </div>

              {profile.userBio.hobbies && profile.userBio.hobbies.length > 0 && (
                <div className="bio-section-item">
                  <h4>Hobbies</h4>
                  <div className="tag-list">
                    {profile.userBio.hobbies.map((hobby) => (
                      <span key={hobby} className="tag">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.userBio.interests && profile.userBio.interests.length > 0 && (
                <div className="bio-section-item">
                  <h4>Interests</h4>
                  <div className="tag-list">
                    {profile.userBio.interests.map((interest) => (
                      <span key={interest} className="tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.userBio.languages && profile.userBio.languages.length > 0 && (
                <div className="bio-section-item">
                  <h4>Languages</h4>
                  <div className="tag-list">
                    {profile.userBio.languages.map((lang) => (
                      <span key={lang} className="tag">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showSocialModal && (
            <div className="modal-overlay glass-indicator" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)' }} onClick={() => setShowSocialModal(false)}>
              <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1.5px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Connect Social Media Account</h2>
                  <button className="modal-close" onClick={() => setShowSocialModal(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Platform</label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="input glass-indicator"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                    >
                      <option value="instagram" style={{ background: 'var(--bg-color)' }}>Instagram</option>
                      <option value="facebook" style={{ background: 'var(--bg-color)' }}>Facebook</option>
                      <option value="youtube" style={{ background: 'var(--bg-color)' }}>YouTube</option>
                    </select>
                  </div>

                  {selectedPlatform !== 'youtube' && (
                  <div className="form-group">
                    <label>Account Name / Handle</label>
                    <input
                      type="text"
                      placeholder="Optional if the URL includes the handle"
                      value={socialFormData.accountName}
                      onChange={(e) => setSocialFormData({ ...socialFormData, accountName: e.target.value })}
                      className="input glass-indicator"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  )}

                  {selectedPlatform !== 'youtube' && (
                  <div className="form-group">
                    <label>Account URL</label>
                    <input
                      type="text"
                      placeholder={
                        selectedPlatform === 'youtube'
                          ? 'https://youtube.com/@channel'
                          : selectedPlatform === 'facebook'
                            ? 'https://facebook.com/page'
                            : 'https://instagram.com/username'
                      }
                      value={socialFormData.accountUrl}
                      onChange={(e) => setSocialFormData({ ...socialFormData, accountUrl: e.target.value })}
                      className="input glass-indicator"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  )}

                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {selectedPlatform === 'youtube'
                      ? 'You will be redirected to Google to connect your own YouTube channel. Subscribers and videos/shorts will be fetched automatically.'
                      : 'Counts will be fetched automatically: followers and posts.'}
                  </p>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <LiquidButton variant="secondary" onClick={() => setShowSocialModal(false)} disabled={connectingSocial}>
                    Cancel
                  </LiquidButton>
                  <LiquidButton variant="primary" onClick={handleConnectSocial} disabled={connectingSocial}>
                    {connectingSocial ? 'Fetching Metrics...' : 'Connect Account'}
                  </LiquidButton>
                </div>
              </div>
            </div>
          )}

          {showMessageModal && (
            <div className="modal-overlay glass-indicator" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)' }} onClick={() => setShowMessageModal(false)}>
              <div className="modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'rgba(255, 255, 255, 0.05)', border: '1.5px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar sm">
                      {profile.avatar ? <img src={resolveAssetUrl(profile.avatar)} alt="" /> : profile.name?.[0]}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Message {profile.name}</h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Start a conversation as a Brand</p>
                    </div>
                  </div>
                  <button className="modal-close" onClick={() => setShowMessageModal(false)}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Your Message</label>
                    <textarea 
                      className="input glass-indicator" 
                      placeholder="Hi! We love your content and would like to discuss a potential partnership..." 
                      value={initMessage}
                      onChange={(e) => setInitMessage(e.target.value)}
                      style={{ minHeight: '120px', fontSize: '0.9rem', resize: 'none', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                  <LiquidButton 
                    variant="primary" 
                    onClick={handleStartChat} 
                    disabled={sendingMessage || !initMessage.trim()}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  >
                    {sendingMessage ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </LiquidButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
