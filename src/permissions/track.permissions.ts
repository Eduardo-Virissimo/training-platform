import { prisma } from '@/lib/prisma';
import { PermissionContext } from '@/types/api.types';
import { AppError } from '@/errors/AppError';

export function canManageTrack(ctx: PermissionContext): boolean {
  try {
    const { searchParams } = new URL(ctx.req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new AppError('Track ID is required', 400);
    }

    const trackUser = prisma.userTrack.findFirst({
      where: {
        trackId: id,
        userId: ctx.user.id,
      },
    });

    if (!trackUser && ctx.user.role !== 'ADMIN') {
      throw new AppError('You are not allowed to manage this track', 403);
    }

    return true;
  } catch {
    throw new AppError('An error occurred while checking permissions', 500);
  }
}
