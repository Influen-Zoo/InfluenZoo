import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CurvedNavbar.css';

export default function CurvedNavbar({
  items,
  activeKey,
  onChange,
  avatarSrc,
  avatarFallback = 'P',
  width = 440,
}) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : width
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeItems = items.filter(item => !item.isAction);
  const safeWidth = Math.min(width, viewportWidth - 24);
  
  // Calculate perfectly equal spacing with balanced side margins
  const sideMargin = 60;
  const usableWidth = safeWidth - (sideMargin * 2);
  const spacing = usableWidth / (activeItems.length - 1);

  const fallbackActiveKey = activeItems[0]?.key;
  const resolvedActiveKey = activeItems.some(item => item.key === activeKey) ? activeKey : fallbackActiveKey;
  const activeIndex = Math.max(0, activeItems.findIndex(item => item.key === resolvedActiveKey));
  const activeItem = activeItems[activeIndex] || activeItems[0];

  const centerX = sideMargin + (spacing * activeIndex);

  const dropletSpring = {
    type: 'spring',
    stiffness: 380,
    damping: 30,
    mass: 0.8
  };

  return (
    <div className="curved-navbar-shell">
      <div className="curved-navbar" style={{ width: safeWidth }}>
        <div className="curved-navbar-bar" />

        {/* 💧 THE LIQUID DROPLET INDICATOR */}
        <motion.div
          className="curved-navbar-droplet"
          animate={{ x: centerX }}
          transition={dropletSpring}
          style={{ translateX: '-50%' }}
        >
          <div className="droplet-inner">
            <div className="droplet-gloss" />
            <AnimatePresence mode="wait">
              <motion.div
                key={resolvedActiveKey}
                initial={{ y: 10, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="droplet-content"
              >
                {activeItem?.isProfile ? (
                  avatarSrc ? (
                    <img src={avatarSrc} alt="" className="droplet-avatar" />
                  ) : (
                    <span className="droplet-fallback">{avatarFallback}</span>
                  )
                ) : activeItem?.icon ? (
                  React.createElement(activeItem.icon, { className: 'droplet-icon' })
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <motion.span 
            className="droplet-label"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={`label-${resolvedActiveKey}`}
          >
            {activeItem?.label}
          </motion.span>
        </motion.div>

        {/* 🔘 BACKGROUND ICONS */}
        {activeItems.map((item, idx) => {
          const itemX = sideMargin + (spacing * idx);
          const isActive = item.key === resolvedActiveKey;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              className={`nav-item-btn ${isActive ? 'is-active' : ''}`}
              style={{ left: itemX }}
              onClick={() => onChange(item.key)}
            >
              <div className="nav-item-icon-wrapper">
                {item.isProfile ? (
                  avatarSrc ? (
                    <img src={avatarSrc} alt="" className="nav-item-avatar" />
                  ) : (
                    <span className="nav-item-fallback">{avatarFallback}</span>
                  )
                ) : Icon ? (
                  <Icon size={22} />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
