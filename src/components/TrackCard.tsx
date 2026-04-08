import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Track } from '@/types/track.types';

export const TrackCard = ({ track }: { track: Track }) => {
  const isComplete = (track?.userTracks && track?.userTracks[0]?.status === 'COMPLETED') || false;

  return (
    <Card className="group border-border transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className={
              isComplete
                ? 'bg-success/15 text-success border-success/30'
                : 'bg-secondary text-muted-foreground'
            }
          >
            {isComplete
              ? 'Concluída'
              : track?.userTracks && track?.userTracks[0]?.status === 'IN_PROGRESS'
                ? 'Em andamento'
                : 'Pendente'}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-base leading-snug">{track.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{track.description}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {track?.trainings && track?.trainings.length}{' '}
              {track?.trainings && track?.trainings.length === 1 ? 'treinamento' : 'treinamentos'}
            </span>
            <span className="font-medium">20%</span>
          </div>
          {/* <Progress value={track.progress} className="h-2" /> */}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10"
        >
          {isComplete
            ? 'Revisar'
            : track?.userTracks && track?.userTracks[0]?.status === 'IN_PROGRESS'
              ? 'Continuar'
              : 'Iniciar trilha'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
