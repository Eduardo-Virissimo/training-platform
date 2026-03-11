import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { createTraining } from '@/types/training.types';

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
  async getTrainingById(id: string) {
    return await prisma.training
      .findUnique({
        where: { id },
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
