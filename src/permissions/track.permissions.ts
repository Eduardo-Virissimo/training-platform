import { prisma } from '@/lib/prisma';
import { PermissionContext } from '@/types/api.types';
import { AppError } from '@/errors/AppError';

export async function canManageTrack(ctx: PermissionContext<{ id: string }>): Promise<boolean> {
  try {
    const id = ctx.params?.id;

    if (!id) {
      throw new AppError('Track ID is required', 400);
    }

    const trackUser = await prisma.userTrack.findFirst({
      where: {
        trackId: id,
        userId: ctx.user.id,
      },
      select: {
        role: true,
        user: true,
        track: true,
      },
    });

    if (!trackUser || (trackUser && trackUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')) {
      throw new AppError('You are not allowed to manage this track', 403);
    }

    return true;
  } catch {
    throw new AppError('An error occurred while checking permissions', 500);
  }
}
