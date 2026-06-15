import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import { UserHandler } from '@/types/user.types';

export const TrainingUserService = {
  async addUserToTraining(trainingId: string, email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userTraining = await prisma.userTraining
      .create({
        data: {
          trainingId,
          userId: user.id,
          role: 'STUDENT',
          status: 'PENDING',
        },
      })
      .catch((error) => {
        if (error.code === 'P2002') {
          throw new AppError('User is already added to this training', 400);
        }
        throw new AppError('Failed to add user to training', 500);
      });

    return userTraining;
  },

  async removeUserFromTraining(trainingUserId: string) {
    await prisma.userTraining
      .delete({
        where: {
          id: trainingUserId,
        },
      })
      .catch((e) => {
        throw new AppError('Failed to remove user from training', 500);
      });
  },

  async getUsersInTraining(trainingId: string) {
    const users = await prisma.userTraining
      .findMany({
        where: { trainingId },
        include: {
          user: true,
        },
      })
      .catch((e) => {
        throw new AppError('Failed to get users in training', 500);
      });
    return users;
  },
};
