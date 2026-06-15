import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { PermissionContext } from '@/types/api.types';

export async function canCreateQuiz(ctx: PermissionContext): Promise<boolean> {
  try {
    const body = ctx.body as { moduleId?: string };

    if (!body?.moduleId) {
      throw new AppError('Module ID is required', 400);
    }

    const moduleRecord = await prisma.module.findUnique({
      where: { id: body.moduleId },
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
      select: { role: true },
    });

    if (!trackUser || (trackUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')) {
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

export async function canManageQuiz(ctx: PermissionContext<{ id: string }>): Promise<boolean> {
  try {
    const id = ctx.params?.id;

    if (!id) {
      throw new AppError('Quiz ID is required', 400);
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        modules: {
          take: 1,
          select: {
            module: {
              select: {
                trackId: true,
              },
            },
          },
        },
      },
    });

    if (!quiz || quiz.modules.length === 0) {
      throw new AppError('Quiz not found', 404);
    }

    const trackId = quiz.modules[0].module.trackId;

    const trackUser = await prisma.userTrack.findFirst({
      where: {
        trackId,
        userId: ctx.user.id,
      },
      select: { role: true },
    });

    if (!trackUser || (trackUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')) {
      throw new AppError('You are not allowed to manage this quiz', 403);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('An error occurred while checking permissions', 500);
  }
}
