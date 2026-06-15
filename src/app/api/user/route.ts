'use server';
import { canManageUser } from '@/permissions/userPermissions';
import { response } from '@/lib/http/response';
import { UserService } from '@/services/user.service';
import { UserSearchFilters, UserUpdateData } from '@/types/user.types';
import { apiHandler } from '@/lib/http/api-handler';
import { updateUserSchema, userFiltersSchema } from '@/schemas/user.schema';
import { Role } from '@prisma/client';
import { idParamSchema } from '@/schemas/schemas';

export const GET = apiHandler({
  auth: true,
  params: userFiltersSchema,
  role: Role.ADMIN,
  handler: async ({ params }) => {
    const users = await UserService.read(params as UserSearchFilters);

    return response.ok(users);
  },
});

export const PUT = apiHandler({
  auth: true,
  params: idParamSchema,
  body: updateUserSchema,
  permissions: canManageUser,
  handler: async ({ body, params }) => {
    const id = params?.id;
    const updatedUser = await UserService.update(id!, body as UserUpdateData);
    return response.ok(updatedUser);
  },
});

export const DELETE = apiHandler({
  auth: true,
  params: idParamSchema,
  permissions: canManageUser,
  handler: async ({ params }) => {
    const id = params?.id;

    await UserService.delete(id!);
    return response.noContent();
  },
});
