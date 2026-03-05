import { Role } from '@prisma/client';

export type ApiResponse<T> = {
  msg?: string;
  data?: T;
  error?: string;
};

export type UserHandler = {
  name: string;
  id: string;
  email: string;
  role: Role;
};
