import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CurvedNavbar.css';

export default function CurvedNavbar({
  items,
  activeKey,
  onChange,
  avatarSrc,
  avatarFallback = 'P',
  width = 420,
}) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : width
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeWidth = Math.min(width, Math.max(320, viewportWidth - 16));
  const activeItems = items.filter(item => !item.isAction);
  const fallbackActiveKey = activeItems[0]?.key;
  const resolvedActiveKey = activeItems.some(item => item.key === activeKey) ? activeKey : fallbackActiveKey;
  const activeIndex = Math.max(0, activeItems.findIndex(item => item.key === resolvedActiveKey));
  const activeItem = activeItems[activeIndex] || items[0];

  const sidePadding = 60;
  const usableWidth = safeWidth - sidePadding * 2;
  const spacing = activeItems.length > 1 ? usableWidth / (activeItems.length - 1) : 0;
  const getCenterX = (index) => sidePadding + spacing * index;
  const centerX = getCenterX(activeIndex);
  const baseX = centerX - 24;
  const verticalOffset = 10;

  const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  };

  return (
    <div className="curved-navbar-shell">
      <div className="curved-navbar" style={{ width: safeWidth }}>
        <div className="curved-navbar-bar" />

        <motion.div
          className="curved-navbar-notch"
          animate={{ left: baseX - 8 }}
          style={{ top: -2 + verticalOffset }}
          transition={spring}
        />

        <motion.div
          className="curved-navbar-fab"
          animate={{ left: baseX, scale: [1, 1.1, 1] }}
          style={{ top: 6 + verticalOffset }}
          transition={{ ...spring, scale: { duration: 0.25 } }}
        >
          {activeItem?.renderActive ? (
            activeItem.renderActive()
          ) : activeItem?.isProfile ? (
            avatarSrc ? (
              <img src={avatarSrc} alt={activeItem.label} className="curved-navbar-avatar" />
            ) : (
              <span className="curved-navbar-avatar-fallback">{avatarFallback}</span>
            )
          ) : activeItem?.icon ? (
            React.createElement(activeItem.icon, { className: 'curved-navbar-fab-icon' })
          ) : null}
        </motion.div>

        <motion.span
          className="curved-navbar-label"
          animate={{ left: centerX }}
          style={{
            top: 64 + verticalOffset,
            transform: 'translateX(-50%)',
          }}
          transition={spring}
        >
          {activeItem?.label}
        </motion.span>

        {items.map((item) => {
          const iconCenter = item.isAction ? safeWidth - 42 : getCenterX(activeItems.findIndex(active => active.key === item.key));
          const Icon = item.icon;
          const hidden = !item.isAction && resolvedActiveKey === item.key;

          return (
            <motion.button
              key={item.key}
              type="button"
              className={`curved-navbar-icon ${item.isAction ? 'is-action' : ''} ${item.isProfile ? 'is-profile' : ''}`}
              style={{
                left: iconCenter,
                bottom: 24,
                transform: 'translateX(-50%)',
              }}
              whileTap={{ scale: 0.85 }}
              onClick={() => (item.isAction ? item.onClick?.() : onChange(item.key))}
            >
              {item.isProfile ? (
                avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={item.label}
                    className={`curved-navbar-inline-avatar ${hidden ? 'is-hidden' : ''}`}
                  />
                ) : (
                  <span className={`curved-navbar-inline-fallback ${hidden ? 'is-hidden' : ''}`}>{avatarFallback}</span>
                )
              ) : Icon ? (
                <Icon className={hidden ? 'is-hidden' : ''} />
              ) : (
                <span className={hidden ? 'is-hidden' : ''}>{item.label[0]}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
