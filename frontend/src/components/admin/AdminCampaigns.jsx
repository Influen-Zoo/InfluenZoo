import React from 'react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function AdminCampaigns({ 
  filteredCampaigns, 
  campaignFilter, 
  setCampaignFilter, 
  handleToggleFeatured, 
  handleCampaignStatus, 
  setCampaignCostModal 
}) {
  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {['All', 'Pending', 'Active', 'Rejected'].map(s => (
          <div 
            key={s} 
            className={`tab ${campaignFilter === (s === 'All' ? '' : s.toLowerCase()) ? 'active' : (!campaignFilter && s === 'All') ? 'active' : ''}`}
            onClick={() => setCampaignFilter(s === 'All' ? '' : s.toLowerCase())}
          >
            {s}
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, opacity: 0.5 }}>📢</div>
          <p>No campaigns found</p>
        </div>
      ) : filteredCampaigns.map(c => (
        <div key={c.id} className="moderation-card">
          <div className="moderation-header">
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>{c.title}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                by {c.brandName} · {c.category} · ₹{(Number(c.budget) || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className={`featured-star ${c.featured ? 'active' : ''}`} 
                onClick={() => handleToggleFeatured(c.id)} 
                title="Toggle Featured"
              >
                ★
              </button>
              <span className={`badge badge-${c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}`}>
                {c.status}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', margin: '0.75rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.description}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
            {c.platform?.map(p => <span key={p} className="badge badge-primary">{p}</span>)}
            <span className={`badge ${c.type === 'paid' ? 'badge-paid' : 'badge-free'}`}>{c.type}</span>
            <span 
              className="badge badge-accent" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setCampaignCostModal({ campaignId: c.id, cost: Number(c.coinCost) || 0 })}
            >
              Fee: {Number(c.coinCost).toLocaleString('en-IN') || 0} 🪙 ✎
            </span>
          </div>
          {c.status === 'pending' && (
            <div className="moderation-actions">
              <LiquidButton variant="success" onClick={() => handleCampaignStatus(c.id, 'active')}>✓ Approve</LiquidButton>
              <LiquidButton variant="error" onClick={() => handleCampaignStatus(c.id, 'rejected')}>✕ Reject</LiquidButton>
            </div>
          )}
          {c.status === 'active' && (
            <div className="moderation-actions">
              <LiquidButton variant="secondary" onClick={() => handleCampaignStatus(c.id, 'paused')}>⏸ Pause</LiquidButton>
            </div>
          )}
        </div>
      ))}
    </Box>
  );
}
