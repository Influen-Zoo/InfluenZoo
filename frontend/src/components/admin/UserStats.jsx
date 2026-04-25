import React from 'react';

const UserStats = ({ stats, filteredUsersCount }) => {
  return (
    <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>👤</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL USERS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalUsers) || filteredUsersCount}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>🤳</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>INFLUENCERS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalInfluencers || 0)}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>🏢</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>BRANDS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalBrands || 0)}</div>
      </div>
      <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), transparent)' }}>
        <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>🛡️</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>VERIFIED</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.verifiedUsers || 0)}</div>
      </div>
    </div>
  );
};

export default UserStats;
