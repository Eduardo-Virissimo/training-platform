import { response } from '@/lib/http/response';
import { apiHandler } from '@/lib/http/api-handler';
import { FileService } from '@/services/file.service';
import { UserHandler } from '@/types/user.types';
import { AppError } from '@/errors/AppError';
import { NextResponse } from 'next/server';
import { keyParamSchema } from '@/schemas/schemas';

export const POST = apiHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    return response.ok(await FileService.create(file, user as UserHandler));
  },
});

export const GET = apiHandler({
  auth: true,
  params: keyParamSchema,
  handler: async ({ req, params }) => {
    const key = params?.key;

    if (!key) {
      throw new AppError('Missing key parameter', 400);
    }

    const { bytes, file } = await FileService.getFile(key);

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': String(bytes.length),
      },
    });
  },
});
