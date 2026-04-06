import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canCreateModule, canManageModule } from '@/permissions/module.permission';
import { idParamSchema } from '@/schemas/schemas';
import {
  createModuleSchema,
  moduleFiltersSchema,
  updateModuleSchema,
} from '@/schemas/module.schema';
import { ModuleService } from '@/services/module.service';
import { ModuleCreateData, ModuleSearchFilters, ModuleUpdateData } from '@/types/api.types';
import { Role } from '@prisma/client';

export const POST = apiHandler({
  auth: true,
  body: createModuleSchema,
  role: Role.INSTRUCTOR,
  permissions: canCreateModule,
  handler: async ({ body }) => {
    const data = body as ModuleCreateData;
    const createdModule = await ModuleService.create(data);
    return response.created(createdModule);
  },
});

export const GET = apiHandler({
  auth: true,
  params: moduleFiltersSchema,
  handler: async ({ params, user }) => {
    const modules = await ModuleService.search(params as ModuleSearchFilters, user!);
    return response.ok(modules);
  },
});

export const PUT = apiHandler({
  auth: true,
  params: idParamSchema,
  body: updateModuleSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageModule,
  handler: async ({ body, params }) => {
    const id = params?.id;
    const data = body as ModuleUpdateData;
    const updatedModule = await ModuleService.update(id!, data);
    return response.ok(updatedModule);
  },
});

export const DELETE = apiHandler({
  auth: true,
  params: idParamSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageModule,
  handler: async ({ params }) => {
    const id = params?.id || '';
    await ModuleService.delete(id);
    return response.noContent();
  },
});
