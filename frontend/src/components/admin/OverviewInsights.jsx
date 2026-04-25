import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const OverviewInsights = ({ stats, handleCardClick }) => {
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12} md={7}>
        <div className="chart-card" style={{ height: '100%' }}>
          <div className="chart-header">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>🔍 Platform Health Insights</Typography>
          </div>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Box sx={{ p: 2, borderRadius: 2, background: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>Active Engagement Rate</Typography>
                <Typography variant="h5" sx={{ color: 'var(--primary)', fontWeight: 800 }}>{stats?.avgEngagementRate || 0}%</Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Aggregate across all campaigns and posts to date</Typography>
             </Box>
             <Box sx={{ p: 2, borderRadius: 2, background: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>Brand Retention</Typography>
                <Typography variant="h5" sx={{ color: 'var(--success)', fontWeight: 800 }}>{stats?.brandRetention || 0}%</Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Brands that launched more than 1 campaign</Typography>
             </Box>
          </Box>
        </div>
      </Grid>
      <Grid item xs={12} md={5}>
        <div className="chart-card">
          <div className="chart-header"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>⏳ Pending Actions</Typography></div>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', mt: 1 }}>
            <Box 
              onClick={() => handleCardClick({ target: 'disputes' })}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>⚖️ Open disputes</span>
              <span className="badge badge-danger">{Number(stats?.openDisputes) || 0}</span>
            </Box>
            <Box 
              onClick={() => handleCardClick({ target: 'campaigns' })}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>📩 Total applications</span>
              <span className="badge badge-info">{Number(stats?.totalApplications) || 0}</span>
            </Box>
          </Box>
        </div>
      </Grid>
    </Grid>
  );
};

export default OverviewInsights;
