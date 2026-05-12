import { cn } from '@/lib/utils';

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
        className
      )}
      {...props}
    />
  );
}
