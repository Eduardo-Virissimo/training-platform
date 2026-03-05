'use server';
import { requireRole } from '@/permissions/requireRole';
import { canUpdateUser } from '@/permissions/userPermissions';
import { response } from '@/lib/http/response';
import { UserService } from '@/services/userService';
import { UserSearchFilters } from '@/types/api.types';

export const GET = requireRole(async (req) => {
  const { searchParams } = new URL(req.url);
  const filters: UserSearchFilters = {};

  if (searchParams.get('name')) {
    filters.name = searchParams.get('name') ?? undefined;
  }
  if (searchParams.get('email')) {
    filters.email = searchParams.get('email') ?? undefined;
  }

  const users = await UserService.read(filters);

  return response.ok(users);
}, 'ADMIN');

export const PUT = canUpdateUser(async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();

  try {
    const updatedUser = await UserService.update(id!, body);
    return response.ok(updatedUser);
  } catch {
    return response.internalError('An error occurred while updating the user');
  }
});

export const DELETE = canUpdateUser(async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    await UserService.delete(id!);

    return response.noContent();
  } catch {
    return response.internalError('An error occurred while deleting the user');
  }
});
