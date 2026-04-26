import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CurvedNavbar from './CurvedNavbar/CurvedNavbar';
import AiChatbot from '../common/AiChatbot/AiChatbot';
import TopUpModal from '../influencer/TopUpModal'; // Reuse TopUpModal
import { useBrandDashboard } from '../../hooks/brand/useBrandDashboard';
import { Bell, Bot, House, Compass, LayoutDashboard, MessageSquare, Moon, Search, Sun, User, Wallet } from 'lucide-react';
import CustomToast from '../common/CustomToast/CustomToast';
import { resolveAssetUrl } from '../../utils/helpers';
import '../../pages/BrandDashboard.css';
import TopNavbar from './TopNavbar';

export const BrandLayout = () => {
  const dashboard = useBrandDashboard();
  const navigate = useNavigate();
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchLaunchKey, setSearchLaunchKey] = useState(0);

  const navItems = [
    { key: 'explore', icon: Compass, label: 'Discover', path: '/brand/explore' },
    { key: 'home', icon: House, label: 'Home', path: '/brand' },
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/brand/dashboard' },
    { key: 'ai', icon: Bot, label: 'AI' },
    { key: 'profile', icon: User, label: 'Profile', path: '/brand/profile', isProfile: true },
  ];
  const unreadNotifs = dashboard.notifications.filter((n) => !n.read).length;

  const handleNavClick = (key) => {
    const item = navItems.find(i => i.key === key);
    if (item) {
      dashboard.setActiveTab(key);
      if (item.path) navigate(item.path);
    }
  };

  const desktopDockActions = [
    {
      key: 'search',
      icon: Search,
      label: 'Search',
      isActive: desktopSearchOpen,
      onClick: () => {
        setDesktopSearchOpen(true);
        setSearchLaunchKey((key) => key + 1);
      },
    },
    {
      key: 'notifications',
      icon: Bell,
      label: 'Alerts',
      badge: unreadNotifs,
      onClick: () => navigate('/notifications'),
    },
    {
      key: 'chat',
      icon: MessageSquare,
      label: 'Messages',
      isActive: dashboard.activeTab === 'chat',
      onClick: () => {
        dashboard.setActiveTab('chat');
        navigate('/brand/chat');
      },
    },
    {
      key: 'wallet',
      icon: Wallet,
      label: 'Wallet',
      isActive: dashboard.activeTab === 'dashboard' && dashboard.dashboardSubTab === 'wallet',
      onClick: () => {
        dashboard.setActiveTab('dashboard');
        dashboard.setDashboardSubTab('wallet');
        navigate('/brand/dashboard');
      },
    },
    {
      key: 'theme',
      icon: dashboard.theme === 'dark' ? Sun : Moon,
      label: 'Theme',
      onClick: dashboard.toggleTheme,
    },
  ];

  return (
    <div className={`brand-dashboard ${dashboard.theme}`}>
      <TopNavbar 
        user={dashboard.user}
        activeTab={dashboard.activeTab}
        setActiveTab={dashboard.setActiveTab}
        searchQuery={dashboard.searchQuery}
        setSearchQuery={dashboard.setSearchQuery}
        notifications={dashboard.notifications}
        chatPath="/brand/chat"
        theme={dashboard.theme}
        toggleTheme={dashboard.toggleTheme}
        desktopSearchOpen={desktopSearchOpen}
        searchLaunchKey={searchLaunchKey}
      />

      <CurvedNavbar 
        items={navItems}
        actionItems={desktopDockActions}
        activeKey={dashboard.activeTab}
        onChange={handleNavClick}
        user={dashboard.user}
        logout={dashboard.logout}
        notifications={dashboard.notifications}
        avatarSrc={resolveAssetUrl(dashboard.user?.avatar)}
        avatarFallback={dashboard.user?.name?.[0]}
        onNotifClick={dashboard.loadNotifications}
      />

      <main className="dashboard-content">
        {dashboard.activeTab === 'ai' ? (
          <AiChatbot role="brand" />
        ) : (
          <Outlet context={dashboard} />
        )}
      </main>

      {dashboard.showTopUp && (
        <TopUpModal 
          showTopUp={dashboard.showTopUp}
          setShowTopUp={dashboard.setShowTopUp}
          onTopUp={dashboard.handleTopUp}
        />
      )}

      {dashboard.toast && (
        <CustomToast 
          message={dashboard.toast.message} 
          type={dashboard.toast.type} 
          onClose={() => dashboard.showToast(null)} 
        />
      )}
    </div>
  );
};

export default BrandLayout;
