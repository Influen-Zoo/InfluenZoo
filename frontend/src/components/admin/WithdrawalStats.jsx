import React from 'react';

const WithdrawalStats = ({ statsData }) => {
  return (
    <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>PENDING REQUESTS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.pendingCount}
        </div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🏁</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>COMPLETED REQUESTS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.completedCount}
        </div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>💸</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL PENDING AMT</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          ₹{statsData.pendingAmount.toLocaleString('en-IN')}
        </div>
      </div>
      <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' }}>
        <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>💰</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL COMPLETED AMT</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          ₹{statsData.completedAmount.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalStats;
