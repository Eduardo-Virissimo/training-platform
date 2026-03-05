'use server';

import { NextResponse } from 'next/server';
import { requireRole } from '@/permissions/requireRole';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types/api.types';
import { canUpdateUser } from '@/permissions/userPermissions';
import bcrypt from 'bcryptjs';
import { response } from '@/lib/http/response';

export const GET = requireRole(async (req) => {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id');
  const users = await prisma.user.findMany({
    where: { id: id ?? undefined },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  return response.ok(users);
}, 'ADMIN');

export const PUT = canUpdateUser(async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();

  if (!id) {
    return response.error('ID do usuário é obrigatório', 400);
  }

  let passwordHash: string | undefined = undefined;
  if (body.password) {
    passwordHash = await bcrypt.hash(body.password, 10);
  }

  return await prisma.user
    .update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        email: body.email ?? undefined,
        password: passwordHash ?? undefined,
      },
    })
    .then((userUpdated) => {
      return response.ok(userUpdated);
    })
    .catch((err) => {
      console.log('Error updating user:', err);
      if (err.code === 'P2025') {
        return response.notFound('User not found', 404);
      }

      return response.error('Failed to update user', 500);
    });
});
