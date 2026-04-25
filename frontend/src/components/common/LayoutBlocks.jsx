import React from 'react';

export const SubTabNav = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="explore-sub-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`sub-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
            title={tab.label}
          >
            <div className="sub-tab-icon-wrapper">
              <Icon size={20} />
            </div>
            {isActive && <div className="sub-tab-indicator" />}
          </button>
        );
      })}
    </div>
  );
};

export const EmptyState = ({ icon: Icon, message, description, action }) => {
  return (
    <div className="empty-state-modern glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02) !important' }}>
      <div className="empty-icon-wrapper" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(var(--primary-rgb), 0.3))' }}>
        {Icon ? <Icon size={64} color="var(--primary)" /> : <span style={{ fontSize: 64 }}>📋</span>}
      </div>
      <h3 className="empty-message" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{message}</h3>
      {description && <p className="empty-description" style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>{description}</p>}
      {action && (
        <LiquidButton variant="primary" onClick={action.onClick} style={{ minWidth: '160px' }}>
          {action.label}
        </LiquidButton>
      )}
    </div>
  );
};

export default SubTabNav;
