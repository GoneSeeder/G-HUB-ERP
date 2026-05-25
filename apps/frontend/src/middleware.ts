import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'ghub_access_token';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login');
  const isPublicDisplayRoute =
    pathname === '/lecture-monitor' ||
    pathname.startsWith('/lecture-monitor/') ||
    pathname === '/information/lecture-room/display' ||
    pathname.startsWith('/information/lecture-room/display/');
  const isProtectedRoute =
    !isPublicDisplayRoute &&
    (pathname.startsWith('/hub') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/information'));

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/hub', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/hub/:path*', '/admin/:path*', '/information/:path*', '/lecture-monitor', '/lecture-monitor/:path*'],
};
