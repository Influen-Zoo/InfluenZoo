import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Domain Hooks
import useInfluencerAnalytics from './useInfluencerAnalytics';
import useInfluencerContent from './useInfluencerContent';
import useInfluencerCampaigns from './useInfluencerCampaigns';
import useInfluencerMessages from './useInfluencerMessages';
import useInfluencerProfile from './useInfluencerProfile';

export const useInfluencerDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation & Tabs State (Kept in Master for coordination)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'home');
  const [dashboardSubTab, setDashboardSubTab] = useState('analytics');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [investigateId, setInvestigateId] = useState(null);
  const [filters, setFilters] = useState({ category: '', platform: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Domain Hooks
  const analytics = useInfluencerAnalytics(user);
  const content = useInfluencerContent(user, analytics.showToast);
  const campaigns = useInfluencerCampaigns(user, searchQuery, analytics.showToast);
  const messages = useInfluencerMessages(user, activeTab, location.state?.selectedConvId, analytics.showToast);
  const profile = useInfluencerProfile(user, analytics.showToast);

  // Sync activeTab with URL to keep Bottom Nav in sync
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/explore')) setActiveTab('explore');
    else if (path.includes('/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/profile')) setActiveTab('profile');
    else if (path.includes('/chat')) setActiveTab('chat');
    else if (path === '/influencer' || path === '/influencer/') setActiveTab('home');
  }, [location.pathname]);

  // Deep Link Handling
  useEffect(() => {
    if (location.state?.investigateId) setInvestigateId(location.state.investigateId);
  }, [location.state]);

  useEffect(() => {
    if (investigateId && campaigns.exploreItems.length > 0) {
      const target = campaigns.exploreItems.find(c => (c._id || c.id) === investigateId);
      if (target) {
        campaigns.setSelectedCampaignDetail(target);
        setInvestigateId(null);
      }
    }
  }, [investigateId, campaigns.exploreItems, campaigns.setSelectedCampaignDetail]);

  return {
    // Shared / Context
    user, logout, theme, toggleTheme, loading, setLoading,
    activeTab, setActiveTab,
    dashboardSubTab, setDashboardSubTab,
    filters, setFilters,
    searchQuery, setSearchQuery,
    toast: analytics.toast,
    showToast: analytics.showToast,

    // Analytics & Notifications & Wallet
    coinBalance: analytics.coinBalance,
    walletTransactions: analytics.walletTransactions,
    notifications: analytics.notifications,
    loadWallet: analytics.loadWallet,
    loadNotifications: analytics.loadNotifications,
    handleTopUp: analytics.handleTopUp,
    handleWithdraw: analytics.handleWithdraw,

    // Social Content
    feed: content.feed,
    followingIds: content.followingIds,
    loadFeed: content.loadFeed,
    handleFollowBrand: content.handleFollowBrand,
    handleUnfollowBrand: content.handleUnfollowBrand,

    // Campaigns & Explore
    exploreItems: campaigns.exploreItems,
    exploreSubTab: campaigns.exploreSubTab,
    setExploreSubTab: campaigns.setExploreSubTab,
    applications: campaigns.applications,
    savedCampaignIds: campaigns.savedCampaignIds,
    applyModal: campaigns.applyModal,
    setApplyModal: campaigns.setApplyModal,
    applyMsg: campaigns.applyMsg,
    setApplyMsg: campaigns.setApplyMsg,
    selectedCampaignDetail: campaigns.selectedCampaignDetail,
    setSelectedCampaignDetail: campaigns.setSelectedCampaignDetail,
    loadExploreItems: campaigns.loadExploreItems,
    loadApplications: campaigns.loadApplications,
    loadSavedCampaigns: campaigns.loadSavedCampaigns,
    handleToggleSave: campaigns.handleToggleSave,
    handleApply: (itemId, msg) => campaigns.handleApply(itemId, msg),

    // Messages & Chat
    conversations: messages.conversations,
    chatMessages: messages.chatMessages,
    selectedConvId: messages.selectedConvId,
    setSelectedConvId: messages.setSelectedConvId,
    replyText: messages.replyText,
    setReplyText: messages.setReplyText,
    handleSendMessage: messages.handleSendMessage,
    loadConversations: messages.loadConversations,

    // Profile & Search
    viewingProfileId, setViewingProfileId,
    editProfileModal: profile.editProfileModal,
    setEditProfileModal: profile.setEditProfileModal,
    profileData: profile.profileData,
    setProfileData: profile.setProfileData,
    savingProfile: profile.savingProfile,
    uploading: profile.uploading,
    setUploading: profile.setUploading,
    openEditProfileModal: profile.openEditProfileModal,
    handleFullProfileSave: profile.handleFullProfileSave,
    
    // Form Helpers
    handleProfileFieldChange: (field, value) => profile.setProfileData(prev => ({ ...prev, [field]: value })),
    handleBioFieldChange: (field, value) => profile.setProfileData(prev => ({ ...prev, userBio: { ...prev.userBio, [field]: value } })),
    handleSocialLinkChange: (platform, value) => profile.setProfileData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } })),
    addEducationEntry: profile.addEducationEntry,
    removeEducationEntry: profile.removeEducationEntry,
    handleEducationChange: (index, field, value) => profile.setProfileData(prev => {
      const newEdu = [...prev.education];
      newEdu[index] = { ...newEdu[index], [field]: value };
      if (field === 'currentlyStudying' && value) newEdu[index].endDate = '';
      return { ...prev, education: newEdu };
    }),
    addWorkEntry: profile.addWorkEntry,
    removeWorkEntry: profile.removeWorkEntry,
    handleWorkChange: (index, field, value) => profile.setProfileData(prev => {
      const newWork = [...prev.work];
      newWork[index] = { ...newWork[index], [field]: value };
      if (field === 'currentlyWorking' && value) newWork[index].endDate = '';
      return { ...prev, work: newWork };
    }),
  };
};

export default useInfluencerDashboard;
