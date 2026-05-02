/**
 * brand/analyticsProcessor.js
 * Business logic for mapping and transforming brand dashboard analytics
 */

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getBrandChartData = (analytics, selectedMetric) => {
  return analytics?.timeSeries?.[selectedMetric] ?? [];
};

export const getYAxisMaxLabel = (chartData) => {
  if (!chartData || chartData.length === 0) return '0';
  const val = Math.max(...chartData.map(d => toSafeNumber(d.value)), 0);
  return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val;
};

export const mapDonutSegments = (data, totalValue = 1) => {
  if (!data || data.length === 0) return [];
  const safeTotal = toSafeNumber(totalValue);
  return data.map(item => ({
    label: item.label || item.type,
    pct: toSafeNumber(item.pct) || (safeTotal > 0 ? Math.round((toSafeNumber(item.value) / safeTotal) * 100) : 0),
    color: item.color || '#1877f2'
  }));
};

export const calculatePercentage = (value, total) => {
  const safeValue = toSafeNumber(value);
  const safeTotal = toSafeNumber(total);
  if (!safeTotal) return 0;
  return Math.min(100, Math.round((safeValue / safeTotal) * 100));
};

export const getCategoryRelativePct = (value, maxValue) => {
  const safeValue = toSafeNumber(value);
  const safeMax = toSafeNumber(maxValue);
  if (!safeMax) return 0;
  return Math.round((safeValue / safeMax) * 100);
};
