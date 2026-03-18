import { prisma } from '@/lib/prisma';
import { s3Client } from '@/lib/s3';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { response } from '@/lib/http/response';
import { apiHandler } from '@/lib/http/api-handler';
import { UserHandler } from '@/types/user.types';
import { AppError } from '@/errors/AppError';

export const FileService = {
  async create(file: File, user: UserHandler) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const res = await s3Client.send(
      new PutObjectCommand({
        Bucket: 'training-platform',
        Key: fileName,
        Body: buffer,
      })
    );

    const filePrisma = await prisma.file.create({
      data: {
        filename: file.name,
        path: `${appUrl}/api/file?key=${fileName}`,
        mimetype: file.type,
        size: file.size,
        key: fileName,
        userId: user.id,
      },
    });

    return filePrisma;
  },

  async getFile(key: string) {
    try {
      const file = await prisma.file.findUnique({
        where: { key },
      });

      if (!file) {
        throw new AppError('File not found', 404);
      }

      const res = await s3Client.send(
        new GetObjectCommand({
          Bucket: 'training-platform',
          Key: key,
        })
      );

      if (!res.Body) {
        throw new AppError('File not found', 404);
      }

      const bytes = await res.Body.transformToByteArray();

      return { bytes, file };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error fetching file', 500);
    }
  },

  async deleteFromBucket(key: string) {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: 'training-platform',
          Key: key,
        })
      );
    } catch (error) {
      throw new AppError('Error deleting file from bucket', 500);
    }
  },

  async deleteFile(key: string) {
    try {
      await this.getFile(key);
      await prisma.file.delete({
        where: { key },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error deleting file', 500);
    }
  },
};
