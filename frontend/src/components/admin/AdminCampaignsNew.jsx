import React, { useState } from 'react';
import { Check, Ban } from 'lucide-react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import adminService from '../../services/admin.service';

export default function AdminCampaignsNew({ 
  campaigns = [], 
  campaignFilter = { search: '', category: '', status: '' },
  setCampaignFilter = () => {},
  setCampaignCostModal,
  onCampaignBlocked = () => {}
}) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [blockedCampaigns, setBlockedCampaigns] = useState({});
  const [blockingCampaign, setBlockingCampaign] = useState(null);
  const [blockReason, setBlockReason] = useState('Not meeting community standards');

  const truncate = (text, length = 30) => {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleBlockCampaign = async () => {
    if (!blockingCampaign) return;
    try {
      await adminService.blockCampaign(blockingCampaign._id, blockReason);
      setBlockedCampaigns({...blockedCampaigns, [blockingCampaign._id]: true});
      setBlockingCampaign(null);
      onCampaignBlocked();
    } catch (error) {
      console.error('Error blocking campaign:', error);
      alert('Failed to block campaign: ' + error.message);
    }
  };

  const handleUnblockCampaign = async (campaignId) => {
    try {
      await adminService.unblockCampaign(campaignId);
      setBlockedCampaigns({...blockedCampaigns, [campaignId]: false});
      onCampaignBlocked();
    } catch (error) {
      console.error('Error unblocking campaign:', error);
      alert('Failed to unblock campaign');
    }
  };

  const fetchApplications = async (campaignId) => {
    try {
      setAppsLoading(true);
      const res = await adminService.getAdminCampaignApplications(campaignId);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    fetchApplications(campaign._id);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* KPI Section */}
      <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>📢</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL CAMPAIGNS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{campaigns.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🚀</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ACTIVE NOW</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {campaigns.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>👥</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL APPLICATIONS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {campaigns.reduce((sum, c) => sum + (c.applicationsCount || 0), 0)}
          </div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.05), transparent)' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(24, 119, 242, 0.1)', color: 'var(--primary)' }}>💰</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ALLOCATED BUDGET</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            ₹{campaigns.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="admin-section-filters" style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search Campaigns</label>
          <input 
            className="input" 
            placeholder="Search by title or brand..." 
            value={campaignFilter.search}
            onChange={e => setCampaignFilter({ ...campaignFilter, search: e.target.value })}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
          <select 
            className="select"
            value={campaignFilter.category}
            onChange={e => setCampaignFilter({ ...campaignFilter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Fashion">Fashion</option>
            <option value="Technology">Technology</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ minWidth: '180px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
          <select 
            className="select"
            value={campaignFilter.status}
            onChange={e => setCampaignFilter({ ...campaignFilter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCampaign(null)}>✕</button>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h2 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>{selectedCampaign.title}</h2>
                <span className="badge badge-primary" style={{ marginBottom: '1.5rem' }}>{selectedCampaign.category}</span>
                
                <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedCampaign.content || selectedCampaign.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand</h4>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedCampaign.author?.name}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</h4>
                    <p style={{ fontSize: '0.875rem' }}>{formatDate(selectedCampaign.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div style={{ flex: '1 1 300px', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Applied Influencers</h3>
                {appsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : applications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No applications yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {applications.map(app => (
                      <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '12px' }}>
                        <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                          {app.influencerId?.profilePicture ? <img src={app.influencerId.profilePicture} alt="" /> : app.influencerId?.name?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{app.influencerId?.name || 'Unknown Influencer'}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Followers: {Array.isArray(app.influencerId?.followers) ? app.influencerId.followers.length : (app.influencerId?.followers || 0)}</p>
                        </div>
                        <div className={`badge badge-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`} style={{ fontSize: '0.7rem' }}>
                          {app.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <LiquidButton variant="secondary" onClick={() => setSelectedCampaign(null)}>Close Details</LiquidButton>
            </div>
          </div>
        </div>
      )}

      {blockingCampaign && (
        <div className="modal-overlay" onClick={() => setBlockingCampaign(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBlockingCampaign(null)}>✕</button>
            <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Block Campaign</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              by {blockingCampaign.author?.name}
            </p>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Reason for blocking</label>
              <textarea 
                className="input" 
                rows="3"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Not meeting community standards..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <LiquidButton type="button" variant="secondary" onClick={() => setBlockingCampaign(null)} style={{ flex: 1 }}>Cancel</LiquidButton>
              <LiquidButton type="button" variant="error" onClick={handleBlockCampaign} style={{ flex: 1 }}>Block Campaign</LiquidButton>
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, opacity: 0.5 }}>📢</div>
          <p>No campaigns found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table className="table" style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Brand</th>
                <th style={{ minWidth: '140px' }}>Title</th>
                <th style={{ minWidth: '140px' }}>Content</th>
                <th style={{ minWidth: '100px' }}>Category</th>
                <th style={{ minWidth: '80px' }}>Date</th>
                <th style={{ minWidth: '70px' }}>Fee</th>
                <th style={{ minWidth: '80px' }}>Status</th>
                <th style={{ minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => {
                const isBlocked = campaign.blocked || blockedCampaigns[campaign._id];
                return (
                  <tr 
                    key={campaign._id} 
                    style={{ opacity: isBlocked ? 0.6 : 1, cursor: 'pointer' }}
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <td title={campaign.author?.name || campaign.brandName || '-'}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {truncate(campaign.author?.name || campaign.brandName || '-', 15)}
                      </span>
                    </td>
                    <td title={campaign.title}>
                      <span style={{ fontSize: '0.875rem' }}>
                        {truncate(campaign.title, 18)}
                      </span>
                    </td>
                    <td title={campaign.description || campaign.content}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {truncate(campaign.description || campaign.content, 20)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {truncate(campaign.category || 'General', 10)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(campaign.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge badge-accent"
                        style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampaignCostModal({ 
                            id: campaign._id, 
                            title: campaign.title || 'Campaign',
                            type: 'campaign',
                            cost: Number(campaign.coinCost) || 0 
                          });
                        }}
                        title="Click to edit fee"
                      >
                        {Number(campaign.coinCost || 0).toLocaleString('en-IN')} ✎
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                        {isBlocked ? '🚫' : '✓'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      {isBlocked ? (
                        <LiquidButton 
                          circular 
                          variant="success" 
                          onClick={(e) => { e.stopPropagation(); handleUnblockCampaign(campaign._id); }}
                          title="Unblock campaign"
                        >
                          <Check size={18} />
                        </LiquidButton>
                      ) : (
                        <LiquidButton 
                          circular 
                          variant="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlockReason('Not meeting community standards');
                            setBlockingCampaign(campaign);
                          }}
                          title="Block campaign"
                        >
                          <Ban size={18} />
                        </LiquidButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}
