import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { resolveAssetUrl } from '../../../utils/helpers';
import './UserBadge.css';

/**
 * UserBadge Component
 * A high-fidelity badge component with a 'Dynamic Island' expansion animation.
 * Automatically shrinks after 2 seconds.
 * 
 * @param {Object} badge - The badge object { name, icon, isCustomIcon, color }
 */
const UserBadge = ({ badge }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Auto-shrink after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isExpanded]);

  if (!badge) return null;

  const { name, icon, isCustomIcon, color } = badge;

  // Resolve Icon
  const renderIcon = () => {
    if (isCustomIcon) {
      return (
        <img 
          src={resolveAssetUrl(icon)} 
          alt={name} 
          className="badge-custom-icon"
        />
      );
    }

    const IconComponent = LucideIcons[icon] || LucideIcons.Award;
    return <IconComponent size={16} />;
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className={`user-badge-container ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpand}
      initial={false}
      animate={{
        width: isExpanded ? 'auto' : '28px',
        backgroundColor: isExpanded ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(255, 255, 255, 0.08)',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      style={{
        '--badge-color': color || 'var(--accent)',
      }}
    >
      <div className="badge-content">
        <div className="badge-icon-wrapper">
          {renderIcon()}
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className="badge-name"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5, transition: { duration: 0.1 } }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {name}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UserBadge;
