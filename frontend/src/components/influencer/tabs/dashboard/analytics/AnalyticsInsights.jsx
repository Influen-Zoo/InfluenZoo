import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  InfoOutlined as InfoOutlinedIcon 
} from '@mui/icons-material';

const metricLabels = {
  views: 'views',
  engagement: 'engagement',
  followers: 'followers',
  earnings: 'earnings',
};

export default function AnalyticsInsights({ insights, selectedMetric, totals, loading }) {
  if (loading) {
    return <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />;
  }

  const multiplier = insights?.topPostMultiplier ?? 0;
  const totalViewers = insights?.totalViewers ?? 0;
  const label = metricLabels[selectedMetric] || selectedMetric;

  const messages = {
    views: multiplier > 1
      ? `Your recent post got ${multiplier}x more views than your usual posts.`
      : `Your views are steady. Keep posting consistently to grow your reach.`,
    engagement: multiplier > 1
      ? `Your top post earned ${multiplier}x more engagement than average.`
      : `Engage your audience with polls, questions, and stories to boost interaction.`,
    followers: totals?.netFollowers > 0
      ? `You have ${totals.netFollowers} followers. Keep growing by posting quality content.`
      : `Start building your audience by posting consistently and tagging relevant content.`,
    earnings: `Approximate earnings are calculated based on campaign payouts. Complete more campaigns to see earnings grow.`,
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* Viewers count row */}
      {selectedMetric === 'views' && totalViewers > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary, #65676b)', fontWeight: 500 }}>
            Viewers
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary, #1c1e21)' }}>
            {totalViewers >= 1000 ? (totalViewers / 1000).toFixed(1) + 'K' : totalViewers}
          </Typography>
        </Box>
      )}

      {/* Insight card */}
      <Paper
        className="glass-indicator"
        elevation={0}
        sx={{
          p: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          border: '1.5px solid rgba(255, 255, 255, 0.1) !important',
          }}
      >
        <TrendingUpIcon sx={{ color: 'var(--success, #18a340)', fontSize: 20, mt: 0.1, flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(24, 163, 64, 0.3))' }} />
        <Typography variant="body2" sx={{ color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
          {messages[selectedMetric] || messages.views}
        </Typography>
      </Paper>
    </Box>
  );
}
