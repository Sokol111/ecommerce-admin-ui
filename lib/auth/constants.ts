export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'auth_access_token_expires_at';

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});
