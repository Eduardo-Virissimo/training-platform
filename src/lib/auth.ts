import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';
import { User } from '@prisma/client';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function createRefreshToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');

  // limpa tokens antigos do usuário
  await prisma.refreshToken.deleteMany({ where: { userId } });

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function getUserFromSession(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;
  return user;
}
