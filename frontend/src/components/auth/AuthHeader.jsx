import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/influenzoo-logo.png';

export const AuthHeader = ({ isLogin }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'pointer',
          mb: 3,
          transition: 'transform 0.3s',
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        <Avatar
          src={logo}
          sx={{ 
            width: 56, 
            height: 56,
            background: 'var(--accent-gradient)',
          }}
          alt="InfluenZoo"
        />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.75rem',
          }}
        >
          InfluenZoo
        </Typography>
      </Box>
      
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 800,
          mb: 1,
          color: 'var(--text-primary)',
          fontSize: { xs: '1.75rem', sm: '2rem' },
        }}
      >
        {isLogin ? 'Welcome Back' : 'Join The Revolution'}
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '400px',
        }}
      >
        {isLogin
          ? 'Sign in to access exclusive campaigns and collaborations'
          : 'Start your influencer or brand journey with us today'}
      </Typography>
    </Box>
  );
};

export default AuthHeader;
