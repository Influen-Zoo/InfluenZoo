import React from 'react';
import { Box } from '@mui/material';
import OverviewStats from './OverviewStats';
import OverviewInsights from './OverviewInsights';

export default function AdminOverview({ stats, onNavigate, setUserFilter }) {
  const kpis = [
    { icon: '👥', value: Number(stats?.totalUsers || 0).toLocaleString('en-IN'), label: 'Total Users', bg: 'var(--info-bg)', color: 'var(--info)', target: 'users', filter: { role: '' } },
    { icon: '🎨', value: Number(stats?.totalInfluencers || 0).toLocaleString('en-IN'), label: 'Influencers', bg: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', target: 'users', filter: { role: 'influencer' } },
    { icon: '🏢', value: Number(stats?.totalBrands || 0).toLocaleString('en-IN'), label: 'Brands', bg: 'var(--warning-bg)', color: 'var(--warning)', target: 'users', filter: { role: 'brand' } },
    { icon: '📢', value: Number(stats?.activeCampaigns || 0).toLocaleString('en-IN'), label: 'Active Campaigns', bg: 'var(--success-bg)', color: 'var(--success)', target: 'campaigns' },
    { icon: '📸', value: Number(stats?.totalPosts || 0).toLocaleString('en-IN'), label: 'Total Posts', bg: 'var(--primary-bg)', color: 'var(--primary)', target: 'posts' },
    { icon: '❤️', value: Number(stats?.totalEngagement || 0).toLocaleString('en-IN'), label: 'Total Engagement', bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', target: 'analytics' },
    { icon: '🌍', value: Number(stats?.totalReach || 0).toLocaleString('en-IN'), label: 'Total Reach', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', target: 'analytics' },
    { icon: '⚡', value: Number(stats?.activeUsers30d || 0).toLocaleString('en-IN'), label: 'Active Users', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', target: 'users' },
    { icon: '📈', value: `${stats?.avgEngagementRate || 0}%`, label: 'Avg. Engagement', bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', target: 'analytics' },
    { icon: '💸', value: `₹${Number(stats?.totalCapitalFlow || 0).toLocaleString('en-IN')}`, label: 'Capital Flow', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', target: 'analytics' },
    { icon: '🪙', value: Number(stats?.totalCoinsCirculation || 0).toLocaleString('en-IN'), label: 'Coins in Circulation', bg: 'var(--warning-bg)', color: 'var(--warning)', target: 'withdrawals' },
    { icon: '💎', value: `₹${Number(stats?.totalCoinRevenue || 0).toLocaleString('en-IN')}`, label: 'Coin Sales Revenue', bg: 'var(--success-bg)', color: 'var(--success)', target: 'analytics' },
  ];

  const handleCardClick = (kpi) => {
    if (!onNavigate) return;
    if (kpi.target === 'users' && kpi.filter && setUserFilter) {
      setUserFilter(prev => ({ ...prev, ...kpi.filter }));
    }
    onNavigate(kpi.target);
  };

  const sparkData = [
    { v: 400 }, { v: 300 }, { v: 200 }, { v: 278 }, { v: 189 }, { v: 239 }, { v: 349 },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      <OverviewStats 
        stats={stats} 
        kpis={kpis} 
        handleCardClick={handleCardClick} 
        sparkData={sparkData} 
      />
      
      <OverviewInsights 
        stats={stats} 
        handleCardClick={handleCardClick} 
      />
    </Box>
  );
}
