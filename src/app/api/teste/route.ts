import { requireRole } from '@/middlewares/requireRole';

export const GET = requireRole(async () => {
  return Response.json({
    message: 'Acesso liberado para usuário com papel ADMIN',
  });
}, 'ADMIN');
