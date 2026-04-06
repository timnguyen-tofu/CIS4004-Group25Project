import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('km_token');
  if (token) config.headers['authorization'] = token;
  return config;
});

export default api;
