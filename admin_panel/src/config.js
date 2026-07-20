import axios from 'axios';

const configuredApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

export const API = configuredApi?.replace(/\/+$/, '');

if (!API) {
  throw new Error('Missing VITE_API_URL. Set it to your backend API URL before building the admin panel.');
}

export const getAdminToken = () => localStorage.getItem('adminToken');

export const getAuthHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminEmail');
  delete axios.defaults.headers.common.Authorization;
};

