import React from 'react';

const CampaignStats = ({ statsData }) => {
  return (
    <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>📢</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL CAMPAIGNS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{statsData.total}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🚀</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ACTIVE NOW</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.activeCount}
        </div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>👥</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL APPLICATIONS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.totalApps}
        </div>
      </div>
      <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.05), transparent)' }}>
        <div className="admin-stat-icon" style={{ background: 'rgba(24, 119, 242, 0.1)', color: 'var(--primary)' }}>💰</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ALLOCATED BUDGET</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          ₹{statsData.totalBudget.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;
