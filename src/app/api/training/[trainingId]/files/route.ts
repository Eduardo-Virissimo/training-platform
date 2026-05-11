import { response } from '@/lib/http/response';
import { apiHandler } from '@/lib/http/api-handler';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/AppError';
import { FileUsageType } from '@prisma/client';

export const GET = apiHandler({
  auth: true,
  handler: async ({ req }) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const trainingId = pathParts[pathParts.length - 2]; // Pega o trainingId da URL

    if (!trainingId) {
      throw new AppError('Missing trainingId parameter', 400);
    }

    // Buscar arquivos associados a este treinamento através da tabela FileUsage
    const files = await prisma.fileUsage.findMany({
      where: {
        usageType: FileUsageType.TRAINING,
        usageId: trainingId,
      },
      include: {
        file: {
          select: {
            id: true,
            filename: true,
            path: true,
            mimetype: true,
            size: true,
            key: true,
            createdAt: true,
          },
        },
      },
    });

    const fileList = files.map((fileUsage) => fileUsage.file);

    return response.ok(fileList);
  },
});
