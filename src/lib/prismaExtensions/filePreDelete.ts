import { Prisma } from '@prisma/client';
import { FileService } from '@/services/file.service';

export const filePreDelete = Prisma.defineExtension({
  query: {
    file: {
      async delete({ args, query }) {
        const file = await query(args);
        if (file) {
          await FileService.deleteFromBucket(file.key!);
        }
        return file;
      },
    },
  },
});
