import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Check, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  PartyPopper,
  Calendar,
  X,
  Heart,
  UserPlus,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Notifications.css';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveAssetUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `${API_BASE}${value.startsWith('/') ? value : `/${value}`}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

const getNotifIcon = (type) => {
  switch (type) {
    case 'accepted': return <PartyPopper size={16} />;
    case 'rejected': return <X size={16} />;
    case 'campaign': return <Bell size={16} />;
    case 'message': return <MessageSquare size={16} />;
    case 'payment': return <CheckCircle size={16} />;
    case 'follow': return <UserPlus size={16} />;
    case 'like': return <Heart size={16} />;
    case 'save': return <Bookmark size={16} />;
    default: return <AlertCircle size={16} />;
  }
};

const getNotifIconBg = (type) => {
  switch (type) {
    case 'accepted': return '#10b981';
    case 'rejected': return '#ef4444';
    case 'campaign': return '#3b82f6';
    case 'message': return '#fbbf24';
    case 'payment': return '#10b981';
    case 'follow': return '#8b5cf6';
    case 'like': return '#ec4899';
    case 'save': return '#f59e0b';
    default: return '#64748b';
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await handleMarkAsRead(notif._id);
    }
    const roleBase = user?.role === 'brand' ? '/brand' : '/influencer';

    if (notif.type === 'message') {
      navigate(roleBase, { state: { activeTab: 'chat', selectedConvId: notif.relatedId } });
    } else if (notif.type === 'accepted') {
      navigate(roleBase, { state: { activeTab: 'dashboard', dashboardSubTab: 'applications' } });
    } else if (notif.type === 'follow') {
      if (notif.sender?._id) {
        navigate(`/profile/${notif.sender._id}`);
      } else {
        navigate(roleBase);
      }
    } else if (notif.type === 'like' || notif.type === 'save' || notif.type === 'comment' || notif.type === 'accepted' || notif.type === 'campaign') {
      navigate(roleBase, { state: { activeTab: 'explore', investigateId: notif.relatedId } });
    } else {
      navigate(-1);
    }
  };

  const groupNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    notifications.forEach(n => {
      const date = new Date(n.createdAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        groups.Today.push(n);
      } else if (date.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  };

  const groupedNotifs = groupNotifications();

  return (
    <div className="notifications-page">
      <div className="notifications-container glass-panel">
        <div className="notifications-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-icon" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} />
            </button>
            <h2>Notifications</h2>
          </div>
          <div className="notifications-actions">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={handleMarkAllRead}
              disabled={!notifications.some(n => !n.read)}
            >
              <Check size={16} /> Mark all as read
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              <Bell />
            </div>
            <h3>No notifications yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>We'll let you know when something important happens.</p>
          </div>
        ) : (
          <div className="notification-groups">
            {Object.entries(groupedNotifs).map(([group, notifs]) => (
              notifs.length > 0 && (
                <div key={group}>
                  <div className="notification-group-header">{group}</div>
                  <div className="notification-list">
                    {notifs.map(n => (
                      <div 
                        key={n._id} 
                        className={`notification-item ${n.read ? '' : 'unread'}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className="notification-avatar-wrapper">
                          <div className="notification-avatar">
                            {n.sender?.avatar ? (
                              <img src={resolveAssetUrl(n.sender.avatar)} alt="" />
                            ) : (
                              <div style={{ background: 'var(--accent-gradient)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {n.sender?.name?.[0] || 'S'}
                              </div>
                            )}
                          </div>
                          <div className="notification-icon-badge" style={{ background: getNotifIconBg(n.type) }}>
                            {getNotifIcon(n.type)}
                          </div>
                        </div>
                        <div className="notification-content">
                          <p className="notification-text">
                            <b>{n.title || 'Notification'}</b> {n.message}
                          </p>
                          <span className="notification-time">{formatTime(n.createdAt)}</span>
                        </div>
                        {!n.read && <div className="notification-dot" />}
                        <button 
                          className="notification-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === n._id ? null : n._id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
