import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function ApplyModal({
  campaign,
  onClose,
  applyMsg,
  setApplyMsg,
  onApply,
  loading
}) {
  if (!campaign) return null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: isMobile ? 'calc(100vw - 16px)' : undefined }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ marginBottom: '0.5rem' }}>Apply to Campaign</h3>
        <p style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{campaign.title} by {campaign.brandName}</p>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '1.25rem' }}>
          Application Fee: {campaign.coinCost || 0} Coins
        </p>
        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
          <label>Why are you a good fit?</label>
          <textarea
            className="input"
            placeholder="Tell the brand why you'd be great for this campaign..."
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
          <LiquidButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton variant="primary" onClick={onApply} style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Applying...' : 'Pay & Apply'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
