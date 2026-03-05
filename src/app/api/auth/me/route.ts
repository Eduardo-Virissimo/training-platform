import { NextResponse } from 'next/server';
import { getSession, getUserFromSession } from '@/lib/auth';
import { response } from '@/lib/http/response';

export async function GET() {
  const session = await getUserFromSession();

  if (!session) {
    return response.unauthorized('Não autenticado.');
  }

  return response.ok(session);
}
