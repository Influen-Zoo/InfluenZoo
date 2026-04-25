import React from 'react';
import { Box, Typography, Divider, Grid, CircularProgress } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const demoAccounts = [
  { email: 'influencer1@example.com', label: 'Creator', icon: '🎨' },
  { email: 'brand1@example.com', label: 'Brand', icon: '🏢' },
  { email: 'admin@influenZoo.com', label: 'Admin', icon: '⚙️' },
];

export const DemoAccounts = ({ loading, demoLogin }) => {
  return (
    <>
      <Divider 
        sx={{ 
          my: 3,
          borderColor: 'var(--border)',
          '&::before, &::after': {
            borderColor: 'var(--border)',
          },
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          OR TRY A DEMO
        </Typography>
      </Divider>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {demoAccounts.map((account) => (
          <Grid item xs={12} sm={4} key={account.email}>
            <LiquidButton
              fullWidth
              variant={account.label === 'Creator' ? 'primary' : account.label === 'Brand' ? 'secondary' : 'success'}
              disabled={loading}
              onClick={() => demoLogin(account.email)}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>{account.icon}</span> {account.label}
                </>
              )}
            </LiquidButton>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default DemoAccounts;
