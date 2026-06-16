import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - Add token and villageId
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('village_token');
    const villageId = localStorage.getItem('villageId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ ADD villageId to headers for ALL requests
    if (villageId) {
      config.headers['X-Village-Id'] = villageId;
    }
    
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method,
      villageId: villageId || 'Not set'
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('village_token');
      localStorage.removeItem('village_user');
      localStorage.removeItem('villageId');
      localStorage.removeItem('village');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;