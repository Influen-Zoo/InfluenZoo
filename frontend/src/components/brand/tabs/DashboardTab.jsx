import React, { useState } from 'react';
import { BarChart3, Megaphone, Wallet, Plus, Check, XCircle, Eye, X } from 'lucide-react';
import api from '../../../services/api';
import { resolveAssetUrl } from '../../../utils/helpers';
import BrandDashboardAnalytics from './dashboard/BrandDashboardAnalytics';
import DashboardWallet from '../../influencer/tabs/dashboard/DashboardWallet';
import { SubTabNav } from '../../common/LayoutBlocks';

export default function DashboardTab({
  analytics,
  campaigns,
  maxBarValue,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
  user,
  coinBalance,
  walletTransactions,
  setShowTopUp,
  onWithdraw,
  onAcceptReject,
  jumpToId,
  onClearJump,
  onViewProfile
}) {
  const [expandedCamp, setExpandedCamp] = useState(null);
  const [applications, setApplications] = useState({});
  const [loadingApps, setLoadingApps] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);

  // Auto-expand campaign if jumpToId is provided
  React.useEffect(() => {
    if (jumpToId) {
      toggleExpand(jumpToId);
      // Wait for 1s then clear jump id so user isn't stuck if they manual toggle
      const timer = setTimeout(() => {
        onClearJump?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jumpToId]);

  const toggleExpand = async (campaignId) => {
    if (expandedCamp === campaignId) {
      setExpandedCamp(null);
      return;
    }

    setExpandedCamp(campaignId);
    if (!applications[campaignId]) {
      setLoadingApps(true);
      try {
        const apps = await api.getCampaignApplications(campaignId);
        setApplications(prev => ({ ...prev, [campaignId]: apps }));
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoadingApps(false);
      }
    }
  };

  const handleAction = async (appId, action, campId) => {
    try {
      await onAcceptReject(appId, action);
      // Refresh applications for this campaign
      const apps = await api.getCampaignApplications(campId);
      setApplications(prev => ({ ...prev, [campId]: apps }));
    } catch (err) {
      console.error(`Error ${action}ing application:`, err);
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'wallet',    label: 'Wallet',    icon: Wallet    },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>

      <SubTabNav 
        tabs={tabs} 
        activeTab={activeSubTab} 
        onChange={setActiveSubTab} 
      />

      {/* Tab Content */}
      <div className="responsive-tab-content">

        {/* Analytics Sub-tab — full campaign analytics */}
        {activeSubTab === 'analytics' && (
          <BrandDashboardAnalytics />
        )}

        {/* Wallet Sub-tab — exact same component as influencer */}
        {activeSubTab === 'wallet' && (
          <DashboardWallet
            user={user}
            setShowTopUp={setShowTopUp}
            walletTransactions={walletTransactions}
            coinBalance={coinBalance}
            onWithdraw={onWithdraw}
          />
        )}

        {/* Announcements Sub-tab — existing campaign status list (unchanged) */}
        {activeSubTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Campaign Status</h3>
              <span className="badge" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                {campaigns.length} Active
              </span>
            </div>
            
            <div className="responsive-stack">
              {campaigns.map(camp => {
                const isExpanded = expandedCamp === camp._id;
                const campApps = applications[camp._id] || [];
                
                return (
                  <div key={camp._id} className="accordion-item" style={{ overflow: 'hidden' }}>
                    <div
                      className="status-card"
                      style={{
                        background: 'var(--surface)',
                        padding: '1.5rem',
                        borderRadius: isExpanded ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>{camp.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: isExpanded ? 'var(--accent)' : 'var(--text-muted)' }}>
                          { (camp.endDate && new Date(camp.endDate) < new Date()) 
                            ? (camp.applicants?.length > 0 ? `Expired (${camp.applicants.length} Applications)` : 'Expired')
                            : `${camp.applicants?.length || 0} Applications` 
                          }
                        </span>
                      </div>
                      <button
                        className={`btn-icon-modern ${isExpanded ? 'active' : ''}`}
                        onClick={() => toggleExpand(camp._id)}
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <div className={`accordion-wrapper ${isExpanded ? 'expanded' : ''}`}>
                      <div className="accordion-inner">
                        <div className="accordion-content" style={{ 
                          background: 'var(--surface-alt)', 
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                          padding: '1rem',
                        }}>
                          {loadingApps && !applications[camp._id] ? (
                            <div style={{ padding: '1rem', textAlign: 'center' }}><div className="spinner sm" /></div>
                          ) : campApps.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              No applications yet
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {campApps.map(app => (
                                <div key={app._id} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  background: 'var(--surface)',
                                  padding: '0.75rem 1rem',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-light)'
                                }}>
                                  <div 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                    onClick={() => {
                                      if (onViewProfile && app.influencerId?._id) {
                                        onViewProfile(app.influencerId._id);
                                      }
                                    }}
                                  >
                                    <div style={{ 
                                      width: '36px', 
                                      height: '36px', 
                                      borderRadius: '50%', 
                                      overflow: 'hidden',
                                      background: 'var(--accent-gradient)'
                                    }}>
                                      {app.influencerId?.avatar ? (
                                        <img src={resolveAssetUrl(app.influencerId.avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                          {app.influencerId?.name?.[0] || 'I'}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{app.influencerId?.name}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{app.status}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      className="btn-icon sm"
                                      onClick={() => setViewingApplication(app)}
                                      style={{ color: 'var(--accent)', background: 'rgba(255, 165, 0, 0.12)' }}
                                      title="View application"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    {app.status === 'pending' && (
                                      <>
                                        <button 
                                          className="btn-icon sm" 
                                          onClick={() => handleAction(app._id, 'accept', camp._id)}
                                          style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}
                                          title="Approve"
                                        >
                                          <Check size={18} />
                                        </button>
                                        <button 
                                          className="btn-icon sm" 
                                          onClick={() => handleAction(app._id, 'reject', camp._id)}
                                          style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                                          title="Reject"
                                        >
                                          <XCircle size={18} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {campaigns.length === 0 && (
                <div className="empty-state">
                  <div style={{ fontSize: 48, opacity: 0.5, marginBottom: '1rem' }}>📋</div>
                  <p>No campaigns yet. Create your first campaign!</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      {viewingApplication && (
        <div className="modal-overlay" onClick={() => setViewingApplication(null)}>
          <div
            className="modal glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: 'calc(100vw - 32px)',
              padding: '1.5rem',
              borderRadius: '24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <button className="modal-close" onClick={() => setViewingApplication(null)} aria-label="Close">
              <X size={18} />
            </button>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem', cursor: 'pointer' }}
              onClick={() => {
                if (onViewProfile && viewingApplication?.influencerId?._id) {
                  onViewProfile(viewingApplication.influencerId._id);
                }
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
              }}>
                {viewingApplication.influencerId?.avatar ? (
                  <img
                    src={resolveAssetUrl(viewingApplication.influencerId.avatar)}
                    alt={viewingApplication.influencerId?.name || 'Influencer'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  viewingApplication.influencerId?.name?.[0] || 'I'
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{viewingApplication.influencerId?.name || 'Influencer'}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {viewingApplication.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <section style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Selected Outlet
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewingApplication.selectedOutlet || 'No outlet selected'}
                </div>
              </section>

              <section style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Creator comment
                </div>
                <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {viewingApplication.coverLetter || 'No comment provided.'}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
