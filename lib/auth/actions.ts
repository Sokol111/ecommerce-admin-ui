'use server';

import { login as apiLogin, getProfile, refreshToken } from '@/lib/client/auth-client';
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

    // Зберігаємо токени в cookies
    await saveTokensToCookies(response);

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Invalid email or password') };
  }
}

export async function getProfileAction(): Promise<ActionResult<AdminUserProfile>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: { title: 'Not authenticated', status: 401 } };
    }
    const profile = await getProfile(token);
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to get profile') };
  }
}

export async function refreshTokenAction(): Promise<ActionResult<{ expiresIn: number }>> {
  try {
    const token = await getRefreshToken();
    if (!token) {
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

export async function getTokenExpiresInAction(): Promise<number | null> {
  const expiresAt = await getAccessTokenExpiresAt();
  if (!expiresAt) return null;

  // Повертаємо скільки секунд залишилось до закінчення
  const expiresInMs = expiresAt - Date.now();
  return expiresInMs > 0 ? Math.floor(expiresInMs / 1000) : null;
}

export async function logoutAction(): Promise<void> {
  await clearTokenCookies();
}
