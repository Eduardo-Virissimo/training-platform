import { UserHandler, UserSearchFilters, UserUpdateData } from '@/types/api.types';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UserService {
  static async read(filters: UserSearchFilters): Promise<UserHandler[]> {
    const where: Prisma.UserWhereInput = { ...filters };
    return await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  static async update(id: string, data: UserUpdateData): Promise<UserHandler> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user
      .update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true },
      })
      .catch((err) => {
        throw err;
      });
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } }).catch((err) => {
      throw err;
    });
  }
}
