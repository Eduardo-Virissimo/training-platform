import type { ApiEnvelope } from './studio-types';

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = response.headers.get('content-type')?.includes('application/json')
    ? ((await response.json().catch(() => null)) as ApiEnvelope<T> | null)
    : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Falha ao comunicar com a API.');
  }

  if (!payload?.data) {
    throw new Error('Resposta inválida da API.');
  }

  return payload.data;
}
