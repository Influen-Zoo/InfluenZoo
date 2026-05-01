import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function ApplyModal({
  campaign,
  onClose,
  applyMsg,
  setApplyMsg,
  selectedOutlet,
  setSelectedOutlet,
  onApply,
  loading
}) {
  if (!campaign) return null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;
  const outlets = Array.isArray(campaign.outlets) ? campaign.outlets : [];
  const outletRequired = outlets.length > 0;

  React.useEffect(() => {
    if (!outlets.includes(selectedOutlet)) setSelectedOutlet('');
  }, [campaign?._id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: isMobile ? 'calc(100vw - 16px)' : undefined }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ marginBottom: '0.5rem' }}>Apply to Campaign</h3>
        <p style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{campaign.title} by {campaign.brandName}</p>
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '1.25rem' }}>
          Application Fee: {campaign.coinCost || 0} Coins
        </p>
        {outlets.length > 0 && (
          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label>Outlet</label>
            <select
              className="input"
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
            >
              <option value="">Select outlet</option>
              {outlets.map((outlet) => (
                <option key={outlet} value={outlet}>{outlet}</option>
              ))}
            </select>
          </div>
        )}
        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
          <label>Why are you a good fit?</label>
          <textarea
            className="input"
            placeholder="Tell the brand why you'd be great for this campaign..."
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.75rem' }}>
          <LiquidButton variant="secondary" onClick={onClose} size={isMobile ? 'small' : 'medium'} style={{ flex: '0 0 auto' }}>Cancel</LiquidButton>
          <LiquidButton variant="primary" onClick={onApply} size={isMobile ? 'small' : 'medium'} style={{ flex: '0 0 auto', marginLeft: 'auto' }} disabled={loading || (outletRequired && !selectedOutlet)}>
            {loading ? 'Applying...' : 'Pay & Apply'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
