import crypto from 'crypto';

export function generateFingerprint(ip: string, userAgent: string): string {
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').substring(0, 64);
}
