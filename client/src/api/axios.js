/**
 * PayRoll Pro – Axios Instance
 * Configured axios with base URL, JWT interceptors, and error handling.
 */

import axios from 'axios';

// Determine base URL dynamically
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://employee-payroll-system-production-94fd.up.railway.app/api'
    : '/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor – Attach JWT token to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor – Handle 401 (token expired) globally.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Token expired or invalid – redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Dynamic helper to construct file upload URLs.
 * Handles both relative filenames and absolute URLs cleanly.
 */
export const getUploadURL = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('data:')) return filename;
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : 'https://employee-payroll-system-production-94fd.up.railway.app';
  return `${baseUrl}/uploads/${filename}`;
};

export default api;
