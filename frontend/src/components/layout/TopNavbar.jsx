import React from 'react';
import { Search, Bell, MessageSquare, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../utils/helpers';

export const TopNavbar = ({
  user,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  notifications = [],
  chatPath,
  theme,
  toggleTheme
}) => {
  const navigate = useNavigate();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleNav = (tab, path) => {
    setActiveTab(tab);
    if (path) navigate(path);
  };

  return (
    activeTab !== 'profile' && (
      <div className="top-navbar-global glass-header">
        <div className="top-navbar-row">
          <div className="avatar-mini" onClick={() => handleNav('profile', `/${user.role}/profile`)}>
            {user?.avatar ? (
              <img
                src={resolveAssetUrl(user.avatar)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Profile"
              />
            ) : (
              <div className="avatar-placeholder-mini">{user?.name?.[0]}</div>
            )}
          </div>

          <div className="dash-actions">
            <button
              className="btn-icon-modern"
              onClick={() => navigate('/notifications')}
              title="Notifications"
            >
              <Bell size={22} />
              {unreadNotifs > 0 && <span className="notification-badge">{unreadNotifs}</span>}
            </button>
            <button
              className="btn-icon-modern"
              onClick={() => handleNav('chat', chatPath)}
              title="Messages"
            >
              <MessageSquare size={22} />
            </button>
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="top-search-wrapper">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
          />
        </div>
      </div>
    )
  );
};

export default TopNavbar;
