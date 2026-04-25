import React from 'react';

export const StatCard = ({ icon: Icon, label, value, trend, color, onClick }) => {
  return (
    <div className="stat-card-modern" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-header">
        <div className="stat-icon-container" style={{ color: color }}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

export const StatGrid = ({ children }) => {
  return (
    <div className="stats-grid-modern">
      {children}
    </div>
  );
};

export default StatCard;
