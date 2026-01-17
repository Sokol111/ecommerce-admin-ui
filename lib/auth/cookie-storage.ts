'use server';

import { TokenRefreshResponse } from '@sokol111/ecommerce-auth-service-api';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function saveTokensToCookies(tokens: TokenRefreshResponse): Promise<void> {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  // Access token - час життя з API
  cookieStore.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
    ...cookieOptions,
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
  cookieStore.delete(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
}
