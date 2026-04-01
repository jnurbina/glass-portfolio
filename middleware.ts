import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('convex-dev-session');
  const pathname = request.nextUrl.pathname;

  // Protect /leetdash and /leetdash/* routes
  if (pathname.startsWith('/leetdash') && pathname !== '/leetdash/login') {
    if (!currentUser) {
      return NextResponse.redirect(new URL('/leetdash/login', request.url));
    }
  }

  // Allow other routes to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(api|trpc)(.*)', '/leetdash/:path*'],
};