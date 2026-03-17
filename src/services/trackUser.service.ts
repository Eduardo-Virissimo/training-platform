import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { TrackService } from './track.service.';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

export const TrackUserService = {
  async addUserToTrack(trackId: string, email: string) {
    const user = await UserService.read({ email });
    console.error('Error adding user to track:', trackId);

    try {
      await prisma.userTrack.create({
        data: {
          track: {
            connect: { id: trackId },
          },
          user: {
            connect: { id: user[0].id },
          },
          role: 'STUDENT',
        },
      });
      const track = await TrackService.getById(trackId);

      return track;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('User is already enrolled in this track', 409);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('User or track not found', 404);
      }

      throw new AppError('Failed to add user to track', 500);
    }
  },

  async removeUserFromTrack(id: string) {
    const trackUser = await this.getTrackUser(id);

    if (!trackUser) {
      throw new AppError('Track user not found', 404);
    }
    if (trackUser?.role === 'INSTRUCTOR') {
      throw new AppError('You cannot remove an instructor from the track', 403);
    }

    try {
      await prisma.userTrack.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new AppError('Failed to remove user from track', 500);
    }
  },

  async getTrackUsers(trackId: string) {
    try {
      const trackUsers = await prisma.userTrack.findMany({
        where: {
          trackId,
        },
      });

      return trackUsers;
    } catch (error) {
      console.log(error);
      throw new AppError('Failed to get track users', 500);
    }
  },

  async getTrackUser(trackUserId: string) {
    try {
      const trackUser = await prisma.userTrack.findUnique({
        where: {
          id: trackUserId,
        },
      });
      return trackUser;
    } catch (error) {
      console.log(error);
      throw new AppError('Failed to get track user', 500);
    }
  },
};
