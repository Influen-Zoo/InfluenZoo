import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, MessageSquare, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../utils/helpers';
import logo from '../../assets/influenzoo-logo.png';

export const TopNavbar = ({
  user,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  notifications = [],
  chatPath,
  theme,
  toggleTheme,
  desktopSearchOpen = false,
  searchLaunchKey = 0
}) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchAnimating, setSearchAnimating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  ));
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setIsDesktop(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop || !desktopSearchOpen) return;
    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 620);

    return () => window.clearTimeout(focusTimer);
  }, [desktopSearchOpen, isDesktop]);

  useEffect(() => {
    if (!isDesktop || !desktopSearchOpen || searchLaunchKey === 0) return;
    setSearchAnimating(true);
    const animationTimer = window.setTimeout(() => setSearchAnimating(false), 760);

    return () => window.clearTimeout(animationTimer);
  }, [desktopSearchOpen, isDesktop, searchLaunchKey]);

  const handleNav = (tab, path) => {
    setActiveTab(tab);
    if (path) navigate(path);
  };

  return (
    activeTab !== 'profile' && (
      <div className="top-navbar-global glass-header">
        {isDesktop && searchAnimating && (
          <motion.div
            key={`search-flight-${searchLaunchKey}`}
            className="desktop-search-flight"
            initial={{ left: '50%', top: 'calc(100vh - 5.5rem)', x: '-50%', scale: 1, opacity: 1 }}
            animate={{ left: 'calc(var(--page-gutter) + 212px)', top: '1.05rem', x: 0, scale: 1.04, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25, mass: 0.8 }}
            aria-hidden="true"
          >
            <Search size={22} />
          </motion.div>
        )}

        <div className="top-navbar-row">
          <div className="desktop-site-brand" aria-label="influenZoo">
            <img src={logo} alt="" />
            <span>influenZoo</span>
          </div>

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

        <motion.div
          className={`top-search-wrapper ${isDesktop && desktopSearchOpen ? 'desktop-search-open' : ''} ${isDesktop && !desktopSearchOpen ? 'desktop-search-collapsed' : ''}`}
          initial={false}
          animate={isDesktop && !desktopSearchOpen ? 'closed' : 'open'}
          variants={{
            closed: { opacity: 0, y: 96, scaleX: 0.08, scaleY: 0.72 },
            open: { opacity: 1, y: 0, scaleX: 1, scaleY: 1 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.75, delay: isDesktop && searchAnimating ? 0.18 : 0 }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={searchInputRef}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
          />
        </motion.div>
      </div>
    )
  );
};

export default TopNavbar;
