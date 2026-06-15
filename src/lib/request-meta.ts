import { NextRequest } from 'next/server';

function firstIpFromForwarded(value: string | null): string {
  if (!value) return '';

  return value.split(',')[0]?.trim() || '';
}

function sanitizeIp(value: string): string {
  const v = value.trim();
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(v);
  const isIpv6 = /^[0-9a-fA-F:]+$/.test(v) && v.includes(':');
  return isIpv4 || isIpv6 ? v : 'unknown';
}

export function getClientIp(req: NextRequest): string {
  const ip =
    req.headers.get('cf-connecting-ip') ||
    firstIpFromForwarded(req.headers.get('x-forwarded-for')) ||
    req.headers.get('x-real-ip') ||
    '';

  return sanitizeIp(ip);
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}
