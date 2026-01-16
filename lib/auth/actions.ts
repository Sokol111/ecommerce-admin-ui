'use server';

import { login as apiLogin, getProfile, refreshToken } from '@/lib/client/auth-client';
import { ActionResult } from '@/lib/types/action-result';
import { toProblem } from '@/lib/types/problem';
import {
  AdminAuthResponse,
  AdminUserProfile,
  TokenRefreshResponse,
} from '@sokol111/ecommerce-auth-service-api';

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult<AdminAuthResponse>> {
  try {
    const response = await apiLogin({ email, password });
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Invalid email or password') };
  }
}

export async function getProfileAction(
  accessToken: string
): Promise<ActionResult<AdminUserProfile>> {
  try {
    const profile = await getProfile(accessToken);
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to get profile') };
  }
}

export async function refreshTokenAction(
  refreshTokenValue: string
): Promise<ActionResult<TokenRefreshResponse>> {
  try {
    const response = await refreshToken(refreshTokenValue);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: toProblem(error, 'Failed to refresh token') };
  }
}
