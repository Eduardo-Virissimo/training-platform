import { AppError } from '@/errors/AppError';
import { PermissionContext } from '@/types/api.types';

export function canManageUser(ctx: PermissionContext): boolean {
  const { searchParams } = new URL(ctx.req.url);
  const id = searchParams.get('id');
  const body = ctx.body as { id?: string; role?: string };
  if (!id) {
    throw new AppError('User ID is required', 400);
  }
  if (body.role != null && ctx.user.role !== 'ADMIN') {
    throw new AppError('You are not allowed to update user roles', 403);
  }

  if (ctx.user.role === 'ADMIN' || ctx.user.id === id) {
    return true;
  } else {
    throw new AppError('You are not allowed to update this user', 403);
  }
}
