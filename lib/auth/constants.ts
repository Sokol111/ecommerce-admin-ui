export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'auth_access_token_expires_at';

// 30 seconds buffer for preemptive token refresh
export const TOKEN_EXPIRY_BUFFER_MS = 30000;

export function isTokenExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return true;
  const expiresAtMs = parseInt(expiresAt, 10);
  return expiresAtMs < Date.now() + TOKEN_EXPIRY_BUFFER_MS;
}

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});
