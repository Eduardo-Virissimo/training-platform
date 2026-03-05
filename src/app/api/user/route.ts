'use server';
import { canUpdateUser } from '@/permissions/userPermissions';
import { response } from '@/lib/http/response';
import { UserService } from '@/services/userService';
import { UserSearchFilters, UserUpdateData } from '@/types/api.types';
import { apiHandler } from '@/lib/http/api-handler';
import { updateUserSchema } from '@/schemas/user.schema';
import { Role } from '@prisma/client';

export const GET = apiHandler({
  auth: true,
  role: Role.ADMIN,
  async handler({ req }) {
    const { searchParams } = new URL(req.url);
    const filters: UserSearchFilters = {};

    if (searchParams.get('name')) {
      filters.name = searchParams.get('name') ?? undefined;
    }
    if (searchParams.get('email')) {
      filters.email = searchParams.get('email') ?? undefined;
    }
    if (searchParams.get('id')) {
      filters.id = searchParams.get('id') ?? undefined;
    }

    const users = await UserService.read(filters);

    return response.ok(users);
  },
});

export const PUT = apiHandler({
  auth: true,
  body: updateUserSchema,
  permissions: canUpdateUser,
  handler: async ({ req, body }) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const updatedUser = await UserService.update(id!, body as UserUpdateData);
    return response.ok(updatedUser);
  },
});

export const DELETE = apiHandler({
  auth: true,
  permissions: canUpdateUser,
  handler: async ({ req }) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await UserService.delete(id!);
    return response.noContent();
  },
});
