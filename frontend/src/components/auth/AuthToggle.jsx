import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export const AuthToggle = ({ isLogin, toggleMode }) => {
  return (
    <Box sx={{ textAlign: 'center', pt: 2 }}>
      {isLogin ? (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            onClick={toggleMode}
            sx={{ 
              cursor: 'pointer', 
              fontWeight: 700,
              color: 'var(--accent)',
              transition: 'color 0.3s',
              '&:hover': { color: 'var(--accent-dark)' },
            }}
          >
            Sign up here
          </Link>
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            onClick={toggleMode}
            sx={{ 
              cursor: 'pointer', 
              fontWeight: 700,
              color: 'var(--accent)',
              transition: 'color 0.3s',
              '&:hover': { color: 'var(--accent-dark)' },
            }}
          >
            Sign in here
          </Link>
        </Typography>
      )}
    </Box>
  );
};

export default AuthToggle;
