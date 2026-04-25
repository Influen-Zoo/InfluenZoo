import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup,
  Divider, Paper, Skeleton, Card, CardContent, Chip
} from '@mui/material';
import {
  CampaignOutlined as CampaignIcon,
  PlayCircleOutlineOutlined as ActiveIcon,
  CheckCircleOutlineOutlined as CompletedIcon,
  PeopleOutlined as ReachIcon,
  TrendingUp as TrendingUpIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import api from '../../../../services/api';
import { getBrandChartData, getYAxisMaxLabel, mapDonutSegments, calculatePercentage, getCategoryRelativePct } from '../../../../features/brand/analyticsProcessor';
// Reuse the shared chart components from influencer (no modification needed)
import AnalyticsTrendChart from '../../../influencer/tabs/dashboard/analytics/AnalyticsTrendChart';
import BrandCampaignsContent from './BrandCampaignsContent';

// ── Time filter config ─────────────────────────────────────────────────────
const TIMEFRAMES = [
  { label: '28 days', value: '28' },
  { label: '7 days',  value: '7'  },
  { label: 'Today',   value: 'today' },
];

// ── Metric config ──────────────────────────────────────────────────────────
const METRICS = [
  { id: 'totalCapitalFlow', label: 'Total Capital Flow', icon: CampaignIcon,   color: '#18a340', isCurrency: true },
  { id: 'platformRevenue',  label: 'Platform Revenue',   icon: CampaignIcon,   color: '#1877f2', isCurrency: true },
  { id: 'total',           label: 'Total Campaigns',     icon: CampaignIcon,   color: '#7b2d8b' },
  { id: 'active',          label: 'Active Campaigns',    icon: ActiveIcon,     color: '#f7b731' },
];

const METRIC_TITLES = {
  totalCapitalFlow: 'Capital flow from campaigns',
  platformRevenue:  'Platform revenue (estimated)',
  total:           'Total campaigns over time',
  active:          'Active campaigns over time',
  engagement:      'Engagement over time',
  reach:           'Total followers over time',
};

// ── Local Donut Chart (identical pattern to influencer AnalyticsBreakdown) ─
const DonutChart = ({ segments }) => {
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!segments || segments.length === 0) {
    return (
      <Box sx={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No data
      </Box>
    );
  }

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
              cx={size / 2} cy={size / 2} r={radius}
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function BrandDashboardAnalytics() {
  const [timeframe,      setTimeframe]      = useState('28');
  const [selectedMetric, setSelectedMetric] = useState('total');
  const [analytics,      setAnalytics]      = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBrandDashboardAnalytics(timeframe);
      setAnalytics(data);
    } catch (e) {
      console.error('Brand analytics load error', e);
      setError('Unable to load campaign analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // Chart data for selected metric
  const chartData = getBrandChartData(analytics, selectedMetric);

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease', pb: 6 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-primary, #1c1e21)', mb: 0.25 }}>
          Campaign Analytics
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
            px: 2, py: 0.5,
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

      {/* ── KPI Summary Cards (2×2 grid, identical to influencer) ────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
        {METRICS.map(metric => {
          const IconComp = metric.icon;
          const value    = analytics?.totals?.[metric.id] ?? 0;
          const trend    = analytics?.trends?.[metric.id]  ?? 0;
          const isSelected = selectedMetric === metric.id;
          const isUp    = trend > 0;
          const isFlat  = trend === 0;

          return (
            <Card
              key={metric.id}
              className="glass-panel"
              onClick={() => setSelectedMetric(metric.id)}
              elevation={0}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: isSelected ? `1.5px solid ${metric.color} !important` : undefined,
                background: isSelected ? 'rgba(255, 255, 255, 0.05) !important' : undefined,
                boxShadow: isSelected
                  ? `0 0 0 1px ${metric.color} inset, 0 12px 32px ${metric.color}20 !important`
                  : undefined,
                '&:hover': { 
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4) !important'
                },
              }}
            >
              <CardContent sx={{ p: '1rem !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: isSelected ? metric.color : 'var(--text-secondary, #65676b)' }}>
                  <IconComp sx={{ fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.82rem', color: 'var(--text-secondary, #65676b)' }}>
                    {metric.label}
                  </Typography>
                </Box>

                {loading ? (
                  <Skeleton width={80} height={32} />
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.35rem', color: 'var(--text-primary, #1c1e21)', lineHeight: 1 }}>
                    {metric.isCurrency && '₹'}
                    {new Intl.NumberFormat('en-IN').format(value)}
                  </Typography>
                )}

                {!loading && (
                  <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isFlat ? (
                      <Typography variant="caption" sx={{ color: 'var(--text-muted, #8a8d91)' }}>--</Typography>
                    ) : (
                      <Chip
                        icon={isUp ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} /> : <TrendingFlatIcon sx={{ fontSize: '14px !important', transform: 'rotate(180deg)' }} />}
                        label={`${isUp ? '+' : ''}${trend}%`}
                        size="small"
                        className="glass-indicator"
                        sx={{
                          height: 22, fontSize: '0.7rem', fontWeight: 700,
                          background: isUp ? 'rgba(36,191,68,0.15) !important' : 'rgba(250,77,86,0.15) !important',
                          color: isUp ? '#22c55e !important' : '#ef4444 !important',
                          border: 'none',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* ── Trend Chart ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {METRIC_TITLES[selectedMetric]}
          </Typography>
          <Typography component="span" sx={{ color: 'var(--text-muted)', fontSize: '1rem', cursor: 'help' }} title="Tracks changes over time">ⓘ</Typography>
        </Box>

        <Paper className="glass-panel" elevation={0} sx={{ p: 2 }}>
          {!loading && chartData.length > 0 && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', mb: 0.5 }}>
              {getYAxisMaxLabel(chartData)}
            </Typography>
          )}
          <AnalyticsTrendChart data={chartData} metric={selectedMetric} loading={loading} />
        </Paper>
      </Box>

      {/* ── Top Campaigns — only for 'reach' metric ──────────────────────── */}
      {selectedMetric === 'reach' && !loading && analytics?.topCampaigns?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'var(--text-primary)' }}>
            Top Campaigns by Followers
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {analytics.topCampaigns.map(c => (
              <Paper
                key={c.id}
                className="glass-panel"
                elevation={0}
                sx={{
                  p: 1.5,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    {c.category} • {c.status}
                  </Typography>
                </Box>
                <Chip
                  label={`${c.applications} applied`}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: '0.72rem',
                    background: 'rgba(24,119,242,0.1)',
                    color: '#1877f2',
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Reach / Followers count row for 'reach' metric ────────────────── */}
      {selectedMetric === 'reach' && !loading && analytics?.totals && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Applicants</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Intl.NumberFormat('en-IN').format(analytics.totals.reach)}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'var(--border-light)' }} />
        </>
      )}

      {/* ── Engagement Detail — only for 'engagement' metric ────────────── */}
      {selectedMetric === 'engagement' && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', mt: 1 }}>
            Engagement breakdown
          </Typography>

          {/* Donut — named 'Viewer type' to match influencer panel behavior */}
          <Paper className="glass-panel" elevation={0} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
              Viewer type
            </Typography>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <DonutChart segments={mapDonutSegments(
                analytics?.engagementBreakdown?.engagement?.filter(e => e.pct > 0),
                0 // totalValue ignored if data has pcts
              ).length > 0 ? mapDonutSegments(analytics?.engagementBreakdown?.engagement?.filter(e => e.pct > 0)) : [
                { label: 'Likes',    pct: 50, color: '#1877f2' },
                { label: 'Comments', pct: 50, color: '#1d3461' },
              ]} />
            </Box>
          </Paper>

          {/* Interaction bars — Likes / Comments / Shares / Saves */}
          <Paper className="glass-panel" elevation={0} sx={{ p: 4, width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)' }}>
              Interaction type
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {(analytics?.engagementBreakdown?.engagement || [
                { type: 'Likes', value: 0, pct: 0 },
                { type: 'Comments', value: 0, pct: 0 },
                { type: 'Shares', value: 0, pct: 0 },
                { type: 'Saves', value: 0, pct: 0 },
              ]).map((item, i) => {
                const totalEng = analytics?.engagementBreakdown?.totals?.engagement || 1;
                const pct = calculatePercentage(item.value, totalEng);
                const colors = ['#1877f2', '#1d3461', '#3da1f7', '#aed6f1'];
                const color = item.color || colors[i % colors.length];
                return (
                  <Box key={i} sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{item.type || item.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                          {pct}% of total engagement
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {new Intl.NumberFormat('en-IN').format(item.value)}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <Box sx={{ 
                        height: '100%', 
                        width: `${pct}%`, 
                        bgcolor: color, 
                        borderRadius: 5, 
                        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 10px ${color}80`
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ── Follower Growth / Total Followers — only for 'reach' metric ──── */}
      {selectedMetric === 'reach' && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Total Followers
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary, #1877f2)' }}>
              {new Intl.NumberFormat('en-IN').format(analytics?.totals?.followers || 0)}
            </Typography>
          </Box>

          <Paper className="glass-panel" elevation={0} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
              Growth type
            </Typography>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {analytics?.followerBreakdown?.growth?.length > 0 ? (
                <DonutChart segments={analytics.followerBreakdown.growth} />
              ) : (
                <DonutChart segments={[
                  { label: 'Organic', pct: 85, color: '#1877f2' },
                  { label: 'Paid',    pct: 15, color: '#1d3461' },
                ]} />
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ── Campaign Status distribution — hidden for 'active', 'engagement', 'reach' */}
      {selectedMetric === 'total' && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', mt: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Campaign Status Breakdown
          </Typography>

          <Paper className="glass-panel" elevation={0} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
              Status distribution
            </Typography>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {analytics?.breakdown?.byStatus?.length > 0 ? (
                <DonutChart segments={analytics.breakdown.byStatus} />
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', py: 4 }}>No campaign data yet</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ── Campaign Categories — shown for 'total' and 'active' ────────── */}
      {(selectedMetric === 'total' || selectedMetric === 'active') && !loading && analytics?.breakdown?.byCategory?.length > 0 && (
        <Box sx={{ mt: selectedMetric === 'active' ? 1 : 3 }}>
          <Paper className="glass-panel" elevation={0} sx={{ p: 4, width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)' }}>
              Campaign categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {analytics.breakdown.byCategory.map((item, i) => {
                const maxVal = analytics.breakdown.byCategory[0]?.value || 1;
                const pct = Math.round((item.value / maxVal) * 100);
                const colors = ['#1877f2', '#1d3461', '#18a340', '#f7b731', '#e02020', '#7b2d8b'];
                const color = colors[i % colors.length];
                return (
                  <Box key={i} sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                          {pct}% of total campaigns
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 5, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 5, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}


      {/* ── Insights ─────────────────────────────────────────────────────── */}
      {!loading && analytics?.insights && (
        <Box sx={{ 
          mt: 3, p: 2.5, 
          className: 'glass-indicator',
          border: '1px solid rgba(24,119,242,0.15)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1877f2', mb: 1 }}>
            💡 Campaign Insights
          </Typography>
          {analytics.insights.topCampaignMultiplier > 1 && (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
              Your top campaign received <strong>{analytics.insights.topCampaignMultiplier}×</strong> more applicants than average.
            </Typography>
          )}
          {analytics.insights.avgApplicationsPerCampaign > 0 && (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Average reach per campaign: <strong>{analytics.insights.avgApplicationsPerCampaign} applicants</strong>.
            </Typography>
          )}
          {analytics.insights.topCampaignMultiplier === 0 && analytics.insights.avgApplicationsPerCampaign === 0 && (
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              Create and run campaigns to see performance insights here.
            </Typography>
          )}
        </Box>
      )}

      {/* ── Campaigns Content Section (Replicated from Influencer) ────────── */}
      {!loading && (
        <BrandCampaignsContent />
      )}

    </Box>
  );
}

