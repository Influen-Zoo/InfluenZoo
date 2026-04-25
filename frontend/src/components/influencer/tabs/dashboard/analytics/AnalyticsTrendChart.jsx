import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Paper } from '@mui/material';

const CHART_H = 180;
const PAD_LEFT = 35;
const PAD_RIGHT = 5;
const PAD_TOP = 10;
const PAD_BOTTOM = 28;

const formatYLabel = (val) => {
  if (val >= 10000000) return (val / 10000000).toFixed(1) + 'Cr';
  if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val;
};

export default function AnalyticsTrendChart({ data = [], metric, loading }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(300);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      if (entries[0].contentRect.width > 0) setWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (loading) {
    return <Skeleton variant="rectangular" height={CHART_H + PAD_BOTTOM} sx={{ borderRadius: 3, opacity: 0.6 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: CHART_H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #8a8d91)', fontSize: '0.875rem' }}>
        No data available for this period
      </Box>
    );
  }

  // Ensure data has labels and values
  const chartData = data.map(d => ({ label: d.label, value: d.value ?? 0 }));
  const values = chartData.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const chartW = width - PAD_LEFT - PAD_RIGHT;
  const chartH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const toX = (i) => PAD_LEFT + (i / (chartData.length - 1)) * chartW;
  const toY = (v) => PAD_TOP + chartH - ((v - minVal) / range) * chartH;

  // Build smooth curve path using Cubic Bezier
  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i+1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const points = chartData.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  const smoothPath = buildSmoothPath(points);
  const areaPath = `${smoothPath} L ${toX(chartData.length - 1)},${PAD_TOP + chartH} L ${toX(0)},${PAD_TOP + chartH} Z`;

  // Grid lines
  const GRID_LINES = 3;
  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
    Math.round(minVal + (i / GRID_LINES) * range)
  );

  const step = Math.max(1, Math.floor(chartData.length / 5));

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - PAD_LEFT;
    const index = Math.round((mouseX / chartW) * (chartData.length - 1));
    if (index >= 0 && index < chartData.length) setHoverIndex(index);
    else setHoverIndex(null);
  };

  return (
    <Box 
        ref={containerRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        sx={{ position: 'relative', width: '100%', cursor: 'crosshair' }}
    >
      <svg
        width={width}
        height={CHART_H + PAD_BOTTOM}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <linearGradient id={`grad_${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1877f2" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1877f2" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map((val, i) => {
          const y = toY(val);
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT} y1={y} x2={width - PAD_RIGHT} y2={y}
                stroke="var(--border-light, rgba(0,0,0,0.05))"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8} y={y + 3}
                textAnchor="end"
                fontSize="10"
                fontWeight="500"
                fill="var(--text-muted, #8a8d91)"
              >
                {formatYLabel(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad_${metric})`} />

        {/* Main Line */}
        <path
          d={smoothPath}
          fill="none"
          stroke="#1877f2"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X axis labels */}
        {chartData.map((d, i) => {
          if (i === 0 || i === chartData.length - 1 || i % step === 0) {
            return (
              <text
                key={i}
                x={toX(i)}
                y={CHART_H + PAD_BOTTOM - 6}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill="var(--text-muted, #8a8d91)"
              >
                {d.label}
              </text>
            );
          }
          return null;
        })}

        {/* Hover Indicator */}
        {hoverIndex !== null && (
            <g>
                <line 
                    x1={toX(hoverIndex)} y1={PAD_TOP} 
                    x2={toX(hoverIndex)} y2={PAD_TOP + chartH} 
                    stroke="var(--primary, #1877f2)" 
                    strokeWidth="1" 
                    strokeDasharray="4 2"
                />
                <circle 
                    cx={toX(hoverIndex)} cy={toY(chartData[hoverIndex].value)} 
                    r="5" 
                    fill="var(--primary, #1877f2)" 
                    stroke="#fff" 
                    strokeWidth="2" 
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                />
            </g>
        )}
      </svg>

      {/* Hover Tooltip */}
      {hoverIndex !== null && (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: toY(chartData[hoverIndex].value) - 50,
                left: toX(hoverIndex) + 10,
                transform: toX(hoverIndex) > width / 2 ? 'translateX(-110%)' : 'none',
                p: '4px 10px',
                borderRadius: 2,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'rgba(28, 30, 33, 0.95)',
                color: '#fff',
                minWidth: 80
            }}
        >
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                {chartData[hoverIndex].label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                {metric === 'earnings' ? `₹${new Intl.NumberFormat('en-IN').format(chartData[hoverIndex].value)}` : new Intl.NumberFormat('en-IN').format(chartData[hoverIndex].value)}
            </Typography>
        </Paper>
      )}
    </Box>
  );
}
