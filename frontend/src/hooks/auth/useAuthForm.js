import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const useAuthForm = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [role, setRole] = useState('influencer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    referralCode: (searchParams.get('ref') || '').toUpperCase(),
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setForm({ name: '', email: '', phone: '', referralCode: '', password: '' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await login(form.email, form.password);
      } else {
        user = await register({ ...form, role });
      }
      
      const redirectMap = { 
        influencer: '/influencer', 
        brand: '/brand', 
        admin: '/admin' 
      };
      
      navigate(redirectMap[user.role] || '/');
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const demoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    
    try {
      const user = await login(demoEmail, 'password123');
      
      if (!user || typeof user !== 'object') {
        throw new Error(`Invalid login response`);
      }
      
      const userRole = user.role || user.Role;
      if (!userRole) {
        throw new Error('Role not found in user data');
      }
      
      const redirectMap = { 
        influencer: '/influencer', 
        brand: '/brand', 
        admin: '/admin' 
      };
      
      navigate(redirectMap[userRole] || '/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return {
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
    demoLogin,
    handleFieldChange
  };
};

export default useAuthForm;
