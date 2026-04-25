import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

export const CampaignCostModal = ({ isOpen, onClose, campaign, onUpdate }) => {
  if (!isOpen || !campaign) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Edit Campaign Fee</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{campaign.title}</p>
        <form onSubmit={onUpdate}>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Coin Cost (Application Fee)</label>
            <input 
              type="number" 
              min="0" 
              className="input" 
              required 
              name="cost" 
              defaultValue={campaign.cost} 
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <LiquidButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</LiquidButton>
            <LiquidButton type="submit" variant="primary" style={{ flex: 1 }}>Save Changes</LiquidButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignCostModal;
