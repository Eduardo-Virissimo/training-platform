import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { TrackService } from './track.service.';
import { UserService } from './user.service';

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
      const track = await TrackService.search({ id: trackId });

      return track;
    } catch (error) {
      throw new AppError('Failed to add user to track', 500);
    }
  },
};
