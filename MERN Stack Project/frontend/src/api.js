// ── API Helper ────────────────────────────────────────────────
// Wraps axios so every request automatically includes the
// Authorization token stored in localStorage.

import axios from 'axios';

const api = axios.create({
  baseURL: '/api'  // CRA proxy forwards this to http://localhost:5000/api
});

// Before every request, attach the JWT token if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('km_token');
  if (token) {
    config.headers['authorization'] = token;
  }
  return config;
});

export default api;
