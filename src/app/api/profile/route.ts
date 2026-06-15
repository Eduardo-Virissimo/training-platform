import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { getUserFromSession } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
});

export const PUT = apiHandler({
  auth: true,
  body: updateProfileSchema,
  handler: async ({ body }) => {
    const user = await getUserFromSession();

    if (!user) {
      return response.error('Usuário não autenticado', 401);
    }

    if (!body) {
      return response.error('Dados inválidos', 400);
    }

    // Atualizar diretamente no Prisma para evitar dependência do UserService
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return response.ok(updatedUser);
  },
});
