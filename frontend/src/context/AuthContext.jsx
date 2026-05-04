import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

import { isTokenExpired } from '../features/auth/authUtils';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          if (isTokenExpired(accessToken)) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return;
          }

          try {
            const response = await api.getMe();
            setUser(response.data || response.user);
          } catch (err) {
            // If 401, silently clear tokens and continue
            if (err.response?.status === 401) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            } else {
              console.error('Auth initialization error:', err);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.login(email, password);
      const userData = response.user || response.data;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (credential, role = 'influencer') => {
    try {
      setError(null);
      const response = await api.loginWithGoogle(credential, role);
      const userData = response.user || response.data;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Google Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithFacebook = async (accessToken, role = 'influencer') => {
    try {
      setError(null);
      const response = await api.loginWithFacebook(accessToken, role);
      const userData = response.user || response.data;
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Facebook Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.register(userData);
      const newUser = response.user || response.data;
      setUser(newUser);
      return newUser;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth data
      setUser(null);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Force redirect to auth page
      window.location.href = '/auth';
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      loginWithGoogle,
      loginWithFacebook,
      register,
      logout,
      updateUser,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
