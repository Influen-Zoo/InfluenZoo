import React from 'react';

const PostStats = ({ statsData }) => {
  return (
    <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>📸</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL POSTS</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{statsData.total}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>❤️</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL ENGAGEMENT</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.totalEngagement.toLocaleString('en-IN')}
        </div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>📈</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>AVG. ENGAGEMENT</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.avgEngagement}
        </div>
      </div>
      <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent)' }}>
        <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🌊</div>
        <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>EST. REACH</span>
        </div>
        <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {statsData.estReach.toLocaleString('en-IN')}+
        </div>
      </div>
    </div>
  );
};

export default PostStats;
