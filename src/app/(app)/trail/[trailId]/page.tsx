'use client';

import ProgressRing from '@/components/platform/ProgressRing';
import { usePlatformState } from '@/hooks/use-platform-state';
import { ArrowLeft, Check, ChevronRight, FileText, HelpCircle, Lock, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TrailPage() {
  const params = useParams<{ trailId: string }>();
  const { state, loading, error } = usePlatformState();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando trilha...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-destructive text-center">
          {error || 'Nao foi possivel carregar a trilha.'}
        </p>
      </div>
    );
  }

  const trail = state.tracks.find((item) => item.id === params.trailId);

  if (!trail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Trilha nao encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-6 h-12 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Trilhas
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{trail.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{trail.description}</p>
        </div>

        <div className="space-y-6">
          {trail.modules.map((module, moduleIndex) => {
            const isCompleted = module.progress === 100;
            const isLocked = module.locked;

            return (
              <div
                key={module.id}
                className="animate-soft-fade-up"
                style={{ animationDelay: `${moduleIndex * 60}ms` }}
              >
                <div className={`mb-3 flex items-center gap-3 ${isLocked ? 'opacity-40' : ''}`}>
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent-foreground" strokeWidth={2} />
                      </div>
                    ) : isLocked ? (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <ProgressRing progress={module.progress} size={24} strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">{module.title}</h2>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>

                <div
                  className={`ml-3 border-l border-border pl-6 space-y-1 ${
                    isLocked ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  {module.lessons.map((lesson) => {
                    const href =
                      lesson.type === 'quiz'
                        ? `/trail/${trail.id}/quiz/${lesson.id}`
                        : `/trail/${trail.id}/lesson/${lesson.id}`;

                    const Icon =
                      lesson.type === 'video'
                        ? Video
                        : lesson.type === 'quiz'
                          ? HelpCircle
                          : FileText;

                    return (
                      <Link
                        key={lesson.id}
                        href={href}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                      >
                        <Icon
                          className="w-4 h-4 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{lesson.title}</p>
                          <p className="text-[11px] text-muted-foreground">{lesson.duration}</p>
                        </div>
                        {lesson.completed ? (
                          <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2} />
                        ) : (
                          <ChevronRight
                            className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
                            strokeWidth={1.5}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
