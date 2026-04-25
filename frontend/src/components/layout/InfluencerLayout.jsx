import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CurvedNavbar from './CurvedNavbar/CurvedNavbar';
import AiChatbot from '../common/AiChatbot/AiChatbot';
import CreatorSetupFlow from '../influencer/CreatorSetupFlow';
import TopUpModal from '../influencer/TopUpModal';
import { useInfluencerDashboard } from '../../hooks/influencer/useInfluencerDashboard';
import { Bot, House, Compass, LayoutDashboard, User } from 'lucide-react';
import CustomToast from '../common/CustomToast/CustomToast';
import { resolveAssetUrl } from '../../utils/helpers';
import '../../pages/InfluencerDashboard.css';
import TopNavbar from './TopNavbar';

export const InfluencerLayout = () => {
  const dashboard = useInfluencerDashboard();
  const navigate = useNavigate();

  const navItems = [
    { key: 'home', icon: House, label: 'Home', path: '/influencer' },
    { key: 'explore', icon: Compass, label: 'Discover', path: '/influencer/explore' },
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/influencer/dashboard' },
    { key: 'ai', icon: Bot, label: 'AI' },
    { key: 'profile', icon: User, label: 'Profile', path: '/influencer/profile', isProfile: true },
  ];

  const handleNavClick = (key) => {
    const item = navItems.find(i => i.key === key);
    if (item) {
      dashboard.setActiveTab(key);
      navigate(item.path);
    }
  };

  if (dashboard.user?.status === 'inactive') {
    return <CreatorSetupFlow user={dashboard.user} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className={`influencer-dashboard ${dashboard.theme}`}>
      <TopNavbar 
        user={dashboard.user}
        activeTab={dashboard.activeTab}
        setActiveTab={dashboard.setActiveTab}
        searchQuery={dashboard.searchQuery}
        setSearchQuery={dashboard.setSearchQuery}
        notifications={dashboard.notifications}
        chatPath="/influencer/chat"
        theme={dashboard.theme}
        toggleTheme={dashboard.toggleTheme}
      />

      <CurvedNavbar 
        items={navItems}
        activeKey={dashboard.activeTab}
        onChange={handleNavClick}
        user={dashboard.user}
        logout={dashboard.logout}
        notifications={dashboard.notifications}
        avatarSrc={resolveAssetUrl(dashboard.user?.avatar)}
        avatarFallback={dashboard.user?.name?.[0]}
        onNotifClick={dashboard.loadNotifications} // Simplified for now
      />

      <main className="dashboard-content">
        {dashboard.activeTab === 'ai' ? (
          <AiChatbot role="influencer" />
        ) : (
          <Outlet context={dashboard} />
        )}
      </main>

      {dashboard.showTopUp && (
        <TopUpModal 
          showTopUp={dashboard.showTopUp}
          setShowTopUp={dashboard.setShowTopUp}
          onTopUp={dashboard.handleTopUp} // I need to add this method to the hook or pass handleTopUp
          // Wait, I should check the hook again.
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

export default InfluencerLayout;
