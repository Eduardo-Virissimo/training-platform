import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { AppError } from '@/errors/AppError';
import { LoginInput } from '@/schemas/auth.schema';
import { resetBruteForce } from '@/lib/redis/rate-limit';

export async function authenticateUser(
  { email, password }: LoginInput,
  identifier: string,
  fingerprint: string
) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.isBlocked) {
    throw new AppError('Blocked user because of suspicious activity', 403);
  }

  await resetBruteForce(identifier);

  const accessToken = await createAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  const refreshToken = await createRefreshToken(user.id, undefined, fingerprint);

  await prisma.securityLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ip: identifier.split(':')[0],
    },
  });

  return { accessToken, refreshToken };
}
