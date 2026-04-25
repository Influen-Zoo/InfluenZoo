/**
 * brand/analyticsProcessor.js
 * Business logic for mapping and transforming brand dashboard analytics
 */

export const getBrandChartData = (analytics, selectedMetric) => {
  return analytics?.timeSeries?.[selectedMetric] ?? [];
};

export const getYAxisMaxLabel = (chartData) => {
  if (!chartData || chartData.length === 0) return '0';
  const val = Math.max(...chartData.map(d => d.value), 0);
  return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val;
};

export const mapDonutSegments = (data, totalValue = 1) => {
  if (!data || data.length === 0) return [];
  return data.map(item => ({
    label: item.label || item.type,
    pct: item.pct || (totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0),
    color: item.color || '#1877f2'
  }));
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

export const getCategoryRelativePct = (value, maxValue) => {
  if (!maxValue || maxValue === 0) return 0;
  return Math.round((value / maxValue) * 100);
};
