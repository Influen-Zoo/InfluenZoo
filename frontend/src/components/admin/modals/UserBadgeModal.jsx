import React, { useState, useEffect } from 'react';
import { X, Award, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import adminService from '../../../services/admin.service';
import { resolveAssetUrl } from '../../../utils/helpers';
import LiquidButton from '../../common/LiquidButton/LiquidButton';
import './UserBadgeModal.css';

const UserBadgeModal = ({ isOpen, onClose, user, onBulkUpdate }) => {
  const [allBadges, setAllBadges] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAllBadges();
      // Initialize selected IDs from current user badges
      setSelectedIds(new Set(user?.badges?.map(b => b._id) || []));
    }
  }, [isOpen, user]);

  const fetchAllBadges = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBadges();
      setAllBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const filteredBadges = allBadges.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBadgeLocal = (badgeId) => {
    const next = new Set(selectedIds);
    if (next.has(badgeId)) {
      next.delete(badgeId);
    } else {
      next.add(badgeId);
    }
    setSelectedIds(next);
  };

  const handleDone = async () => {
    setConfirming(true);
    try {
      const initialIds = new Set(user.badges?.map(b => b._id) || []);
      
      // Determine what to add and what to remove
      const toAdd = Array.from(selectedIds).filter(id => !initialIds.has(id));
      const toRemove = Array.from(initialIds).filter(id => !selectedIds.has(id));

      // Execute bulk update
      await onBulkUpdate(user._id, toAdd, toRemove);

      onClose();
    } catch (error) {
      console.error('Error updating badges:', error);
    } finally {
      setConfirming(false);
    }
  };

  const renderBadgeIcon = (badge) => {
    if (badge.isCustomIcon) {
      return (
        <img 
          src={resolveAssetUrl(badge.icon)} 
          alt={badge.name} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    }
    const IconComponent = LucideIcons[badge.icon] || Award;
    return <IconComponent size={18} />;
  };

  return (
    <div className="modal-overlay glass-overlay" onClick={onClose}>
      <motion.div 
        className="user-badge-modal glass-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-header">
          <div className="title-area">
            <div className="header-icon-container">
              <Award size={22} />
            </div>
            <div>
              <h3>Grant Privileges</h3>
              <p>Selecting for: <span className="highlight-name">{user.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div className="modal-search">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search platform badges..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="badge-selection-list custom-scrollbar">
          {loading ? (
            <div className="modal-loading">
              <Loader2 className="spinner" />
              <span>Fetching badge library...</span>
            </div>
          ) : filteredBadges.length > 0 ? (
            filteredBadges.map(badge => {
              const isAssigned = selectedIds.has(badge._id);
              return (
                <div 
                  key={badge._id} 
                  className={`badge-item ${isAssigned ? 'assigned' : ''}`}
                  onClick={() => toggleBadgeLocal(badge._id)}
                >
                  <div className="badge-item-icon" style={{ 
                    backgroundColor: badge.color ? `${badge.color}22` : 'rgba(var(--accent-rgb), 0.1)', 
                    color: badge.color || 'var(--accent)' 
                  }}>
                    {renderBadgeIcon(badge)}
                  </div>
                  <div className="badge-item-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.description || 'Verified achievement badge'}</p>
                  </div>
                  <div className={`badge-toggle ${isAssigned ? 'active' : ''}`}>
                    <AnimatePresence>
                      {isAssigned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-badges">
              < Award size={40} opacity={0.2} style={{ marginBottom: '1rem' }} />
              <p>No matching badges found</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <LiquidButton 
            variant="secondary" 
            onClick={onClose} 
            disabled={confirming}
          >
            Cancel
          </LiquidButton>
          <LiquidButton 
            variant="accent" 
            onClick={handleDone}
            disabled={confirming}
            style={{ minWidth: '180px' }}
          >
            {confirming ? (
              <>
                <Loader2 className="spinner-small" /> Updating...
              </>
            ) : 'Apply Changes'}
          </LiquidButton>
        </div>
      </motion.div>
    </div>
  );
};

export default UserBadgeModal;
