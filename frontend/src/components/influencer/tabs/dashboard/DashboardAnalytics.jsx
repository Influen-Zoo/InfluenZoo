import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Divider, Paper, Skeleton } from '@mui/material';
import api from '../../../../services/api';
import { getChartDataForMetric, getYAxisMaxLabel } from '../../../../features/influencer/analyticsProcessor';

import AnalyticsSummaryCards from './analytics/AnalyticsSummaryCards';
import AnalyticsTrendChart   from './analytics/AnalyticsTrendChart';
import AnalyticsInsights     from './analytics/AnalyticsInsights';
import AnalyticsBreakdown    from './analytics/AnalyticsBreakdown';
import AnalyticsContent      from './AnalyticsContent';

// Time filters: label → backend timeframe param
const TIMEFRAMES = [
  { label: '28 days', value: '28' },
  { label: '7 days',  value: '7'  },
  { label: 'Today',   value: 'today' },
];

const METRIC_TITLES = {
  views:      'Total views',
  earnings:   'Total earnings',
  engagement: 'Engagement',
  followers:  'Net followers',
};

const formatViewerCount = (count) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

export default function DashboardAnalytics({ user }) {
  const [timeframe,       setTimeframe]       = useState('28');
  const [selectedMetric,  setSelectedMetric]  = useState('views');
  const [analytics,       setAnalytics]       = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInfluencerDashboardAnalytics(timeframe);
      setAnalytics(data);
    } catch (e) {
      console.error('Analytics load error', e);
      setError('Unable to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // Derive chart data for the selected metric
  const chartData = getChartDataForMetric(analytics, selectedMetric);

  return (
    <Box className="dashboard-analytics-container" sx={{ animation: 'fadeIn 0.3s ease', pb: 6 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: 'var(--text-primary, #1c1e21)', mb: 0.25 }}
        >
          Analytics
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--text-muted, #8a8d91)' }}>
          {timeframe === 'today' ? 'Today' : `Last ${timeframe} days`}
        </Typography>
      </Box>

      {/* ── Time Filter ─────────────────────────────────────────────────── */}
      <ToggleButtonGroup
        value={timeframe}
        exclusive
        onChange={(_, val) => val && setTimeframe(val)}
        size="small"
        sx={{
          mb: 2.5,
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.82rem',
            px: 2,
            py: 0.5,
            color: 'var(--text-secondary, #65676b)',
            border: 'none',
            borderRadius: '2rem !important',
            '&.Mui-selected': {
              background: 'var(--primary-light, rgba(24,119,242,0.1))',
              color: 'var(--primary, #1877f2)',
              fontWeight: 700,
            },
          },
        }}
      >
        {TIMEFRAMES.map(tf => (
          <ToggleButton key={tf.value} value={tf.value}>{tf.label}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* ── Error State ─────────────────────────────────────────────────── */}
      {error && (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: 'rgba(250,77,86,0.08)', border: '1px solid rgba(250,77,86,0.2)', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#e02020' }}>{error}</Typography>
        </Paper>
      )}

      {/* ── Summary KPI Cards ────────────────────────────────────────────── */}
      <AnalyticsSummaryCards
        totals={analytics?.totals}
        trends={analytics?.trends}
        selected={selectedMetric}
        onSelect={setSelectedMetric}
        loading={loading}
      />

      {/* ── Trend Chart Section ──────────────────────────────────────────── */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {METRIC_TITLES[selectedMetric]}
          </Typography>
          <Typography component="span" sx={{ color: 'var(--text-muted)', fontSize: '1rem', cursor: 'help' }} title="Tracks changes over time">ⓘ</Typography>
        </Box>

        <Paper className="glass-panel" elevation={0} sx={{ p: 2 }}>
          {/* Y-max label */}
          {!loading && chartData.length > 0 && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', mb: 0.5 }}>
              {getYAxisMaxLabel(chartData)}
            </Typography>
          )}

          <AnalyticsTrendChart
            data={chartData}
            metric={selectedMetric}
            loading={loading}
          />
        </Paper>
      </Box>

      {/* ── Recent Earnings Sources ────────────────────────────────────────── */}
      {selectedMetric === 'earnings' && !loading && (analytics?.earningsSources?.length > 0) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'var(--text-primary)' }}>
            Earnings Sources
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {analytics.earningsSources.map((source) => (
              <Paper key={source.id}
                 className="glass-panel" elevation={0} sx={{ p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {source.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    {source.category} • {new Date(source.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#18a340' }}>
                  +₹{new Intl.NumberFormat('en-IN').format(source.amount)}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Viewers count for views metric ──────────────────────────────── */}
      {selectedMetric === 'views' && !loading && analytics?.totals && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>Viewers</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatViewerCount(analytics.insights?.totalViewers ?? 0)}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'var(--border-light)' }} />
        </>
      )}

      {/* ── Breakdown Charts ─────────────────────────────────────────────── */}
      <AnalyticsBreakdown
        breakdown={analytics?.breakdown}
        totals={analytics?.totals}
        selectedMetric={selectedMetric}
        loading={loading}
      />

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <Divider sx={{ my: 4, borderColor: 'var(--border-light)' }} />

      {/* ── Content Section with Posts ───────────────────────────────────── */}
      <AnalyticsContent 
        user={user} 
        selectedTab={selectedMetric}
      />

    </Box>
  );
}

