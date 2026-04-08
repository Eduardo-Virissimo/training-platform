'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressRing from '@/components/platform/ProgressRing';
import { usePlatformState } from '@/hooks/use-platform-state';
import { Check, ChevronRight, Flame, Lock, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

import type { PlatformTrail } from '@/types/platform.types';

function TrackRow({ trail }: { trail: PlatformTrail }) {
  const isLocked = trail.status === 'locked';
  const isCompleted = trail.status === 'completed';
  const isActive = trail.status === 'active';

  const cardClassName = `group flex items-center gap-4 px-4 py-3.5 rounded-lg border transition-all duration-200 ease-out ${
    isLocked
      ? 'border-transparent opacity-55 cursor-not-allowed'
      : isActive
        ? 'border-primary/20 bg-primary/[0.03] cursor-pointer hover:bg-primary/[0.06] hover:shadow-sm'
        : 'border-border cursor-pointer hover:bg-muted/50 hover:shadow-sm'
  }`;

  const content = (
    <>
      <div className="shrink-0">
        {isCompleted && (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-4 h-4 text-accent-foreground" strokeWidth={2} />
          </div>
        )}
        {isActive && <ProgressRing progress={trail.progress} size={32} strokeWidth={2.5} />}
        {isLocked && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{trail.title}</p>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {isLocked ? 'Bloqueada' : isCompleted ? 'Concluída' : 'Ativa'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {trail.modules.length} módulos ·{' '}
          <span className="tabular-nums">+{trail.xp.toLocaleString('pt-BR')} XP</span>
        </p>
      </div>

      {!isLocked && (
        <ChevronRight
          className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
          strokeWidth={1.5}
        />
      )}
    </>
  );

  if (isLocked) {
    return <div className={`${cardClassName} animate-soft-fade-up`}>{content}</div>;
  }

  return (
    <Link href={`/trail/${trail.id}`} className={`${cardClassName} animate-soft-fade-up`}>
      {content}
    </Link>
  );
}

export default function DashboardPage() {
  const { state, loading, error } = usePlatformState();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando trilhas...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-destructive text-center">
          {error || 'Nao foi possivel carregar o dashboard.'}
        </p>
      </div>
    );
  }

  const firstName = state.user.name.split(' ')[0] || state.user.name;

  const activeTracks = state.tracks.filter((track) => track.status === 'active');
  const completedTracks = state.tracks.filter((track) => track.status === 'completed');
  const lockedTracks = state.tracks.filter((track) => track.status === 'locked');
  const availableTracks = state.tracks.filter((track) => track.status !== 'locked');

  const avgProgress = (() => {
    if (availableTracks.length === 0) return 0;
    const total = availableTracks.reduce((acc, trail) => acc + trail.progress, 0);
    return Math.round(total / availableTracks.length);
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-235 mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="font-semibold text-sm">SkillQuest</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
              <span className="font-semibold text-foreground tabular-nums">
                {state.user.streak}
              </span>{' '}
              dias
            </span>
            <span className="tabular-nums font-semibold text-foreground">
              {state.user.xp.toLocaleString('pt-BR')} XP
            </span>
            {(state.user.role === 'Instrutor' || state.user.role === 'Administrador') && (
              <Link
                href="/instructor"
                className="px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors text-[11px] font-medium text-foreground"
              >
                Instrutor
              </Link>
            )}
            <Link href="/profile">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold hover:bg-primary/10 transition-colors duration-200 cursor-pointer">
                {state.user.initials}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-235 mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Bom dia, {firstName}</p>
            <h1 className="text-2xl font-bold tracking-tight">Painel de aprendizado</h1>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Trilhas concluídas:{' '}
            <span className="font-semibold text-foreground">{state.completedTracks}</span>
          </div>
        </div>

        <Tabs defaultValue="continue">
          <TabsList className="w-full grid grid-cols-3" variant="line">
            <TabsTrigger value="continue">Continuar</TabsTrigger>
            <TabsTrigger value="tracks">Trilhas</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="continue" className="pt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Próximos passos
                </CardTitle>
                <CardDescription>
                  Foco no que está em andamento para avançar mais rápido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma trilha ativa no momento.</p>
                ) : (
                  activeTracks.map((trail) => <TrackRow key={trail.id} trail={trail} />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Concluídas recentemente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {completedTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Você ainda não concluiu trilhas.</p>
                ) : (
                  completedTracks
                    .slice(0, 4)
                    .map((trail) => <TrackRow key={trail.id} trail={trail} />)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracks" className="pt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trilhas disponíveis</CardTitle>
                <CardDescription>Ativas e concluídas com acesso imediato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma trilha disponível.</p>
                ) : (
                  availableTracks.map((trail) => <TrackRow key={trail.id} trail={trail} />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trilhas bloqueadas</CardTitle>
                <CardDescription>
                  Conteúdos que serão liberados conforme seu progresso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lockedTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma trilha bloqueada 🎉</p>
                ) : (
                  lockedTracks.map((trail) => <TrackRow key={trail.id} trail={trail} />)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Trilhas totais',
                  value: state.tracks.length,
                },
                {
                  label: 'Ativas',
                  value: activeTracks.length,
                },
                {
                  label: 'Bloqueadas',
                  value: lockedTracks.length,
                },
                {
                  label: 'Progresso médio',
                  value: `${avgProgress}%`,
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeTracks[0] && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recomendação do dia</CardTitle>
                  <CardDescription>
                    Continue de onde você parou para manter sua sequência.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{activeTracks[0].title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeTracks[0].modules.length} módulos · {activeTracks[0].progress}%
                      concluído
                    </p>
                  </div>
                  <Link href={`/trail/${activeTracks[0].id}`}>
                    <Button size="sm">Continuar trilha</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
