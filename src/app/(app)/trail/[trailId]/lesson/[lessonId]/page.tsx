'use client';

import { completeLesson } from '@/lib/platform-api';
import { usePlatformState } from '@/hooks/use-platform-state';
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { MarkdownPreview } from '@/components/ui/markdown-preview';

export default function LessonPage() {
  const params = useParams<{ trailId: string; lessonId: string }>();
  const { state, loading, error, refresh } = usePlatformState();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const trail = useMemo(
    () => state?.tracks.find((item) => item.id === params.trailId),
    [params.trailId, state?.tracks]
  );
  const lesson = useMemo(
    () =>
      trail?.modules
        .flatMap((module) => module.lessons)
        .find((item) => item.id === params.lessonId),
    [params.lessonId, trail?.modules]
  );

  const handleComplete = async () => {
    if (!lesson || lesson.type === 'quiz' || lesson.completed) {
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError(null);
      await completeLesson(lesson.id);
      await refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Nao foi possivel registrar a conclusao da aula.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando aula...</p>
      </div>
    );
  }

  if (error || !state || !trail || !lesson || lesson.type === 'quiz') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          {error || 'Aula nao encontrada.'}
        </p>
      </div>
    );
  }

  const isVideoLink =
    lesson.type === 'video' &&
    typeof lesson.content === 'string' &&
    lesson.content.startsWith('http');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-6 h-12 flex items-center">
          <Link
            href={`/trail/${trail.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            {trail.title}
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-12">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {lesson.type === 'video' ? 'Video' : 'Leitura'} - {lesson.duration}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-8">{lesson.title}</h1>

        {isVideoLink ? (
          <div className="rounded-lg border border-border p-5 mb-8 bg-card">
            <p className="text-sm text-muted-foreground mb-4">
              O conteudo de video foi cadastrado como link externo.
            </p>
            <a
              href={lesson.content || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-105 transition-all duration-200"
            >
              Abrir video
              <ExternalLink className="w-4 h-4" strokeWidth={1.8} />
            </a>
          </div>
        ) : (
          <article className="rounded-lg border border-border p-5 mb-8 bg-card">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownPreview
                content={lesson.content || 'Conteúdo da aula ainda não foi preenchido.'}
              />
            </div>
          </article>
        )}

        {submitError && <p className="text-sm text-destructive mb-4">{submitError}</p>}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/trail/${trail.id}`}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors duration-200"
          >
            Voltar ao modulo
          </Link>
          <button
            onClick={handleComplete}
            disabled={submitLoading || lesson.completed}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {lesson.completed ? (
              <>
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
                Aula concluida
              </>
            ) : submitLoading ? (
              'Salvando...'
            ) : (
              'Marcar como concluida'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
