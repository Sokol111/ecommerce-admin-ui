'use server';

import { login as apiLogin, getProfile, refreshToken } from '@/lib/client/auth-client';
import {
  AdminAuthResponse,
  AdminUserProfile,
  TokenRefreshResponse,
} from '@sokol111/ecommerce-auth-service-api';

export interface LoginResult {
  success: boolean;
  data?: AdminAuthResponse;
  error?: string;
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await apiLogin({ email, password });
    return { success: true, data: response };
  } catch (error) {
    console.error('Login error:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosError.response?.status === 401) {
        return { success: false, error: 'Invalid email or password' };
      }
      if (axiosError.response?.status === 403) {
        return { success: false, error: 'Account is disabled' };
      }
      if (axiosError.response?.data?.detail) {
        return { success: false, error: axiosError.response.data.detail };
      }
    }
    return { success: false, error: 'An error occurred during login' };
  }
}

export interface ProfileResult {
  success: boolean;
  data?: AdminUserProfile;
  error?: string;
}

export async function getProfileAction(accessToken: string): Promise<ProfileResult> {
  try {
    const profile = await getProfile(accessToken);
    return { success: true, data: profile };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to get profile' };
  }
}

export interface RefreshResult {
  success: boolean;
  data?: TokenRefreshResponse;
  error?: string;
}

export async function refreshTokenAction(refreshTokenValue: string): Promise<RefreshResult> {
  try {
    const response = await refreshToken(refreshTokenValue);
    return { success: true, data: response };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { success: false, error: 'Failed to refresh token' };
  }
}
