import axios from 'axios';

const api = axios.create({
  // Use relative pathing so the Vite dev server proxy handles forwarding.
  // This is required for cloud IDEs and port forwarding to work correctly.
  baseURL: '',
});

// Interceptor to inject bearer token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('saas_userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
