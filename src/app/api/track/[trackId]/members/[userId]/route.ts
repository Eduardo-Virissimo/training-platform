import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { prisma } from '@/lib/prisma';
import { canManageTrack } from '@/permissions/track.permissions';
import { Role } from '@prisma/client';
import { z } from 'zod';

const memberPathSchema = z.object({
  trackId: z.string().uuid(),
  userId: z.string().uuid(),
});

const patchMemberBodySchema = z.object({
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
});

export const DELETE = apiHandler({
  auth: true,
  params: memberPathSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageTrack,
  handler: async ({ params }) => {
    if (!params) {
      return response.error('Parâmetros inválidos', 400);
    }

    const existingMember = await prisma.userTrack.findUnique({
      where: {
        userId_trackId: {
          userId: params.userId,
          trackId: params.trackId,
        },
      },
    });

    if (!existingMember) {
      return response.error('Membro não encontrado', 404);
    }

    if (existingMember.role === 'INSTRUCTOR') {
      const otherInstructors = await prisma.userTrack.count({
        where: {
          trackId: params.trackId,
          role: 'INSTRUCTOR',
          userId: { not: params.userId },
        },
      });
      if (otherInstructors === 0) {
        return response.error('Não é possível remover o único instrutor da trilha.', 403);
      }
    }

    await prisma.userTrack.delete({
      where: {
        userId_trackId: {
          userId: params.userId,
          trackId: params.trackId,
        },
      },
    });

    return response.noContent();
  },
});

export const PATCH = apiHandler({
  auth: true,
  params: memberPathSchema,
  body: patchMemberBodySchema,
  role: Role.INSTRUCTOR,
  permissions: canManageTrack,
  handler: async ({ params, body }) => {
    if (!params || !body) {
      return response.error('Parâmetros inválidos', 400);
    }

    const existingMember = await prisma.userTrack.findUnique({
      where: {
        userId_trackId: {
          userId: params.userId,
          trackId: params.trackId,
        },
      },
    });

    if (!existingMember) {
      return response.error('Membro não encontrado', 404);
    }

    if (body.role === 'STUDENT' && existingMember.role === 'INSTRUCTOR') {
      const otherInstructors = await prisma.userTrack.count({
        where: {
          trackId: params.trackId,
          role: 'INSTRUCTOR',
          userId: { not: params.userId },
        },
      });
      if (otherInstructors === 0) {
        return response.error('A trilha precisa de ao menos um instrutor.', 400);
      }
    }

    const updated = await prisma.userTrack.update({
      where: {
        userId_trackId: {
          userId: params.userId,
          trackId: params.trackId,
        },
      },
      data: { role: body.role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return response.ok({
      id: updated.id,
      userId: updated.userId,
      trackId: updated.trackId,
      role: updated.role,
      status: updated.status,
      user: updated.user,
    });
  },
});
