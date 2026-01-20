import {
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getCookieOptions,
} from '@/lib/auth/constants';
import { refreshToken } from '@/lib/client/auth-client';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const TOKEN_EXPIRY_BUFFER_MS = 30000; // 30 секунд буфер

function isTokenExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return true;
  const expiresAtMs = parseInt(expiresAt, 10);
  // Додаємо буфер, щоб оновити токен трохи раніше
  return expiresAtMs < Date.now() + TOKEN_EXPIRY_BUFFER_MS;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаємо статичні файли та API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const accessTokenExpiresAt = request.cookies.get(ACCESS_TOKEN_EXPIRES_AT_KEY)?.value;
  const refreshTokenValue = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // Якщо є валідний access token — пропускаємо
  if (accessToken && !isTokenExpired(accessTokenExpiresAt)) {
    // Якщо на сторінці логіна — редірект на головну
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Якщо немає access token або він expired, але є refresh token — пробуємо оновити
  if (refreshTokenValue && !isPublicPath) {
    try {
      const tokens = await refreshToken(refreshTokenValue);
      const response = NextResponse.next();
      const cookieOptions = getCookieOptions();
      const expiresAt = Date.now() + tokens.expiresIn * 1000;

      response.cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
        ...cookieOptions,
        maxAge: tokens.expiresIn,
      });

      response.cookies.set(ACCESS_TOKEN_EXPIRES_AT_KEY, expiresAt.toString(), {
        ...cookieOptions,
        httpOnly: false, // Можна читати з JS якщо потрібно
        maxAge: tokens.expiresIn,
      });

      response.cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
        ...cookieOptions,
        maxAge: tokens.refreshExpiresIn,
      });

      return response;
    } catch {
      // Refresh не вдався — перенаправляємо на логін нижче
    }
  }

  // Якщо немає токенів (або expired) і не публічний шлях — редірект на логін
  if ((!accessToken || isTokenExpired(accessTokenExpiresAt)) && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
