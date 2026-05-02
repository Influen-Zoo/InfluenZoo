/**
 * influencer/analyticsProcessor.js
 * Business logic for mapping and transforming influencer analytics
 */

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

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
  const val = Math.max(...chartData.map(d => toSafeNumber(d.value)), 0);
  return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val;
};

export const formatViewerCount = (count) => {
  const safeCount = toSafeNumber(count);
  return safeCount >= 1000 ? (safeCount / 1000).toFixed(1) + 'K' : safeCount;
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
      value: toSafeNumber(item.value),
      pct: toSafeNumber(item.pct) || (toSafeNumber(totals?.[selectedMetric]) > 0 ? Math.round((toSafeNumber(item.value) / toSafeNumber(totals[selectedMetric])) * 100) : 0),
      color: item.color || ENGAGEMENT_COLORS[i % ENGAGEMENT_COLORS.length]
    })) || []);
  }
  
  return DEFAULT_DONUT_SEGMENTS[selectedMetric] || DEFAULT_DONUT_SEGMENTS.views;
};

export const getInteractionSegments = (breakdown, totals) => {
  return (breakdown?.engagement?.filter((e) => {
    const label = String(e.type || e.label || '').toLowerCase();
    return label !== 'save' && label !== 'saves';
  }).map((e, i) => ({
    label: e.type,
    value: toSafeNumber(e.value),
    pct: toSafeNumber(totals?.engagement) > 0 ? Math.round((toSafeNumber(e.value) / toSafeNumber(totals.engagement)) * 100) : 0,
    color: ENGAGEMENT_COLORS[i % ENGAGEMENT_COLORS.length]
  })) || []);
};
