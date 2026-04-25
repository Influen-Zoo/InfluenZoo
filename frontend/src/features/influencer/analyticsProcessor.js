/**
 * influencer/analyticsProcessor.js
 * Business logic for mapping and transforming influencer analytics
 */

export const getChartDataForMetric = (analytics, selectedMetric) => {
  if (!analytics?.timeSeries) return [];
  const map = {
    views:      analytics.timeSeries.views,
    engagement: analytics.timeSeries.engagement,
    followers:  analytics.timeSeries.followers,
    earnings:   analytics.timeSeries.earnings,
  };
  return map[selectedMetric] ?? [];
};

export const getYAxisMaxLabel = (chartData) => {
  if (!chartData || chartData.length === 0) return '0';
  const val = Math.max(...chartData.map(d => d.value), 0);
  return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val;
};

export const formatViewerCount = (count) => {
  return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;
};

const DEFAULT_DONUT_SEGMENTS = {
  views: [
    { label: 'Followers', pct: 54, color: '#1877f2' },
    { label: 'Non-followers', pct: 46, color: '#1d3461' },
  ],
  followers: [
    { label: 'Organic', pct: 85, color: '#1877f2' },
    { label: 'Paid', pct: 15, color: '#1d3461' },
  ],
};

const ENGAGEMENT_COLORS = ['#1877f2', '#1d3461', '#3da1f7', '#aed6f1'];

export const getDonutSegments = (breakdown, totals, selectedMetric) => {
  if (selectedMetric === 'engagement' || selectedMetric === 'earnings') {
    return (breakdown?.[selectedMetric]?.map((item, i) => ({
      label: item.type || item.label,
      pct: item.pct || (totals?.[selectedMetric] > 0 ? Math.round((item.value / totals[selectedMetric]) * 100) : 0),
      color: item.color || ENGAGEMENT_COLORS[i % ENGAGEMENT_COLORS.length]
    })) || []);
  }
  
  return DEFAULT_DONUT_SEGMENTS[selectedMetric] || DEFAULT_DONUT_SEGMENTS.views;
};

export const getInteractionSegments = (breakdown, totals) => {
  return (breakdown?.engagement?.map((e, i) => ({
    label: e.type,
    value: e.value,
    pct: totals?.engagement > 0 ? Math.round((e.value / totals.engagement) * 100) : 0,
    color: ENGAGEMENT_COLORS[i % ENGAGEMENT_COLORS.length]
  })) || []);
};
