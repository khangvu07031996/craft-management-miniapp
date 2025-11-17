import axios from 'axios';

// Use API subdomain in production, relative path for IP access, localhost for dev
// Use env variable if provided, otherwise detect based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production with domain, use API subdomain
  const hostname = window.location.hostname;
  if (hostname === 'admin.thucongmyngheviet.com') {
    return 'https://api.thucongmyngheviet.com';
  }
  // In production (not localhost), use relative path so Nginx can proxy
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return '/api';
  }
  // Default to localhost for local development
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

