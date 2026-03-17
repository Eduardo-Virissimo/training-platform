import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, AUTH_CONFIG } from '@/lib/auth';
import { getSafeRedirect } from '@/lib/url';
import { generateFingerprint } from '@/lib/fingerprint';

export async function GET(request: NextRequest) {
  const currentRefreshToken = request.cookies.get('refreshToken')?.value;
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const fingerprint = generateFingerprint(ip, userAgent);

  if (!currentRefreshToken) {
    return handleAuthFailure(request);
  }

  const redirectPath = getSafeRedirect(
    request.nextUrl.searchParams.get('redirect') || '/dashboard'
  );

    if (!currentRefreshToken) {
      return handleAuthFailure(req);
    }

  try {
    const tokens = await refreshSession(currentRefreshToken, fingerprint);

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
