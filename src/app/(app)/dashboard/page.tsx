'use client';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TrackCard } from '@/components/TrackCard';
import { Track } from '@/types/track.types';

export default function DashboardPage() {
  const [uiTracks, setUiTracks] = useState<Track[]>([]);

  useEffect(() => {
    async function fetchUserTracks() {
      const res = await fetch('/api/track');
      if (res.ok) {
        const { data } = await res.json();
        console.log('Treinamentos do TRACK:', data);
        setUiTracks(data);
      }
    }
    fetchUserTracks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trilhas ativas</p>
                <p className="text-2xl font-bold text-foreground">{uiTracks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-foreground">{uiTracks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{uiTracks.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimas acessadas */}
        {uiTracks.length > 0 && (
          <section className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Últimas trilhas acessadas
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uiTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </section>
        )}

        {/* Todas as trilhas */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Todas as trilhas</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uiTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
