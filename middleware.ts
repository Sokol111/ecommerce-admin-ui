import {
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getCookieOptions,
  isTokenExpired,
} from '@/lib/auth/constants';
import { refreshToken } from '@/lib/client/auth-client';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Configuration
// ============================================================================

const PUBLIC_PATHS = ['/login'];

// ============================================================================
// Helper Functions
// ============================================================================

interface AuthTokens {
  accessToken: string | undefined;
  accessTokenExpiresAt: string | undefined;
  refreshToken: string | undefined;
}

function getAuthTokens(request: NextRequest): AuthTokens {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_KEY)?.value,
    accessTokenExpiresAt: request.cookies.get(ACCESS_TOKEN_EXPIRES_AT_KEY)?.value,
    refreshToken: request.cookies.get(REFRESH_TOKEN_KEY)?.value,
  };
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function hasValidAccessToken(tokens: AuthTokens): boolean {
  return Boolean(tokens.accessToken) && !isTokenExpired(tokens.accessTokenExpiresAt);
}

function redirectToLogin(request: NextRequest, callbackPath: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', callbackPath);

  const response = NextResponse.redirect(loginUrl);

  // Clear expired/invalid auth cookies
  response.cookies.delete(ACCESS_TOKEN_KEY);
  response.cookies.delete(ACCESS_TOKEN_EXPIRES_AT_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);

  return response;
}

function redirectToHome(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/', request.url));
}

// ============================================================================
// Token Refresh
// ============================================================================

interface RefreshResult {
  success: boolean;
  response?: NextResponse;
}

async function tryRefreshTokens(refreshTokenValue: string): Promise<RefreshResult> {
  try {
    const tokens = await refreshToken(refreshTokenValue);
    const response = NextResponse.next();
    const cookieOptions = getCookieOptions();
    const expiresAt = new Date(tokens.expiresAt).getTime();

    // Access Token
    response.cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn,
    });

    // Access Token expiry time (accessible from JS)
    response.cookies.set(ACCESS_TOKEN_EXPIRES_AT_KEY, expiresAt.toString(), {
      ...cookieOptions,
      httpOnly: false,
      maxAge: tokens.expiresIn,
    });

    // Refresh Token
    response.cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: tokens.refreshExpiresIn,
    });

    return { success: true, response };
  } catch {
    return { success: false };
  }
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokens = getAuthTokens(request);
  const isPublic = isPublicPath(pathname);

  // 1. User is already authenticated
  if (hasValidAccessToken(tokens)) {
    // Authenticated user on login page → redirect to home
    if (pathname === '/login') {
      return redirectToHome(request);
    }
    return NextResponse.next();
  }

  // 2. Access token missing/expired, but refresh token exists → try to refresh
  if (tokens.refreshToken && !isPublic) {
    const refreshResult = await tryRefreshTokens(tokens.refreshToken);
    if (refreshResult.success && refreshResult.response) {
      return refreshResult.response;
    }
    // Refresh failed → proceed to login redirect
  }

  // 3. Unauthenticated on protected route → redirect to login
  if (!isPublic) {
    return redirectToLogin(request, pathname);
  }

  // 4. Public route → allow access
  return NextResponse.next();
}

// ============================================================================
// Route Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - api (API routes)
     * - Static files (favicon.ico, images, etc.)
     */
    '/((?!_next|api|.*\\..*).*)',
  ],
};
