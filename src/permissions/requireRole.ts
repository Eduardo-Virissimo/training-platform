import { AppError } from '@/errors/AppError';
import { Role } from '@prisma/client';

export const ROLE_HIERARCHY = {
  USER: 1,
  INSTRUCTOR: 2,
  ADMIN: 3,
} as const;

export function checkRole(userRole: Role, requiredRole: Role) {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  if (!userLevel || userLevel < requiredLevel) {
    throw new AppError('Forbidden: insufficient permissions');
  }
}
