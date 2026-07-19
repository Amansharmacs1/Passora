import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('passora_user'));
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Failed to parse passora_user from local storage:', e);
      localStorage.removeItem('passora_user');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token expiration or errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, log out the user
      localStorage.removeItem('passora_user');
      // Dispatch an event so React context can catch it, or just reload the page to clear state
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
