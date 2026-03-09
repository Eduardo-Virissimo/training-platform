import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { response } from '@/lib/http/response';
import { registerSchema } from '@/schemas/auth.schema';
import { apiHandler } from '@/lib/http/api-handler';
import { AppError } from '@/errors/AppError';

export const POST = apiHandler({
  body: registerSchema,
  handler: async ({ body }) => {
    const { name, email, password } = body!;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return response.created(user);
  },
});
