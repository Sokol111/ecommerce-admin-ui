import { refreshTokenAction } from '@/lib/auth/actions';
import { getAccessToken } from '@/lib/auth/cookie-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Request interceptor — додає токен
axios.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — при 401 пробує refresh і retry
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const result = await refreshTokenAction();
      if (result.success) {
        const newToken = await getAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axios.request(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
