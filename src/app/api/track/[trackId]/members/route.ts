import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const getMembersSchema = z.object({
  trackId: z.string().uuid(),
});

export const GET = apiHandler({
  params: getMembersSchema,
  handler: async ({ params }) => {
    if (!params) {
      return response.error('Parâmetros inválidos', 400);
    }

    const user = await getUserFromSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      return response.error('Acesso negado', 403);
    }

    const members = await prisma.userTrack.findMany({
      where: {
        trackId: params.trackId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return response.ok({
      members: members.map((member) => ({
        id: member.id,
        userId: member.userId,
        trackId: member.trackId,
        role: member.role,
        status: member.status,
        user: member.user,
      })),
    });
  },
});
