import { getAccessToken } from '@/lib/auth/cookie-storage';
import axios from 'axios';

// Request interceptor — додає токен
axios.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
