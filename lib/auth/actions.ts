'use server';

import { login as apiLogin, getProfile, logout, refreshToken } from '@/lib/client/auth-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import { AdminAuthResponse, AdminUserProfile } from '@sokol111/ecommerce-auth-service-api';
import {
  clearTokenCookies,
  getAccessToken,
  getAccessTokenExpiresAt,
  getRefreshToken,
  saveTokensToCookies,
} from './cookie-storage';

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult<AdminAuthResponse>> {
  try {
    const response = await apiLogin({ email, password });

    await saveTokensToCookies(response);

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Invalid email or password') };
  }
}

export async function getProfileAction(): Promise<
  ActionResult<{ user: AdminUserProfile; expiresIn: number }>
> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: { title: 'Not authenticated', status: 401 } };
    }

    const profile = await getProfile(token);

    // Get token expiry from cookie
    const expiresAt = await getAccessTokenExpiresAt();
    const expiresIn = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;

    return { success: true, data: { user: profile, expiresIn } };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to get profile') };
  }
}

export async function refreshTokenAction(): Promise<ActionResult<{ expiresIn: number }>> {
  try {
    const token = await getRefreshToken();
    if (!token) {
      await clearTokenCookies();
      return { success: false, error: { title: 'No refresh token', status: 401 } };
    }

    const tokens = await refreshToken(token);
    await saveTokensToCookies(tokens);

    return { success: true, data: { expiresIn: tokens.expiresIn } };
  } catch (error) {
    await clearTokenCookies();
    return { success: false, error: toProblem(error, 'Failed to refresh token') };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await logout();
  } catch {
    // Ignore errors - clear cookies anyway
  }
  await clearTokenCookies();
}
