import React from 'react';
import { Box, Typography } from '@mui/material';
import { AreaChart, Area } from 'recharts';

const OverviewStats = ({ stats, kpis, handleCardClick, sparkData }) => {
  return (
    <>
      <div 
        className="revenue-card glass-panel" 
        onClick={() => handleCardClick({ target: 'analytics' })}
        style={{ marginBottom: '1.5rem', overflow: 'hidden', cursor: 'pointer', }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Platform Revenue</div>
            <div className="stat-value" style={{ color: 'var(--text-on-gradient)', fontSize: '2.5rem', fontWeight: 800 }}>
              ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <span className="stat-change" style={{ background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', color: 'var(--accent-light)', fontSize: '0.8125rem', fontWeight: 600 }}>
              ↑ {Number(stats?.monthlyGrowth) || 0}% this month
            </span>
          </div>
          
          <Box sx={{ width: { xs: 170, sm: 240 }, height: 100, opacity: 0.4, flex: '0 0 auto', overflow: 'hidden' }}>
            <AreaChart width={240} height={100} data={sparkData}>
              <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.2)" strokeWidth={3} />
            </AreaChart>
          </Box>
        </Box>
      </div>

      <div className="admin-stats-grid">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="admin-stat-card glass-panel" 
            onClick={() => handleCardClick(kpi)}
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          >
            <div className="admin-stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="admin-stat-icon" style={{ background: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
              <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.7rem' }}>
                +100%
              </Typography>
            </div>
            <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '10px 0 4px' }}>{kpi.value}</div>
            <div className="admin-stat-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OverviewStats;
