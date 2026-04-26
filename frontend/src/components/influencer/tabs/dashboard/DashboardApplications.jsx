import React from 'react';
import { getItemId } from '../../../../utils/helpers';

export default function DashboardApplications({ filters, setFilters, applications, savedCampaignIds, exploreItems, onCampaignClick }) {
  const isSavedTab = filters.type === 'saved';
  
  const displayItems = isSavedTab 
    ? (exploreItems || []).filter(c => savedCampaignIds?.includes(getItemId(c)))
    : applications?.filter(a => !filters.type || a.status === filters.type);

  return (
    <div className="dashboard-applications-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>{isSavedTab ? 'Saved Campaigns' : 'My Applications'}</h3>
          <div className="tabs glass-indicator" style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '0.5rem', borderRadius: 'var(--radius-pill)', border: '1.5px solid rgba(255, 255, 255, 0.1)' }}>
            {['All', 'Pending', 'Accepted', 'Rejected', 'Saved'].map(status => (
              <div 
                key={status} 
                className={`tab ${filters.type === status.toLowerCase() ? 'active' : (!filters.type && status === 'All') ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, type: status === 'All' ? '' : status.toLowerCase() })}
                style={{ padding: '0.4rem 1.25rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.8125rem' }}
              >
                {status}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayItems?.map((item, index) => {
              const key = getItemId(item) || `item-${index}`;
              
              if (isSavedTab) {
                // Render as a campaign card (since it hasn't been applied to yet in this context)
                return (
                  <div key={key} className="application-card glass-panel" onClick={() => onCampaignClick && onCampaignClick(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                    <div className="avatar" style={{ background: 'var(--accent-gradient)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                      🔖
                    </div>
                    <div className="application-info" style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{item.title}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.content || 'N/A'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', marginBottom: '4px', fontSize: '1.125rem' }}>{item.budget?.toLocaleString()} 🪙</div>
                      <span className="badge badge-info">Saved</span>
                    </div>
                  </div>
                );
              }

              // Full campaign discovery for the detail modal to be populated
              const campaignIdToMatch = getItemId(item.campaignId);
              const fullCampaign = (exploreItems || []).find(c => getItemId(c) === campaignIdToMatch) || item.campaignId;

              // Render as application card
              return (
                <div key={key} className="application-card glass-panel" onClick={() => onCampaignClick && onCampaignClick(fullCampaign)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                  <div className="avatar" style={{ 
                    background: item.status === 'accepted' ? 'var(--success)' : item.status === 'rejected' ? 'var(--danger)' : 'var(--accent-gradient)',
                    width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)', flexShrink: 0
                  }}>
                    {item.status === 'accepted' ? '✓' : item.status === 'rejected' ? '✕' : '⏳'}
                  </div>
                  <div className="application-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{fullCampaign?.title || 'Campaign'}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fullCampaign?.content || 'N/A'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent)', marginBottom: '4px', fontSize: '1.125rem' }}>{item.proposedPrice?.toLocaleString()} 🪙</div>
                    <span className={`badge badge-${item.status === 'accepted' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {(displayItems?.length === 0 || !displayItems) && (
            <div className="empty-state">
                <div style={{ fontSize: 48, opacity: 0.5, marginBottom: '1rem' }}>{isSavedTab ? '🔖' : '📄'}</div>
                <p>No {isSavedTab ? 'saved campaigns' : 'applications'} yet</p>
                {isSavedTab && <p style={{ fontSize: '0.75rem' }}>Save campaigns from common/explore to see them here!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
