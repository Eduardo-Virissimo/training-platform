import { AppError } from '@/errors/AppError';
import { prisma } from '../lib/prisma';
import { TrackCreateData, TrackSearchFilters, TrackUpdateData } from '@/types/api.types';
import { Prisma } from '@prisma/client';
import { UserHandler } from '@/types/user.types';

export class TrackService {
  static async create(data: TrackCreateData) {
    try {
      const track = await prisma.track.create({
        data: {
          title: data.title,
          description: data.description,
          userTracks: {
            create: {
              userId: data.userId,
              role: 'INSTRUCTOR',
            },
          },
        },
      });
      return track;
    } catch (error) {
      throw new AppError('Failed to create track', 500);
    }
  }

  static async update(id: string, data: TrackUpdateData) {
    try {
      const track = await prisma.track.update({
        where: { id },
        data,
      });
      return track;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Track not found', 404);
      }
      throw new AppError('Failed to update track', 500);
    }
  }

  static async delete(id: string) {
    try {
      const track = await prisma.track.delete({
        where: { id },
      });
      return track;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Track not found', 404);
      }
      throw new AppError('Failed to delete track', 500);
    }
  }

  static async search(filters: TrackSearchFilters, user: UserHandler) {
    try {
      const tracks = await prisma.track.findMany({
        where: {
          ...filters,
          userTracks: {
            some: {
              userId: user.id,
            },
          },
        },
      });
      return tracks;
    } catch (error) {
      throw new AppError('Failed to search tracks', 500);
    }
  }

  static async getById(id: string) {
    try {
      const track = await prisma.track.findUnique({
        where: { id },
      });
      return track;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Track not found', 404);
      }
      throw new AppError('Failed to get track', 500);
    }
  }
}
