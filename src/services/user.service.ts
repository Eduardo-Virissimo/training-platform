import { UserHandler, UserSearchFilters, UserUpdateData } from '@/types/user.types';
import { prisma } from '@/lib/prisma';
import { FileUsageType, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '@/errors/AppError';

export class UserService {
  static async read(filters: UserSearchFilters): Promise<UserHandler[]> {
    const where: Prisma.UserWhereInput = { ...filters };
    return await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  static async update(id: string, data: UserUpdateData) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const userPreUpdate = await this.findById(id);
    if (
      data.icon &&
      userPreUpdate?.avatarFile &&
      userPreUpdate!.avatarFile?.file.key !== data.icon
    ) {
      await prisma.file
        .delete({ where: { id: userPreUpdate!.avatarFile?.file.id } })
        .catch((err) => {
          console.log(err);
          throw new AppError('An error occurred while updating the user avatar', 500);
        });
    } else if (
      data.icon &&
      userPreUpdate?.avatarFile &&
      userPreUpdate!.avatarFile?.file.key === data.icon
    ) {
      data.icon = undefined;
    }

    const user = await prisma.user
      .update({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarFile: { select: { file: { select: { path: true } } } },
        },
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          avatarFile: data.icon
            ? {
                create: {
                  file: {
                    connect: { key: data.icon as string },
                  },
                  usageType: 'AVATAR' as FileUsageType,
                  usageId: id,
                },
              }
            : undefined,
        },
      })

      .catch((err) => {
        console.log(err);
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          throw new AppError('User not found', 404);
        }

        throw new AppError('An error occurred while updating the user', 500);
      });

    return { ...user, avatarFile: user.avatarFile?.file.path };
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } }).catch((err) => {
      throw err;
    });
  }

  static async findById(id: string) {
    return await prisma.user
      .findUnique({
        where: { id },
        include: {
          avatarFile: {
            include: { file: true },
          },
        },
      })
      .catch(() => {
        throw new AppError('User not found', 404);
      });
  }
}
