import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Re-enable auth gate once Convex Auth is properly wired up
  // const currentUser = request.cookies.get('convex-dev-session');
  // const pathname = request.nextUrl.pathname;
  // if (pathname.startsWith('/leetdash') && pathname !== '/leetdash/login') {
  //   if (!currentUser) {
  //     return NextResponse.redirect(new URL('/leetdash/login', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(api|trpc)(.*)', '/leetdash/:path*'],
};