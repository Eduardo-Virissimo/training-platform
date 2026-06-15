import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, AUTH_CONFIG } from '@/lib/auth';
import { getSafeRedirect } from '@/lib/url';
import { generateFingerprint } from '@/lib/fingerprint';
import { checkRefreshRateLimit } from '@/lib/redis/rate-limit';
import { getClientIp, getUserAgent } from '@/lib/request-meta';

export async function GET(request: NextRequest) {
  const currentRefreshToken = request.cookies.get('refreshToken')?.value;
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);
  const fingerprint = generateFingerprint(ip, userAgent);

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite === 'cross-site') {
    return handleAuthFailure(request);
  }

  const { allowed } = await checkRefreshRateLimit(ip);

  if (!allowed) {
    return handleAuthFailure(request);
  }

  if (!currentRefreshToken) {
    return handleAuthFailure(request);
  }

  const redirectPath = getSafeRedirect(
    request.nextUrl.searchParams.get('redirect') || '/dashboard'
  );

  try {
    const tokens = await refreshSession(currentRefreshToken, fingerprint);

    if (!tokens) {
      return handleAuthFailure(request);
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url));

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
    return handleAuthFailure(request);
  }
}

function handleAuthFailure(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}
