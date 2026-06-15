import { FileUsage, Role } from '@prisma/client';

export type UserHandler = {
  name: string;
  id: string;
  email: string;
  role: Role;
  avatarFile?: FileUsage | null;
};

export type UserUpdateData = {
  name?: string;
  email?: string;
  password?: string;
  role: Role;
  icon?: string;
  removeIcon?: boolean;
  avatarFile?: unknown;
};
export type UserSearchFilters = {
  id?: string;
  name?: string;
  email?: string;
};
