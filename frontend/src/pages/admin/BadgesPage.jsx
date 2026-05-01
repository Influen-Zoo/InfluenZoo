import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import { resolveAssetUrl } from '../../utils/helpers';
import './BadgesPage.css';

const ICON_OPTIONS = [
  'Award', 'Star', 'Shield', 'Zap', 'Crown', 'Trophy', 'Heart', 'Flame', 
  'Target', 'Diamond', 'Gem', 'BadgeCheck', 'CheckCircle', 'Verified',
  'Rocket', 'Coffee', 'Music', 'Camera', 'Code', 'Globe'
];

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Award',
    color: '#6366f1',
    isCustomIcon: false
  });
  const [customFile, setCustomFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const data = await api.getBadges();
      setBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (badge = null) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        name: badge.name,
        description: badge.description || '',
        icon: badge.isCustomIcon ? 'Award' : badge.icon,
        color: badge.color,
        isCustomIcon: badge.isCustomIcon
      });
    } else {
      setEditingBadge(null);
      setFormData({
        name: '',
        description: '',
        icon: 'Award',
        color: '#6366f1',
        isCustomIcon: false
      });
    }
    setCustomFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBadge(null);
    setCustomFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('color', formData.color);
    
    if (formData.isCustomIcon && customFile) {
      submissionData.append('icon', customFile);
    } else {
      submissionData.append('icon', formData.icon);
      submissionData.append('isCustomIcon', 'false');
    }

    try {
      if (editingBadge) {
        await api.updateBadge(editingBadge._id, submissionData);
      } else {
        await api.createBadge(submissionData);
      }
      fetchBadges();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save badge');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this badge? It will be removed from all users.')) return;
    try {
      await api.deleteBadge(id);
      fetchBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setFormData({ ...formData, isCustomIcon: true });
    }
  };

  const renderBadgeIcon = (badge) => {
    if (badge.isCustomIcon) {
      return <img src={resolveAssetUrl(badge.icon)} alt={badge.name} className="badge-preview-icon" />;
    }
    const Icon = LucideIcons[badge.icon] || LucideIcons.Award;
    return <Icon size={20} style={{ color: badge.color }} />;
  };

  const sidebarItems = getAdminSidebarItems();

  return (
    <AdminLayout activeSection="badges" sidebarItems={sidebarItems}>
      <div className="admin-badges-page">
        <div className="page-header">
          <div>
            <h1>User Badges</h1>
            <p>Create and manage badges for achievements and status.</p>
          </div>
          <button className="create-badge-btn" onClick={() => handleOpenModal()}>
            <LucideIcons.Plus size={18} />
            Create New Badge
          </button>
        </div>

        {loading && !badges.length ? (
          <div className="loader-container"><div className="spinner" /></div>
        ) : (
          <div className="badges-grid">
            {badges.map((badge) => (
              <motion.div 
                key={badge._id} 
                className="badge-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="badge-card-icon" style={{ borderColor: badge.color + '44' }}>
                  {renderBadgeIcon(badge)}
                </div>
                <div className="badge-card-info">
                  <h3>{badge.name}</h3>
                  <p>{badge.description || 'No description provided.'}</p>
                </div>
                <div className="badge-card-actions">
                  <button onClick={() => handleOpenModal(badge)}><LucideIcons.Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(badge._id)} className="delete"><LucideIcons.Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <motion.div 
                className="badge-modal" 
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="modal-header">
                  <h2>{editingBadge ? 'Edit Badge' : 'Create New Badge'}</h2>
                  <button onClick={handleCloseModal}><LucideIcons.X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="badge-form">
                  <div className="form-group">
                    <label>Badge Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Top Influencer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Briefly describe what this badge represents..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Accent Color</label>
                      <div className="color-input-wrapper">
                        <input 
                          type="color" 
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                        <span>{formData.color}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Icon Type</label>
                      <div className="toggle-group">
                        <button 
                          type="button"
                          className={!formData.isCustomIcon ? 'active' : ''}
                          onClick={() => setFormData({ ...formData, isCustomIcon: false })}
                        >
                          Library
                        </button>
                        <button 
                          type="button"
                          className={formData.isCustomIcon ? 'active' : ''}
                          onClick={() => setFormData({ ...formData, isCustomIcon: true })}
                        >
                          Custom
                        </button>
                      </div>
                    </div>
                  </div>

                  {!formData.isCustomIcon ? (
                    <div className="form-group">
                      <label>Select Icon</label>
                      <div className="icon-selector">
                        {ICON_OPTIONS.map(iconName => {
                          const Icon = LucideIcons[iconName];
                          return (
                            <div 
                              key={iconName}
                              className={`icon-option ${formData.icon === iconName ? 'selected' : ''}`}
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                            >
                              <Icon size={20} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Upload Custom Icon</label>
                      <div className="file-upload-area" onClick={() => fileInputRef.current.click()}>
                        <input 
                          type="file" 
                          hidden 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        {customFile ? (
                          <div className="file-preview">
                            <img src={URL.createObjectURL(customFile)} alt="Preview" />
                            <span>{customFile.name}</span>
                          </div>
                        ) : editingBadge?.isCustomIcon ? (
                          <div className="file-preview">
                            <img src={resolveAssetUrl(editingBadge.icon)} alt="Current" />
                            <span>Change image...</span>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <LucideIcons.Upload size={24} />
                            <span>Click to upload image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Saving...' : editingBadge ? 'Update Badge' : 'Create Badge'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default BadgesPage;
