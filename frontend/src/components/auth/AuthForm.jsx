import React from 'react';
import { 
  Box, 
  Stack, 
  TextField, 
  InputAdornment, 
  Button, 
  Link, 
  CircularProgress 
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  GroupAdd as GroupAddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export const AuthForm = ({ 
  isLogin, 
  form, 
  handleFieldChange, 
  loading, 
  showPassword, 
  setShowPassword, 
  handleSubmit 
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Stack spacing={2.5}>
        {!isLogin && (
          <TextField
            fullWidth
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonAddIcon sx={{ color: 'var(--accent)', mr: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                '&:hover fieldset': {
                  borderColor: 'var(--accent)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--accent)',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'var(--text-secondary)',
                opacity: 1,
              },
            }}
          />
        )}

        {!isLogin && (
          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            variant="outlined"
            inputProps={{
              inputMode: 'numeric',
              maxLength: 10,
              pattern: '[0-9]{10}',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: 'var(--accent)', mr: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                '&:hover fieldset': {
                  borderColor: 'var(--accent)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--accent)',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'var(--text-secondary)',
                opacity: 1,
              },
            }}
          />
        )}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          required
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'var(--accent)', mr: 1 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-primary)',
              '&:hover fieldset': {
                borderColor: 'var(--accent)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--accent)',
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'var(--text-secondary)',
              opacity: 1,
            },
          }}
        />

        {!isLogin && (
          <TextField
            fullWidth
            label="Referral Code"
            type="text"
            placeholder="Optional"
            value={form.referralCode}
            onChange={(e) => handleFieldChange('referralCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupAddIcon sx={{ color: 'var(--accent)', mr: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                '&:hover fieldset': {
                  borderColor: 'var(--accent)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--accent)',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'var(--text-secondary)',
                opacity: 1,
              },
            }}
          />
        )}

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          required
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'var(--accent)', mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: 'var(--accent)', minWidth: '40px', p: 0 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-primary)',
              '&:hover fieldset': {
                borderColor: 'var(--accent)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--accent)',
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'var(--text-secondary)',
              opacity: 1,
            },
          }}
        />

        {isLogin && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link 
              href="#" 
              underline="hover" 
              sx={{ 
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': { color: 'var(--accent-dark)' },
              }}
            >
              Forgot password?
            </Link>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <LiquidButton
            fullWidth
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : isLogin ? (
              <>
                <LockOpenIcon sx={{ mr: 1 }} />
                Sign In
              </>
            ) : (
              <>
                <PersonAddIcon sx={{ mr: 1 }} />
                Create Account
              </>
            )}
          </LiquidButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default AuthForm;
