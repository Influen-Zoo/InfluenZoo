import React from 'react';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

const CampaignDetailsModal = ({ selectedCampaign, onClose, applications, appsLoading }) => {
  if (!selectedCampaign) return null;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '800px', width: isMobile ? 'calc(100vw - 16px)' : '90%' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div style={{ display: 'flex', gap: isMobile ? '1rem' : '2rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>{selectedCampaign.title}</h2>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>{selectedCampaign.category}</span>

            <div style={{ background: 'var(--surface-alt)', padding: isMobile ? '1rem' : '1.5rem', borderRadius: '16px', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedCampaign.content || selectedCampaign.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={statStyle}>
                <span style={labelStyle}>Likes</span>
                <span style={valueStyle}>❤ {selectedCampaign.likesCount ?? (Array.isArray(selectedCampaign.likes) ? selectedCampaign.likes.length : 0)}</span>
              </div>
              <div style={statStyle}>
                <span style={labelStyle}>Comments</span>
                <span style={valueStyle}>💬 {selectedCampaign.commentsCount ?? (Array.isArray(selectedCampaign.comments) ? selectedCampaign.comments.length : 0)}</span>
              </div>
              <div style={statStyle}>
                <span style={labelStyle}>Applicants</span>
                <span style={valueStyle}>🤝 {selectedCampaign.applicantsCount ?? (selectedCampaign.applicants?.length || 0)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <h4 style={labelStyle}>Brand</h4>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedCampaign.author?.name}</p>
              </div>
              <div>
                <h4 style={labelStyle}>Created On</h4>
                <p style={{ fontSize: '0.875rem' }}>{formatDate(selectedCampaign.createdAt)}</p>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 300px', borderLeft: isMobile ? 'none' : '1px solid var(--border)', borderTop: isMobile ? '1px solid var(--border)' : 'none', paddingLeft: isMobile ? 0 : '1rem', paddingTop: isMobile ? '1rem' : 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Applied Influencers</h3>
            {appsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : applications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No applications yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: isMobile ? '280px' : '400px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {applications.map((app) => (
                  <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '14px' }}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>
                      {app.influencerId?.profilePicture ? <img src={app.influencerId.profilePicture} alt="" /> : app.influencerId?.name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
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

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <LiquidButton variant="secondary" onClick={onClose}>Close Details</LiquidButton>
        </div>
      </div>
    </div>
  );
};

const statStyle = {
  padding: '0.9rem',
  background: 'var(--surface-alt)',
  borderRadius: '14px'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--text-muted)'
};

const valueStyle = {
  fontSize: '1.05rem',
  fontWeight: 800
};

export default CampaignDetailsModal;
