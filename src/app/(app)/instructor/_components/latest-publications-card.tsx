import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { ModuleItem, QuizItem } from '../_lib/studio-types';

type LatestItem = {
  id: string;
  type: 'Módulo' | 'Aula' | 'Quiz';
  title: string;
  date: string;
};

type LatestPublicationsCardProps = {
  latestItems: LatestItem[];
  quizzes: QuizItem[];
  moduleById: Map<string, ModuleItem>;
  formatDate: (iso: string) => string;
};

export function LatestPublicationsCard({
  latestItems,
  quizzes,
  moduleById,
  formatDate,
}: LatestPublicationsCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Últimas publicações</CardTitle>
        <CardDescription>Itens criados recentemente no seu conteúdo.</CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        {latestItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há conteúdos publicados.</p>
        ) : (
          <ul className="space-y-2">
            {latestItems.map((item) => {
              const linkedModule = quizzes.find((quiz) => quiz.id === item.id)?.modules?.[0]
                ?.moduleId;

              return (
                <li
                  key={`${item.type}-${item.id}`}
                  className="rounded-md border border-border/70 p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {item.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  </div>

                  <p className="text-sm font-medium mt-1">{item.title}</p>

                  {linkedModule && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vinculado ao módulo: {moduleById.get(linkedModule)?.title ?? '—'}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
