import { z } from 'zod';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

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

export type HandlerOptions<T> = {
  body?: z.ZodSchema<T>;
  auth?: boolean;
  role?: string;
  permissions?: (ctx: PermissionContext) => boolean | Promise<boolean>;
  handler: (ctx: { req: Request; body?: T; user?: UserHandler }) => Promise<NextResponse>;
};

export type PermissionContext = {
  user: UserHandler;
  body: unknown;
  req: Request;
};
