'use server';

import { TokenRefreshResponse } from '@sokol111/ecommerce-auth-service-api';
import { cookies } from 'next/headers';
import {
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getCookieOptions,
} from './constants';

export async function saveTokensToCookies(tokens: TokenRefreshResponse): Promise<void> {
  const cookieStore = await cookies();
  const cookieOptions = getCookieOptions();
  const expiresAt = new Date(tokens.expiresAt).getTime();

  // Access token - час життя з API
  cookieStore.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    ...cookieOptions,
    maxAge: tokens.expiresIn,
  });

  // Access token expiry timestamp
  cookieStore.set(ACCESS_TOKEN_EXPIRES_AT_KEY, expiresAt.toString(), {
    ...cookieOptions,
    httpOnly: false,
    maxAge: tokens.expiresIn,
  });

  // Refresh token - час життя з API
  cookieStore.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
    ...cookieOptions,
    maxAge: tokens.refreshExpiresIn,
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value ?? null;
}

export async function clearTokenCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(ACCESS_TOKEN_EXPIRES_AT_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
}

export async function getAccessTokenExpiresAt(): Promise<number | null> {
  const cookieStore = await cookies();
  const expiresAt = cookieStore.get(ACCESS_TOKEN_EXPIRES_AT_KEY)?.value;
  return expiresAt ? parseInt(expiresAt, 10) : null;
}
