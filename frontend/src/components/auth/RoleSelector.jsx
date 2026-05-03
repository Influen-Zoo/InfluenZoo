import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { PersonAdd as PersonAddIcon, Business as BusinessIcon } from '@mui/icons-material';

export const RoleSelector = ({ role, setRole }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 2, 
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        I am a:
      </Typography>
      <ToggleButtonGroup
        value={role}
        onChange={(e, newRole) => newRole && setRole(newRole)}
        exclusive
        fullWidth
        sx={{
          gap: 2,
          '& .MuiToggleButton-root': {
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'all 0.3s',
            color: 'var(--text-primary)',
            '&.Mui-selected': {
              background: 'var(--accent-gradient)',
              color: 'white',
              borderColor: 'transparent',
            },
          },
          '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
            marginLeft: 0,
            borderLeft: '2px solid var(--border)',
          },
        }}
      >
        <ToggleButton value="influencer" sx={{ flex: 1 }}>
          <PersonAddIcon sx={{ mr: 1 }} /> Creator
        </ToggleButton>
        <ToggleButton value="brand" sx={{ flex: 1 }}>
          <BusinessIcon sx={{ mr: 1 }} /> Brand
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default RoleSelector;
