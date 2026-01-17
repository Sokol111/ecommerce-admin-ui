import {
  clearTokenCookies,
  getAccessToken,
  getRefreshToken,
  saveTokensToCookies,
} from '@/lib/auth/cookie-storage';
import { getAuthAPI } from '@sokol111/ecommerce-auth-service-api';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isServer = typeof window === 'undefined';

// Флаги для клієнта — кожна вкладка браузера має свій контекст
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Request interceptor — додає Authorization header до КОЖНОГО axios запиту
axios.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Спробувати оновити токен (тільки на клієнті).
 * Повертає true якщо успішно, false якщо ні.
 */
async function tryRefreshToken(): Promise<boolean> {
  // На сервері не робимо refresh — там кожен запит ізольований
  if (isServer) {
    return false;
  }

  // Якщо вже йде refresh — чекаємо на результат
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = await getRefreshToken();
      if (!token) {
        return false;
      }

      // Використовуємо API напряму, щоб уникнути циклу з interceptor
      const api = getAuthAPI();
      const response = await api.tokenRefresh(
        { refreshToken: token },
        { baseURL: process.env.AUTH_API_URL }
      );

      await saveTokensToCookies(response.data);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Response interceptor — обробляє 401 помилки
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401) {
      // На сервері: просто очищаємо cookies і кидаємо помилку
      // Middleware перехопить наступний запит без токена
      if (isServer) {
        await clearTokenCookies();
        return Promise.reject(error);
      }

      // На клієнті: пробуємо refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const refreshed = await tryRefreshToken();

        if (refreshed) {
          // Оновити header з новим токеном і повторити запит
          const newToken = await getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axios.request(originalRequest);
        }
      }

      // Refresh не вдався — очищаємо і редірект
      await clearTokenCookies();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
