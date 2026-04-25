import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

const PostDetailsModal = ({ selectedPost, onClose }) => {
  if (!selectedPost) return null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '600px', width: isMobile ? 'calc(100vw - 16px)' : '90%' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="avatar" style={{ width: 56, height: 56, margin: '0 auto 0.9rem', fontSize: '1.35rem' }}>
            {selectedPost.author?.profilePicture ? <img src={selectedPost.author.profilePicture} alt="" /> : selectedPost.author?.name?.[0]}
          </div>
          <h3 style={{ fontWeight: 800, marginBottom: '0.35rem' }}>{selectedPost.author?.name}</h3>
          <span className="badge badge-primary">{selectedPost.category || 'General'}</span>
        </div>

        <div style={{ background: 'var(--surface-alt)', padding: isMobile ? '1rem' : '1.25rem', borderRadius: '16px', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {selectedPost.caption || selectedPost.content}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={cardStyle}>
            <span style={labelStyle}>Likes</span>
            <span style={valueStyle}>❤ {Array.isArray(selectedPost.likes) ? selectedPost.likes.length : 0}</span>
          </div>
          <div style={cardStyle}>
            <span style={labelStyle}>Comments</span>
            <span style={valueStyle}>💬 {Array.isArray(selectedPost.comments) ? selectedPost.comments.length : 0}</span>
          </div>
          <div style={cardStyle}>
            <span style={labelStyle}>Posted On</span>
            <span style={valueStyle}>🗓 {formatDate(selectedPost.createdAt)}</span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <LiquidButton variant="secondary" onClick={onClose}>Close</LiquidButton>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  padding: '0.95rem',
  background: 'var(--surface-alt)',
  borderRadius: '14px',
  textAlign: 'center'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--text-muted)'
};

const valueStyle = {
  fontSize: '1.05rem',
  fontWeight: 800
};

export default PostDetailsModal;
