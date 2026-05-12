import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const deleteMemberSchema = z.object({
  trackId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const DELETE = apiHandler({
  params: deleteMemberSchema,
  handler: async ({ params }) => {
    if (!params) {
      return response.error('Parâmetros inválidos', 400);
    }

    const user = await getUserFromSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      return response.error('Acesso negado', 403);
    }

    // Verificar se o membro existe
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

    // Excluir o membro
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
