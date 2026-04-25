import React from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { getDonutSegments, getInteractionSegments } from '../../../../../features/influencer/analyticsProcessor';

// Local Donut Chart component for breakdown
const DonutChart = ({ segments, loading }) => {
  if (loading) return <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto' }} />;
  
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let offset = 0;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      <svg width={size} height={size}>
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-currentOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          );
        })}
      </svg>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 140 }}>
        {segments.map((s, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {s.label} ({s.pct}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default function AnalyticsBreakdown({ breakdown, totals, selectedMetric, loading }) {
  const currentDonut = getDonutSegments(breakdown, totals, selectedMetric);

  // If selecting engagement, let's show interaction-specific breakdown
  const interactionSegments = selectedMetric === 'engagement' 
    ? getInteractionSegments(breakdown, totals)
    : null;

  const finalDonut = (interactionSegments && interactionSegments.length > 0) ? interactionSegments : currentDonut;

  const sectionTitle = {
    views:      'Views breakdown',
    engagement: 'Engagement breakdown',
    followers:  'Followers breakdown',
    earnings:   'Earnings breakdown',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* section header */}
      <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', mt: 1 }}>
        {sectionTitle[selectedMetric] ?? 'Breakdown'}
      </Typography>

      {/* Row 1: Main Donut Breakdown - FULL WIDTH */}
      <Paper className="glass-panel" elevation={0} sx={{
          p: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
          {selectedMetric === 'followers' ? 'Growth type' : selectedMetric === 'earnings' ? 'Revenue source' : 'Viewer type'}
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <DonutChart segments={finalDonut} loading={loading} />
        </Box>
      </Paper>

      {/* Row 2: Detailed List Breakdown - FULL WIDTH */}
      {(selectedMetric === 'views' || selectedMetric === 'engagement') && !loading && (
        <Paper className="glass-panel" elevation={0} sx={{
            p: 4,
            width: '100%',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)' }}>
            {selectedMetric === 'views' ? 'Platform breakdown' : 'Interaction type'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {((selectedMetric === 'views' ? breakdown?.mediaType : breakdown?.engagement) || []).map((item, i) => {
              const label = item.name || item.type;
              const val = item.views ?? item.value;
              const total = selectedMetric === 'views' ? totals?.views : totals?.engagement;
              const pct = total > 0 ? Math.min(100, Math.round((val / total) * 100)) : 0;
              const color = ['#1877f2', '#1d3461', '#3da1f7', '#aed6f1'][i % 4];

              return (
                <Box key={i} sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{label}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            {pct}% of total {selectedMetric}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {new Intl.NumberFormat('en-IN').format(val)}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box 
                        sx={{ 
                            height: '100%', 
                            width: `${pct}%`, 
                            bgcolor: color, 
                            borderRadius: 5, 
                            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 10px ${color}80`
                        }} 
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

