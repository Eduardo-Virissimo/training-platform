import { AppError } from '@/errors/AppError';
import { PermissionContext } from '@/types/api.types';

export function canManageUser(ctx: PermissionContext<{ id: string }>): boolean {
  const id = ctx.params?.id;

  if (!id) {
    throw new AppError('User ID is required', 400);
  }

  if (ctx.user.role != null && ctx.user.role !== 'ADMIN') {
    throw new AppError('You are not allowed to update user roles', 403);
  }

  if (ctx.user.role === 'ADMIN' || ctx.user.id === id) {
    return true;
  }

  throw new AppError('You are not allowed to update this user', 403);
}
