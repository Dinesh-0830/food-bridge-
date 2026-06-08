import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized or token expired, clear localStorage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('foodbridge_token');
      localStorage.removeItem('foodbridge_user');
      // Avoid redirecting in some API check paths to prevent redirect loops,
      // but standard behavior is to notify auth context.
    }
    return Promise.reject(error);
  }
);

export default api;
