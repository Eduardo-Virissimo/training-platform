import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { createTraining } from '@/types/training.types';
import { UserHandler } from '@/types/user.types';

export const TrainingService = {
  async createTraining(data: createTraining) {
    return await prisma.training.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        tracks: data.trackId
          ? {
              create: {
                trackId: data.trackId,
                position: 0,
              },
            }
          : undefined,
        userTrainings: {
          create: {
            user: {
              connect: {
                id: data.userId,
              },
            },
            role: 'INSTRUCTOR',
            status: 'COMPLETED',
          },
        },
      },
    });
  },

  async getTrainingByFilters(id?: string, userId?: string, user: UserHandler | null = null) {
    if (userId && userId !== user?.id && user?.role !== 'ADMIN') {
      throw new AppError('You are not allowed to access this training.', 403);
    }
    if (user?.role !== 'ADMIN') {
      userId = user?.id;
    }

    return await prisma.training
      .findMany({
        where: {
          id,
          userTrainings: userId
            ? {
                some: {
                  userId,
                },
              }
            : undefined,
        },
      })
      .catch(() => {
        throw new AppError('Training not found', 404);
      });
  },

  async deleteTraining(id: string) {
    await prisma.training
      .delete({
        where: { id },
      })
      .catch(() => {
        throw new AppError('Training not found', 404);
      });
  },

  async updateTraining(id: string, data: createTraining) {
    const training = await prisma.training
      .update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
        },
      })
      .catch(() => {
        throw new AppError('Training not found', 404);
      });
    return training;
  },
};
