import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

export const FollowerEditModal = ({ isOpen, onClose, user, onUpdate }) => {
  if (!isOpen || !user) return null;

  const currentFollowers = Number(user.currentFollowers) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Manage Followers: {user.name}</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
          Current Followers: <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{currentFollowers.toLocaleString('en-IN')}</span>
        </p>
        <form onSubmit={onUpdate}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Followers to Add</label>
            <input type="number" min="1" className="input" required name="amount" defaultValue={100} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <LiquidButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</LiquidButton>
            <LiquidButton type="submit" variant="primary" style={{ flex: 1 }}>Add Followers</LiquidButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowerEditModal;
