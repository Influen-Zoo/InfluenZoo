import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

const PostBlockModal = ({ blockingPost, onClose, blockReason, setBlockReason, onConfirm }) => {
  if (!blockingPost) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Block Post</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          by {blockingPost.author?.name}
        </p>
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Reason for blocking</label>
          <textarea 
            className="input" 
            rows="3"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="e.g. Not meeting community standards..."
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <LiquidButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton type="button" variant="error" onClick={onConfirm} style={{ flex: 1 }}>Block Post</LiquidButton>
        </div>
      </div>
    </div>
  );
};

export default PostBlockModal;
