const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolveAssetUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `${API_BASE}${value.startsWith('/') ? value : `/${value}`}`;
};

export const getOwnProfilePath = (role) => {
  if (role === 'admin') return '/admin/profile';
  if (role === 'brand') return '/brand/profile';
  return '/influencer/profile';
};

export const getItemId = (item) => item?._id || item?.id;

export const toDateInput = (value) => (value ? new Date(value).toISOString().split('T')[0] : '');

export const splitCsv = (value) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []);
