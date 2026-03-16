import { prisma } from '@/lib/prisma';
import { PermissionContext } from '@/types/api.types';
import { AppError } from '@/errors/AppError';

export async function canManageTraining(ctx: PermissionContext): Promise<boolean> {
  try {
    const { searchParams } = new URL(ctx.req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new AppError('Training ID is required', 400);
    }

    const trainingUser = await prisma.userTraining.findFirst({
      where: {
        trainingId: id,
        role: 'INSTRUCTOR',
        userId: ctx.user.id,
      },
      select: {
        role: true,
        user: true,
        training: true,
      },
    });

    if (
      !trainingUser ||
      (trainingUser && trainingUser.role !== 'INSTRUCTOR' && ctx.user.role !== 'ADMIN')
    ) {
      throw new AppError('You are not allowed to manage this training', 403);
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('An error occurred while checking permissions', 500);
  }
}
