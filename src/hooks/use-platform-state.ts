'use client';

import { fetchPlatformState } from '@/lib/platform-api';
import { PlatformState } from '@/types/platform.types';
import { useCallback, useEffect, useState } from 'react';

export function usePlatformState() {
  const [state, setState] = useState<PlatformState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextState = await fetchPlatformState();
      setState(nextState);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nao foi possivel carregar os dados da plataforma.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    state,
    loading,
    error,
    refresh,
  };
}
