import { AppError } from '@/errors/AppError';
import { PermissionContext } from '@/types/api.types';

export function canManageUser(ctx: PermissionContext): boolean {
  try {
    const { searchParams } = new URL(ctx.req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new AppError('User ID is required', 400);
    }
    if (ctx.user.role === 'ADMIN' || ctx.user.id === id) {
      return true;
    } else {
      throw new AppError('You are not allowed to update this user', 403);
    }
  } catch {
    throw new AppError('An error occurred while checking permissions', 500);
  }
}
