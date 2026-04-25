import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Domain Hooks
import useBrandAnalytics from './useBrandAnalytics';
import useBrandCampaignManagement from './useBrandCampaignManagement';
import useBrandDiscovery from './useBrandDiscovery';
import useBrandMessages from './useBrandMessages';
import useBrandProfile from './useBrandProfile';

export const useBrandDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation & Tabs State (Kept in Master for coordination)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'home');
  const [exploreSubTab, setExploreSubTab] = useState('all');
  const [dashboardSubTab, setDashboardSubTab] = useState('analytics');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [investigateId, setInvestigateId] = useState(null);
  const [filters, setFilters] = useState({ category: '', platform: '', type: '' });
  const [showTopUp, setShowTopUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Domain Hooks
  const analytics = useBrandAnalytics(user);
  const campaigns = useBrandCampaignManagement(user, analytics.showToast);
  const discovery = useBrandDiscovery(user, exploreSubTab, filters, searchQuery, analytics.showToast);
  const messages = useBrandMessages(user, activeTab, location.state?.selectedConvId, analytics.showToast);
  const profile = useBrandProfile(user, analytics.showToast);

  // Sync activeTab with URL to keep Bottom Nav in sync
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/explore')) setActiveTab('explore');
    else if (path.includes('/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/profile')) setActiveTab('profile');
    else if (path.includes('/chat')) setActiveTab('chat');
    else if (path === '/brand' || path === '/brand/') setActiveTab('home');
  }, [location.pathname]);

  // Deep Link Handling
  useEffect(() => {
    if (location.state?.investigateId) setInvestigateId(location.state.investigateId);
  }, [location.state]);

  useEffect(() => {
    if (investigateId && discovery.exploreItems.length > 0) {
      const target = discovery.exploreItems.find(u => (u._id || u.id) === investigateId);
      if (target) {
        setViewingProfileId(target._id || target.id);
        setInvestigateId(null);
      }
    }
  }, [investigateId, discovery.exploreItems]);

  const handleJumpToCampaign = (id) => {
    setActiveTab('dashboard');
    setDashboardSubTab('announcements');
    campaigns.setJumpToCampaignId(id);
    navigate('/brand/dashboard');
  };

  return {
    // Shared / Context
    user, logout, theme, toggleTheme,
    activeTab, setActiveTab,
    exploreSubTab, setExploreSubTab,
    dashboardSubTab, setDashboardSubTab,
    filters, setFilters,
    searchQuery, setSearchQuery,
    toast: analytics.toast,
    showToast: analytics.showToast,
    showTopUp, setShowTopUp,
    loading: discovery.loading,

    // Analytics & Notifications & Wallet
    analytics: analytics.analytics,
    coinBalance: analytics.coinBalance,
    walletTransactions: analytics.walletTransactions,
    notifications: analytics.notifications,
    loadWallet: analytics.loadWallet,
    loadNotifications: analytics.loadNotifications,
    handleTopUp: analytics.handleTopUp,

    // Campaign Management
    campaigns: campaigns.campaigns,
    announcements: campaigns.announcements,
    setAnnouncements: campaigns.setAnnouncements,
    showCreateForm: campaigns.showCreateForm,
    setShowCreateForm: campaigns.setShowCreateForm,
    jumpToCampaignId: campaigns.jumpToCampaignId,
    setJumpToCampaignId: campaigns.setJumpToCampaignId,
    handleAcceptReject: campaigns.handleAcceptReject,
    handleJumpToCampaign,
    loadCampaigns: campaigns.loadCampaigns,
    loadAnnouncements: campaigns.loadAnnouncements,

    // Discovery & Search
    posts: discovery.posts,
    exploreItems: discovery.exploreItems,
    followingIds: discovery.followingIds,
    handleFollow: discovery.handleFollow,
    handleUnfollow: discovery.handleUnfollow,
    loadInfluencers: discovery.loadInfluencers,
    viewingProfileId, setViewingProfileId,

    // Messages & Chat
    conversations: messages.conversations,
    chatMessages: messages.chatMessages,
    selectedConvId: messages.selectedConvId,
    setSelectedConvId: messages.setSelectedConvId,
    replyText: messages.replyText,
    setReplyText: messages.setReplyText,
    handleSendMessage: messages.handleSendMessage,
    loadConversations: messages.loadConversations,

    // Profile
    brandProfileData: profile.brandProfileData,
    setBrandProfileData: profile.setBrandProfileData,
    editBrandProfileModal: profile.editBrandProfileModal,
    setEditBrandProfileModal: profile.setEditBrandProfileModal,
    savingBrandProfile: profile.savingBrandProfile,
    openEditProfile: profile.openEditProfile,
    saveBrandProfile: profile.saveBrandProfile,
  };
};

export default useBrandDashboard;
