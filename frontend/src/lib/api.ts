import axios from 'axios';

const apiBaseURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';
console.log('[API Config] VITE_API_URL env:', (import.meta as any).env.VITE_API_URL);
console.log('[API Config] Using base URL:', apiBaseURL);

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
});

// Request interceptor to automatically add JWT token
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('estatehub_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing stored user data', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
