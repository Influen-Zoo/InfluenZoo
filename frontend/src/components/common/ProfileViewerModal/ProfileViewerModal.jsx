import React from 'react';
import { X } from 'lucide-react';
import UserProfile from "../../../pages/UserProfile";

export default function ProfileViewerModal({ userId, onClose }) {
  if (!userId) return null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div 
        className="modal" 
        style={{ 
          maxWidth: '95vw',
          width: isMobile ? 'calc(100vw - 16px)' : '1000px',
          height: isMobile ? '88vh' : '90vh',
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: isMobile ? '24px' : 'var(--radius-2xl)',
          background: 'var(--surface)',
          padding: 0,
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: isMobile ? '0.9rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.25rem' }}>User Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
          <UserProfile forcedUserId={userId} embedded={true} />
        </div>
      </div>
    </div>
  );
}
