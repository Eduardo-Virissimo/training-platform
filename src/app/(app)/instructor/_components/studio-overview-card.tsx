import { Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type StudioOverviewCardProps = {
  error?: string | null;
  success?: string | null;
};

export function StudioOverviewCard({ error, success }: StudioOverviewCardProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
          <Sparkles className="size-5 text-primary" />
          Studio do Instrutor
        </CardTitle>
        <CardDescription>
          Fluxo de criação simples, com etapas claras e sem ruído visual.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
