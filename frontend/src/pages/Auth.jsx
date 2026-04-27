import React from 'react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Alert 
} from '@mui/material';

// Logic Hook
import { useAuthForm } from '../hooks/auth/useAuthForm';

// Building Blocks
import AuthHeader from '../components/auth/AuthHeader';
import RoleSelector from '../components/auth/RoleSelector';
import AuthForm from '../components/auth/AuthForm';
import AuthToggle from '../components/auth/AuthToggle';

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
