import { prisma } from '@/lib/prisma';
import { PermissionContext } from '@/types/api.types';
import { AppError } from '@/errors/AppError';

export async function canManageModule(ctx: PermissionContext<{ id: string }>): Promise<boolean> {
  try {
    const id = ctx.params?.id;

    if (!id) {
      throw new AppError('Module ID is required', 400);
    }

    const moduleRecord = await prisma.module.findUnique({
      where: { id },
      select: { trackId: true },
    });

    if (!moduleRecord) {
      throw new AppError('Module not found', 404);
    }

    const trackUser = await prisma.userTrack.findFirst({
      where: {
        trackId: moduleRecord.trackId,
        userId: ctx.user.id,
      },
      select: {
        role: true,
      },
    });

    if (!trackUser || (trackUser && trackUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')) {
      throw new AppError('You are not allowed to manage this module', 403);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('An error occurred while checking permissions', 500);
  }
}

export async function canCreateModule(ctx: PermissionContext): Promise<boolean> {
  try {
    const body = ctx.body as { trackId?: string };

    if (!body?.trackId) {
      throw new AppError('Track ID is required', 400);
    }

    const trackUser = await prisma.userTrack.findFirst({
      where: {
        trackId: body.trackId,
        userId: ctx.user.id,
      },
      select: {
        role: true,
      },
    });

    if (!trackUser || (trackUser && trackUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')) {
      throw new AppError('You are not allowed to manage this track', 403);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('An error occurred while checking permissions', 500);
  }
}
