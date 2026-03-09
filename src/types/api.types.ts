import { z } from 'zod';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { UserHandler } from './user.types';

export type ApiResponse<T> = {
  msg?: string;
  data?: T;
  error?: string;
};

export type HandlerOptions<T, P> = {
  body?: z.ZodSchema<T>;
  auth?: boolean;
  role?: Role;
  params?: z.ZodSchema<P>;
  permissions?: (ctx: PermissionContext) => boolean | Promise<boolean>;
  handler: (ctx: {
    req: Request;
    body?: T;
    user?: UserHandler;
    params?: P;
  }) => Promise<NextResponse>;
};

export type PermissionContext = {
  user: UserHandler;
  body: unknown;
  req: Request;
};

export type TrackCreateData = {
  title: string;
  description?: string;
  userId: string;
};

export type TrackUpdateData = {
  title?: string;
  description?: string;
};

export type TrackSearchFilters = {
  id?: string;
  title?: string;
};
