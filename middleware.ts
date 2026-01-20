import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getCookieOptions } from '@/lib/auth/constants';
import { refreshToken } from '@/lib/client/auth-client';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаємо статичні файли та API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshTokenValue = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // Якщо є access token — пропускаємо
  if (accessToken) {
    // Якщо на сторінці логіна — редірект на головну
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Якщо немає access token, але є refresh token — пробуємо оновити
  if (!accessToken && refreshTokenValue && !isPublicPath) {
    try {
      const tokens = await refreshToken(refreshTokenValue);
      const response = NextResponse.next();
      const cookieOptions = getCookieOptions();

      response.cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, {
        ...cookieOptions,
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

  // Якщо немає токенів і не публічний шлях — редірект на логін
  if (!accessToken && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
