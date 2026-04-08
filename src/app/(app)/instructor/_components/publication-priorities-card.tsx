import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { ModuleItem, TrackItem } from '../_lib/studio-types';

type PublicationPrioritiesCardProps = {
  modulesWithoutQuiz: ModuleItem[];
  trackById: Map<string, TrackItem>;
  startQuizCreationFromModule: (moduleId: string, trackId: string) => void;
};

export function PublicationPrioritiesCard({
  modulesWithoutQuiz,
  trackById,
  startQuizCreationFromModule,
}: PublicationPrioritiesCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Prioridades de publicação</CardTitle>
        <CardDescription>
          Módulos sem quiz para acelerar o fechamento pedagógico da trilha.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {modulesWithoutQuiz.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ótimo trabalho: todos os módulos possuem quiz.
          </p>
        ) : (
          <ul className="space-y-2">
            {modulesWithoutQuiz.slice(0, 8).map((moduleItem) => {
              const track = trackById.get(moduleItem.trackId);

              return (
                <li key={moduleItem.id} className="rounded-md border border-border/70 p-2.5">
                  <p className="text-sm font-medium">{moduleItem.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trilha: {track?.title ?? '—'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="mt-2"
                    onClick={() => startQuizCreationFromModule(moduleItem.id, moduleItem.trackId)}
                  >
                    <Plus className="size-3" />
                    Criar quiz agora
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
