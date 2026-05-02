import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_H = 274;

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatValue = (metric, value) => {
  const safeValue = toSafeNumber(value);
  if (metric === 'earnings') {
    return `₹${new Intl.NumberFormat('en-IN').format(safeValue)}`;
  }
  return new Intl.NumberFormat('en-IN').format(safeValue);
};

const formatYAxis = (value) => {
  const safeValue = toSafeNumber(value);
  if (safeValue >= 10000000) return `${(safeValue / 10000000).toFixed(1)}Cr`;
  if (safeValue >= 100000) return `${(safeValue / 100000).toFixed(1)}L`;
  if (safeValue >= 1000) return `${(safeValue / 1000).toFixed(1)}K`;
  return Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1);
};

const getTickIndexes = (count) => {
  if (count <= 1) return [0];
  if (count <= 8) return Array.from({ length: count }, (_, index) => index);

  const targetTickCount = 6;
  return Array.from({ length: targetTickCount }, (_, index) => (
    Math.round((index / (targetTickCount - 1)) * (count - 1))
  )).filter((tick, index, ticks) => ticks.indexOf(tick) === index);
};

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.8,
        borderRadius: 2,
        background: 'rgba(20, 20, 20, 0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        boxShadow: '0 14px 34px rgba(0,0,0,0.28)',
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.68)', fontWeight: 700, lineHeight: 1.2 }}>
        {point?.label ?? label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 900, lineHeight: 1.3 }}>
        {formatValue(metric, point?.value)}
      </Typography>
    </Box>
  );
};

export default function AnalyticsTrendChart({ data = [], metric, loading }) {
  if (loading) {
    return <Skeleton variant="rectangular" height={CHART_H} sx={{ borderRadius: 3, opacity: 0.6 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: CHART_H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #8a8d91)', fontSize: '0.875rem' }}>
        No data available for this period
      </Box>
    );
  }

  const chartData = data.map((item, index) => ({
    x: index,
    label: item.label,
    value: toSafeNumber(item.value),
  }));
  const tickIndexes = getTickIndexes(chartData.length);

  return (
    <Box className="analytics-trend-chart" sx={{ width: '100%', height: CHART_H }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 18, right: 16, left: 4, bottom: 14 }}
        >
          <defs>
            <linearGradient id={`analyticsArea_${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5ff" stopOpacity={0.32} />
              <stop offset="72%" stopColor="#0ea5ff" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#0ea5ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(148, 163, 184, 0.22)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, chartData.length - 1]}
            ticks={tickIndexes}
            interval={0}
            tickFormatter={(value) => chartData[value]?.label || ''}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
            dy={12}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            width={42}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
            tickFormatter={formatYAxis}
            allowDecimals
          />
          <Tooltip
            cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 3' }}
            content={<CustomTooltip metric={metric} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0ea5ff"
            strokeWidth={3}
            fill={`url(#analyticsArea_${metric})`}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#0ea5ff' }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
