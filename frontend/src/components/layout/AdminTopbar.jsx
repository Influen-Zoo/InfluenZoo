import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, LogOut, Moon, Sun } from 'lucide-react';
import { getOwnProfilePath, resolveAssetUrl } from '../../utils/helpers';

export const AdminTopbar = ({
  setSidebarOpen,
  activeSectionTitle,
  theme,
  toggleTheme,
  user,
  showProfileDropdown,
  setShowProfileDropdown,
  setActiveSection,
  logout
}) => {
  const navigate = useNavigate();
  const openProfile = () => {
    navigate(getOwnProfilePath(user?.role));
    setShowProfileDropdown(false);
    setActiveSection?.('profile');
  };

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {activeSectionTitle}
        </h2>
      </div>
      <div className="admin-topbar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: 40, height: 40, fontSize: '1.25rem' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="profile-dropdown-container">
          <div
            className="admin-topbar-avatar"
            onClick={openProfile}
            role="button"
            tabIndex={0}
            aria-label="Open profile"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProfile();
              }
            }}
          >
            {user?.profilePicture ? <img src={resolveAssetUrl(user.profilePicture)} alt="Profile" /> : user?.name?.[0]}
          </div>

          <div className={`profile-dropdown ${showProfileDropdown ? 'open' : ''}`}>
            <div className="dropdown-item" onClick={openProfile}>
              <UserRound size={16} /> Update Profile
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={logout}>
              <LogOut size={16} /> Sign Out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
