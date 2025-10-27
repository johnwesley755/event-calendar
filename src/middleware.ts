import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, disable the middleware to allow authentication to work properly
  // We'll implement proper token checking later
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/signup', '/calendar/:path*'],
};