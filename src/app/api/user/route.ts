'use server';
import { canUpdateUser } from '@/permissions/userPermissions';
import { response } from '@/lib/http/response';
import { UserService } from '@/services/userService';
import { UserSearchFilters, UserUpdateData } from '@/types/api.types';
import { apiHandler } from '@/lib/http/api-handler';
import { updateUserSchema, userFiltersSchema, userParamsSchema } from '@/schemas/user.schema';
import { Role } from '@prisma/client';

export const GET = apiHandler({
  auth: true,
  params: userFiltersSchema,
  role: Role.ADMIN,
  handler: async ({ req, params }) => {
    const users = await UserService.read(params as UserSearchFilters);

    return response.ok(users);
  },
});

export const PUT = apiHandler({
  auth: true,
  params: userParamsSchema,
  body: updateUserSchema,
  permissions: canUpdateUser,
  handler: async ({ req, body, params }) => {
    const id = params?.id;
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
