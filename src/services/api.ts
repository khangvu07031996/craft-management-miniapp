import axios from 'axios';

// Use API subdomain in production, relative path for IP access, localhost for dev
// Use env variable if provided, otherwise detect based on environment
const getApiBaseUrl = () => {
  // Priority 1: Use VITE_API_BASE_URL if provided (for production)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('[API] Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const protocol = window.location.protocol;
  const mode = import.meta.env.MODE;
  
  // Debug logging
  console.log('[API] mode:', mode);
  console.log('[API] hostname:', hostname);
  console.log('[API] origin:', origin);
  console.log('[API] protocol:', protocol);
  
  // Check if we're on the admin subdomain - check by origin or hostname
  // Cloudflare might proxy, so check both origin and hostname
  const isAdminSubdomain = 
    origin.includes('admin.thucongmyngheviet.com') ||
    hostname === 'admin.thucongmyngheviet.com' || 
    hostname === 'www.admin.thucongmyngheviet.com' ||
    hostname.includes('admin.thucongmyngheviet.com') ||
    (hostname.endsWith('.thucongmyngheviet.com') && hostname.startsWith('admin')) ||
    (protocol === 'https:' && hostname.includes('thucongmyngheviet.com') && hostname.includes('admin'));
  
  console.log('[API] isAdminSubdomain check:', isAdminSubdomain);
  
  if (isAdminSubdomain) {
    const apiUrl = 'https://api.thucongmyngheviet.com';
    console.log('[API] Detected admin subdomain, using API subdomain:', apiUrl);
    return apiUrl;
  }
  
  // In production (not localhost), use relative path so Nginx can proxy
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('[API] Using relative path /api for hostname:', hostname);
    return '/api';
  }
  
  // Default to localhost for local development
  console.log('[API] Using localhost for development');
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('[API] Final API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Disable caching in development to ensure fresh data
    ...(import.meta.env.MODE === 'development' ? {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    } : {}),
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
      // Don't redirect if it's a change-password request (let the component handle the error)
      const isChangePasswordRequest = error.config?.url?.includes('/auth/change-password');
      
      if (!isChangePasswordRequest) {
        // Unauthorized - clear token and redirect to login
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

