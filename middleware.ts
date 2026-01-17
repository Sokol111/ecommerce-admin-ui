import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const ACCESS_TOKEN_KEY = 'auth_access_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаємо статичні файли та API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  // Якщо немає токена і не публічний шлях - редірект на логін
  if (!accessToken && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Якщо є токен і на сторінці логіна - редірект на головну
  if (accessToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
