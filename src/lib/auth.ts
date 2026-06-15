import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import crypto from 'crypto';
import { isUserBlacklisted, blacklistUserTokens } from './redis/black-list';

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
    sameSite: 'strict' as const,
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

export async function createRefreshToken(
  userId: string,
  familyId?: string,
  fingerprint?: string
): Promise<string> {
  const tokenFamilyId = familyId || crypto.randomUUID();

  const token = await new SignJWT({ userId, familyId: tokenFamilyId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.refreshTokenExpiresIn}s`)
    .sign(secret);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      familyId: tokenFamilyId,
      fingerprint: fingerprint || null,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.refreshTokenExpiresIn * 1000),
    },
  });

  return token;
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const JWTPayload = payload as unknown as JWTPayload;

    const blacklisted = await isUserBlacklisted(JWTPayload.id);
    if (blacklisted) {
      return null;
    }

    return JWTPayload;
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

export async function refreshSession(token: string, fingerprint: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.userId as string;
      const familyId = payload.familyId as string;

      if (userId) {
        await handleTokenTheft(userId, familyId, 'TOKEN_REUSE_NOT_FOUND');
      }
    } catch {}
    return null;
  }

  if (stored.isUsed) {
    await handleTokenTheft(stored.userId, stored.familyId, 'TOKEN_REUSE_ALREADY_USED');
    return null;
  }

  if (stored.user.isBlocked) {
    await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });
    return null;
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  if (stored.fingerprint && fingerprint && stored.fingerprint !== fingerprint) {
    await handleTokenTheft(stored.userId, stored.familyId, 'FINGERPRINT_MISMATCH');
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { isUsed: true },
  });

  const newRefreshToken = await createRefreshToken(stored.userId, stored.familyId, fingerprint);

  const newAccessToken = await createAccessToken({
    id: stored.user.id,
    email: stored.user.email,
    name: stored.user.name,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function handleTokenTheft(userId: string, familyId: string | undefined, reason: string) {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedReason: `Possible token theft detected: ${reason}`,
        blockedAt: new Date(),
      },
    });

    await tx.refreshToken.deleteMany({
      where: { userId },
    });

    await tx.securityLog.create({
      data: {
        userId,
        action: 'ACCOUNT_BLOCKED',
        detail: `Automatic locking: ${reason}. Family: ${familyId || 'N/A'}`,
      },
    });
  });

  await blacklistUserTokens(userId);
}
