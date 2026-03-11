import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, AUTH_CONFIG } from '@/lib/auth';
import { getSafeRedirect } from '@/lib/url';
import { apiHandler } from '@/lib/http/api-handler';

export const GET = apiHandler({
  handler: async ({ req }) => {
    const currentRefreshToken = req.cookies.get('refreshToken')?.value;
    const redirectPath = getSafeRedirect(req.nextUrl.searchParams.get('redirect') || '/dashboard');

    if (!currentRefreshToken) {
      return handleAuthFailure(req);
    }

    try {
      const tokens = await refreshSession(currentRefreshToken);

      if (!tokens) {
        return handleAuthFailure(req);
      }

      const response = NextResponse.redirect(new URL(redirectPath, req.url));

      response.cookies.set('accessToken', tokens.accessToken, {
        ...AUTH_CONFIG.cookieOptions,
        maxAge: AUTH_CONFIG.accessTokenExpiresIn,
      });

      response.cookies.set('refreshToken', tokens.refreshToken, {
        ...AUTH_CONFIG.cookieOptions,
        maxAge: AUTH_CONFIG.refreshTokenExpiresIn,
      });

      return response;
    } catch (error) {
      console.error('Refresh Error', error);
      return handleAuthFailure(req);
    }
  },
});

function handleAuthFailure(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}
