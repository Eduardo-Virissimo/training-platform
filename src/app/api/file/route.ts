import { response } from '@/lib/http/response';
import { apiHandler } from '@/lib/http/api-handler';
import { FileService } from '@/services/file.service';
import { UserHandler } from '@/types/user.types';
import { AppError } from '@/errors/AppError';
import { NextResponse } from 'next/server';
import { keyParamSchema } from '@/schemas/schemas';
import { prisma } from '@/lib/prisma';
import { FileUsageType } from '@prisma/client';

export const POST = apiHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const trainingId = formData.get('trainingId') as string | null;

    return response.ok(
      await FileService.create(file, user as UserHandler, trainingId || undefined)
    );
  },
});

export const GET = apiHandler({
  auth: true,
  params: keyParamSchema,
  handler: async ({ req, params, user }) => {
    const key = params?.key;

    if (!key) {
      throw new AppError('Missing key parameter', 400);
    }

    const { bytes, file } = await FileService.getFile(key);

    if (user && user.role !== 'ADMIN') {
      const usage = await prisma.fileUsage.findUnique({
        where: { fileId: file.id },
      });

      if (usage?.usageType === FileUsageType.TRAINING) {
        const moduleTraining = await prisma.moduleTraining.findFirst({
          where: { trainingId: usage.usageId },
          select: { moduleId: true },
        });

        if (moduleTraining) {
          const modulo = await prisma.module.findUnique({
            where: { id: moduleTraining.moduleId },
            select: { trackId: true },
          });

          if (modulo) {
            const enrollment = await prisma.userTrack.findUnique({
              where: { userId_trackId: { userId: user.id, trackId: modulo.trackId } },
            });

            if (!enrollment) {
              throw new AppError('Forbidden', 403);
            }
          }
        }
      }
    }

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': String(bytes.length),
      },
    });
  },
});

export const DELETE = apiHandler({
  auth: true,
  params: keyParamSchema,
  handler: async ({ params }) => {
    const key = params?.key;

    FileService.deleteFile(key!);

    return response.noContent();
  },
});
