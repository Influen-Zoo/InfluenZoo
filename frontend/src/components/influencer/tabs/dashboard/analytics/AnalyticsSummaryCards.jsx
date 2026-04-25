import React from 'react';
import {
  Box, Card, CardContent, Typography, Skeleton, Chip
} from '@mui/material';
import { 
  VisibilityOutlined as VisibilityOutlinedIcon,
  AttachMoneyOutlined as AttachMoneyOutlinedIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingFlat as TrendingDownIcon
} from '@mui/icons-material';

const icons = {
  views:      <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />,
  earnings:   <AttachMoneyOutlinedIcon sx={{ fontSize: 22 }} />,
  engagement: <ThumbUpOutlinedIcon sx={{ fontSize: 22 }} />,
  followers:  <PersonAddOutlinedIcon sx={{ fontSize: 22 }} />,
};

const formatValue = (id, value) => {
  if (id === 'earnings') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-IN').format(value);
};

export default function AnalyticsSummaryCards({
  totals, trends, selected, onSelect, loading
}) {
  const cards = [
    { id: 'views',      label: 'Views',                value: totals?.views,      trend: trends?.views },
    { id: 'earnings',   label: 'Approx. earnings',     value: totals?.earnings,   trend: trends?.earnings },
    { id: 'engagement', label: 'Engagement',           value: totals?.engagement, trend: trends?.engagement },
    { id: 'followers',  label: 'Net followers',        value: totals?.netFollowers, trend: trends?.netFollowers },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
      {cards.map(card => {
        const isSelected = selected === card.id;
        const trend = card.trend ?? 0;
        const isUp = trend > 0;
        const isFlat = trend === 0;

        return (
          <Card
            key={card.id}
            className="glass-panel"
            onClick={() => onSelect(card.id)}
            elevation={0}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: isSelected ? '1px solid var(--accent) !important' : undefined,
                background: isSelected ? 'rgba(255, 255, 255, 0.05) !important' : undefined,
                boxShadow: isSelected
                  ? '0 0 0 1px var(--accent) inset, 0 12px 32px rgba(var(--accent-rgb), 0.2) !important'
                  : undefined,
                '&:hover': { 
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4) !important'
                },
              }}
          >
            <CardContent sx={{ p: '1rem !important' }}>
              {/* Icon Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: isSelected ? 'var(--primary, #1877f2)' : 'var(--text-secondary, #65676b)' }}>
                {icons[card.id]}
                <Typography variant="caption" sx={{ fontSize: '0.82rem', color: 'var(--text-secondary, #65676b)' }}>
                  {card.label}
                </Typography>
              </Box>

              {/* Value */}
              {loading ? (
                <Skeleton width={80} height={32} />
              ) : (
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: '1.35rem', color: 'var(--text-primary, #1c1e21)', lineHeight: 1 }}
                >
                  {formatValue(card.id, card.value ?? 0)}
                </Typography>
              )}

              {/* Trend badge */}
              {!loading && (
                <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isFlat ? (
                    <Typography variant="caption" sx={{ color: 'var(--text-muted, #8a8d91)' }}>--</Typography>
                  ) : (
                    <Chip
                      icon={isUp ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} /> : <TrendingDownIcon sx={{ fontSize: '14px !important', transform: 'rotate(180deg)' }} />}
                      label={`${isUp ? '+' : ''}${trend}%`}
                      size="small"
                      className="glass-indicator"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 700,
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
  );
}
