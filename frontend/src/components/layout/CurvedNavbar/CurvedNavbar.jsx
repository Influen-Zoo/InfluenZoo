import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './CurvedNavbar.css';

const getDockMotionValue = (distance, base, near, active) => {
  const absDistance = Math.abs(distance);

  if (!Number.isFinite(absDistance) || absDistance >= 180) return base;
  if (absDistance <= 80) {
    return active - (absDistance / 80) * (active - near);
  }

  return near - ((absDistance - 80) / 100) * (near - base);
};

function DesktopDockItem({
  item,
  mouseX,
  isActive,
  isAction,
  onClick,
  renderIcon,
  avatarSrc,
  avatarFallback,
}) {
  const ref = useRef(null);
  const distance = useTransform(mouseX, (value) => {
    if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;

    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Number.POSITIVE_INFINITY;

    return value - bounds.x - bounds.width / 2;
  });
  const itemScaleSync = useTransform(distance, (value) => getDockMotionValue(value, 1, 1.1, 1.32));
  const itemYSync = useTransform(distance, (value) => getDockMotionValue(value, 0, -4, -12));
  const iconScaleSync = useTransform(distance, (value) => getDockMotionValue(value, 1, 1.08, 1.18));
  const itemScale = useSpring(itemScaleSync, { mass: 0.18, stiffness: 220, damping: 24 });
  const itemY = useSpring(itemYSync, { mass: 0.18, stiffness: 220, damping: 24 });
  const iconScale = useSpring(iconScaleSync, { mass: 0.18, stiffness: 220, damping: 24 });

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`desktop-nav-item ${isActive ? 'is-active' : ''} ${isAction ? 'is-action' : ''}`}
      style={{ scale: itemScale, y: itemY }}
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      whileTap={{ y: -2, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      <motion.span
        className="desktop-nav-icon"
        style={{ scale: iconScale }}
      >
        {item.isProfile ? (
          avatarSrc ? (
            <img src={avatarSrc} alt="" className="desktop-nav-avatar" />
          ) : (
            <span className="desktop-nav-fallback">{avatarFallback}</span>
          )
        ) : (
          renderIcon(item, '')
        )}
        {item.badge > 0 && <span className="desktop-dock-badge">{item.badge}</span>}
      </motion.span>
      <span className="desktop-nav-label">{item.label}</span>
    </motion.button>
  );
}

export default function CurvedNavbar({
  items,
  actionItems = [],
  activeKey,
  onChange,
  avatarSrc,
  avatarFallback = 'P',
  width = 440,
}) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : width
  );
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeItems = items.filter(item => !item.isAction);
  const safeWidth = Math.min(width, viewportWidth - 24);
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

  const renderIcon = (item, className) => {
    const Icon = item.icon;

    if (item.isProfile) {
      return avatarSrc ? (
        <img src={avatarSrc} alt="" className={className} />
      ) : (
        <span className={className}>{avatarFallback}</span>
      );
    }

    return Icon ? <Icon size={22} className={className} /> : null;
  };

  const desktopNavItems = activeItems.filter(item => !item.isProfile);
  const desktopProfileItems = activeItems.filter(item => item.isProfile);
  const desktopNotificationItems = actionItems.filter(item => item.key === 'notifications');
  const desktopOtherActionItems = actionItems.filter(item => item.key !== 'notifications');
  const desktopItems = [
    ...desktopNavItems.map(item => ({ ...item, kind: 'nav' })),
    ...desktopOtherActionItems.map(item => ({ ...item, kind: 'action' })),
    ...desktopNotificationItems.map(item => ({ ...item, kind: 'action' })),
    ...desktopProfileItems.map(item => ({ ...item, kind: 'nav' })),
  ];

  return (
    <>
      <nav className="desktop-navbar" aria-label="Primary navigation">
        <motion.div
          className="desktop-dock"
          whileHover={{ scale: 1.04, y: -3 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onMouseMove={(event) => mouseX.set(event.clientX)}
          onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        >
          {desktopItems.map((item) => {
            const isAction = item.kind === 'action';
            const isActive = item.isActive ?? (!isAction && item.key === resolvedActiveKey);
            const handleClick = isAction ? item.onClick : () => onChange(item.key);

            return (
              <React.Fragment key={`${item.kind}-${item.key}`}>
                <DesktopDockItem
                  item={item}
                  mouseX={mouseX}
                  isActive={isActive}
                  isAction={isAction}
                  onClick={handleClick}
                  renderIcon={renderIcon}
                  avatarSrc={avatarSrc}
                  avatarFallback={avatarFallback}
                />
              </React.Fragment>
            );
          })}
        </motion.div>
      </nav>

      <div className="curved-navbar-shell">
        <div className="curved-navbar" style={{ width: safeWidth }}>
          <div className="curved-navbar-bar" />

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

          {activeItems.map((item, idx) => {
            const itemX = sideMargin + (spacing * idx);
            const isActive = item.key === resolvedActiveKey;

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
                  ) : item.icon ? (
                    React.createElement(item.icon, { size: 22 })
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
