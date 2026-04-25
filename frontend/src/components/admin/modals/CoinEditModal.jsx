import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

export const CoinEditModal = ({ isOpen, onClose, user, onUpdate }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Manage Coins: {user.name}</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
          Current Balance: <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{user.currentCoins || 0} 🪙</span>
        </p>
        <form onSubmit={onUpdate}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Action</label>
            <select className="input" name="action" defaultValue="credit">
              <option value="credit">Add Coins</option>
              <option value="debit">Deduct Coins</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Amount</label>
            <input type="number" min="1" className="input" required name="amount" defaultValue={100} />
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Reason (Audit Log)</label>
            <input type="text" className="input" name="reason" placeholder="e.g. Activity Reward" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <LiquidButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</LiquidButton>
            <LiquidButton type="submit" variant="primary" style={{ flex: 1 }}>Submit</LiquidButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoinEditModal;
