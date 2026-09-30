import axios from 'axios';

/**
 * Centralized Axios instance with request/response interceptors.
 * Adds JWT token automatically to every outgoing API request.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('collabify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for unified error messaging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('collabify_token');
        localStorage.removeItem('collabify_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
