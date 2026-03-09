import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { jwtVerify } from 'jose';

const authRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard'];
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get('accessToken')?.value;
  const refresh = request.cookies.get('refreshToken')?.value;

  const session = access ? await verifyAccessToken(access) : null;
  const isAuthenticated = !!session;

  if (isAuthenticated && authRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthenticated && protectedRoutes.some((r) => pathname.startsWith(r))) {
    if (refresh) {
      const url = new URL('/api/auth/refresh', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const login = new URL('/login', request.url);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
