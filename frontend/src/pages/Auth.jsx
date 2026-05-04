import React from 'react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Alert,
  Divider,
  Button,
  Stack
} from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Logic Hook
import { useAuthForm } from '../hooks/auth/useAuthForm';

// Building Blocks
import AuthHeader from '../components/auth/AuthHeader';
import RoleSelector from '../components/auth/RoleSelector';
import AuthForm from '../components/auth/AuthForm';
import AuthToggle from '../components/auth/AuthToggle';
import LiquidButton from '../components/common/LiquidButton/LiquidButton';

import './Auth.css';

export default function Auth() {
  const {
    isLogin,
    role,
    setRole,
    form,
    error,
    setError,
    loading,
    showPassword,
    setShowPassword,
    toggleMode,
    handleSubmit,
    handleFieldChange
  } = useAuthForm();

  const { loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token, role);
        navigate('/dashboard');
      } catch (err) {
        setError('Google login failed');
      }
    },
    onError: () => setError('Google login failed')
  });

  const responseFacebook = async (response) => {
    if (response.accessToken) {
      try {
        await loginWithFacebook(response.accessToken, role);
        navigate('/dashboard');
      } catch (err) {
        setError('Facebook login failed');
      }
    } else {
      setError('Facebook login failed');
    }
  };

  // Handle CJS/ESM interop issue with FacebookLogin in Vite
  const FBLogin = FacebookLogin.default || FacebookLogin;

  return (
    <Box className="auth-container">
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card className="auth-card glass-panel" elevation={0}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Header Section */}
            <AuthHeader isLogin={isLogin} />

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#d32f2f',
                  fontWeight: 500,
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Role Selector for Signup */}
            {!isLogin && (
              <RoleSelector role={role} setRole={setRole} />
            )}

            {/* Auth Form (Inputs & Primary Action) */}
            <AuthForm 
              isLogin={isLogin}
              form={form}
              handleFieldChange={handleFieldChange}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
            />

            {isLogin && (
              <>
                <Box sx={{ my: 3 }}>
                  <Divider sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    OR CONTINUE WITH
                  </Divider>
                </Box>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <LiquidButton
                    fullWidth
                    onClick={() => googleLogin()}
                    style={{ flex: 1 }}
                  >
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" style={{ width: 20, height: 20, marginRight: 8 }} />
                    Google
                  </LiquidButton>

                  <FBLogin
                    appId={import.meta.env.VITE_FACEBOOK_APP_ID || 'placeholder-app-id'}
                    onSuccess={responseFacebook}
                    onFail={() => setError('Facebook login failed')}
                    render={({ onClick }) => (
                      <Box sx={{ flex: 1, display: 'flex' }}>
                        <LiquidButton
                          fullWidth
                          onClick={onClick}
                          style={{ flex: 1 }}
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" style={{ width: 20, height: 20, marginRight: 8 }} />
                          Facebook
                        </LiquidButton>
                      </Box>
                    )}
                  />
                </Stack>
              </>
            )}

            {/* Mode Switcher (Login/Signup toggle) */}
            <AuthToggle 
              isLogin={isLogin}
              toggleMode={toggleMode}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
