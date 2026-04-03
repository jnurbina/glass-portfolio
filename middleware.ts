import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Block LeetDash and its API routes in production
  // Vercel sets VERCEL_ENV = "production" | "preview" | "development"
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV;
  const isProduction = env === 'production';

  if (isProduction && (pathname.startsWith('/leetdash') || pathname.startsWith('/api/monitoring'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(api|trpc)(.*)', '/leetdash/:path*'],
};
