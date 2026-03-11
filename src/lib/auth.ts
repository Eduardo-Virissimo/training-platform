import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const AUTH_CONFIG = {
  accessTokenExpiresIn: 60 * 15,
  refreshTokenExpiresIn: 60 * 60 * 24 * 15,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
};
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.accessTokenExpiresIn}s`)
    .sign(secret);
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');

  await prisma.refreshToken.deleteMany({ where: { userId } });

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.refreshTokenExpiresIn * 1000),
    },
  });

  return token;
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token ? verifyAccessToken(token) : null;
}

export async function getUserFromSession() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, avatarFile: true },
  });
}

export async function refreshSession(token: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    return null;
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const newRefreshToken = await createRefreshToken(stored.userId);
  const newAccessToken = await createAccessToken({
    id: stored.user.id,
    email: stored.user.email,
    name: stored.user.name,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
