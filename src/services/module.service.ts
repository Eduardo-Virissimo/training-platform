import { AppError } from '@/errors/AppError';
import { prisma } from '../lib/prisma';
import { ModuleCreateData, ModuleSearchFilters, ModuleUpdateData } from '@/types/api.types';
import { Prisma } from '@prisma/client';
import { UserHandler } from '@/types/user.types';

export class ModuleService {
  static async create(data: ModuleCreateData) {
    try {
      const createdModule = await prisma.module.create({
        data: {
          title: data.title,
          description: data.description,
          trackId: data.trackId,
          position: data.position ?? 0,
        },
      });
      return createdModule;
    } catch {
      throw new AppError('Failed to create module', 500);
    }
  }

  static async update(id: string, data: ModuleUpdateData) {
    try {
      const updatedModule = await prisma.module.update({
        where: { id },
        data,
      });
      return updatedModule;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Module not found', 404);
      }
      throw new AppError('Failed to update module', 500);
    }
  }

  static async delete(id: string) {
    try {
      const deletedModule = await prisma.module.delete({
        where: { id },
      });
      return deletedModule;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Module not found', 404);
      }
      throw new AppError('Failed to delete module', 500);
    }
  }

  static async search(filters: ModuleSearchFilters, user: UserHandler) {
    try {
      const modules = await prisma.module.findMany({
        where: {
          ...filters,
          track: {
            userTracks: {
              some: {
                userId: user.id,
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      });
      return modules;
    } catch {
      throw new AppError('Failed to search modules', 500);
    }
  }
}
