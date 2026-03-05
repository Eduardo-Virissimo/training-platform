import { Role } from '@prisma/client';

export const ROLE_HIERARCHY = {
  USER: 1,
  ADMIN: 2,
} as const;

export function checkRole(userRole: Role, requiredRole: Role) {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  if (!userLevel || userLevel < requiredLevel) {
    throw new Error('Forbidden: insufficient permissions');
  }
}
