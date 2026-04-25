import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const DisputeList = ({ disputes, handleResolveDispute }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
      {disputes.map(d => (
        <div key={d._id} className="dispute-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <div className="dispute-parties">
              <span style={{ fontWeight: 700 }}>{d.reporter?.name}</span>
              <span className="dispute-vs">VS</span>
              <span style={{ fontWeight: 700 }}>{d.reported?.name}</span>
            </div>
            <span className={`badge ${d.status === 'resolved' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span>
          </div>
          <p style={{ fontSize: '0.875rem', margin: '0.75rem 0', lineHeight: 1.5 }}>{d.description}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {d._id?.substring(0, 8)}...</span>
            {d.status !== 'resolved' && (
              <LiquidButton variant="primary" onClick={() => handleResolveDispute(d._id)}>Resolve</LiquidButton>
            )}
          </div>
        </div>
      ))}
      {disputes.length === 0 && (
        <div className="empty-state" style={{ gridColumn: '1/-1' }}>No active disputes</div>
      )}
    </div>
  );
};

export default DisputeList;
