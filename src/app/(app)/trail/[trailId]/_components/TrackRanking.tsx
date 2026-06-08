'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchTrackRanking } from '@/lib/platform-api';
import type { RankingEntry, TrackRankingResponse } from '@/types/platform.types';
import { Button } from '@/components/ui/button';

const MEDALS: Record<number, { symbol: string; label: string }> = {
  1: { symbol: '🥇', label: 'Primeiro lugar' },
  2: { symbol: '🥈', label: 'Segundo lugar' },
  3: { symbol: '🥉', label: 'Terceiro lugar' },
};

const VISIBLE_TOP = 5;

type Props = {
  trackId: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function RankingRow({ entry }: { entry: RankingEntry }) {
  const medal = MEDALS[entry.position];

  return (
    <li
      aria-current={entry.isCurrentUser ? 'true' : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
        entry.isCurrentUser ? 'border-l-2 border-primary bg-primary/[0.04] font-medium' : ''
      }`}
    >
      <span className="w-7 shrink-0 flex items-center justify-center">
        {medal ? (
          <span aria-label={medal.label} role="img" className="text-base leading-none">
            {medal.symbol}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">#{entry.position}</span>
        )}
      </span>

      <div
        aria-hidden="true"
        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0"
      >
        {getInitials(entry.name)}
      </div>

      <span className="flex-1 min-w-0 truncate text-sm">{entry.name}</span>

      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {entry.score.toLocaleString('pt-BR')} pts
      </span>
    </li>
  );
}

export function TrackRanking({ trackId }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TrackRankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (data !== null) return;
    try {
      setLoading(true);
      setFetchError(null);
      const result = await fetchTrackRanking(trackId, VISIBLE_TOP);
      setData(result);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Erro ao carregar ranking.');
    } finally {
      setLoading(false);
    }
  }, [trackId, data]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  const topFive = data?.ranking.slice(0, VISIBLE_TOP) ?? [];
  const currentUserEntry =
    data?.ranking.find((e) => e.isCurrentUser && e.position > VISIBLE_TOP) ?? null;
  const isEmpty = !loading && fetchError === null && data !== null && data.ranking.length === 0;

  return (
    <Card size="sm">
      <CardHeader>
        <Button
          variant="ghost"
          type="button"
          aria-expanded={open}
          aria-controls="track-ranking-content"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            Ranking da trilha
          </CardTitle>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground shrink-0 duration-150 ${open ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </Button>
      </CardHeader>

      {open && (
        <CardContent id="track-ranking-content">
          {loading && <p className="text-sm text-muted-foreground py-2">Carregando ranking...</p>}

          {fetchError && <p className="text-sm text-destructive py-2">{fetchError}</p>}

          {isEmpty && (
            <p className="text-sm text-muted-foreground py-2">
              Nenhum participante nesta trilha ainda.
            </p>
          )}

          {!loading && fetchError === null && topFive.length > 0 && (
            <>
              <ul aria-label="Ranking de participantes" className="space-y-0.5">
                {topFive.map((entry) => (
                  <RankingRow key={entry.userId} entry={entry} />
                ))}
              </ul>

              {currentUserEntry && (
                <>
                  <Separator className="my-2" />
                  <ul aria-label="Sua posição no ranking">
                    <RankingRow entry={currentUserEntry} />
                  </ul>
                </>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
