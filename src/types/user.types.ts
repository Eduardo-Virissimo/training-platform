import { Role } from '@prisma/client';

export type UserHandler = {
  name: string;
  id: string;
  email: string;
  role: Role;
};

export type UserUpdateData = {
  name?: string;
  email?: string;
  password?: string;
};
export type UserSearchFilters = {
  id?: string;
  name?: string;
  email?: string;
};
