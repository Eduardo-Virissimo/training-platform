'use client';

import { usePlatformState } from '@/hooks/use-platform-state';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { state, loading, error } = usePlatformState();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-destructive text-center">
          {error || 'Nao foi possivel carregar o perfil.'}
        </p>
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
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
            {state.user.initials}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{state.user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {state.user.role} - {state.user.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden mb-6">
          {[
            { label: 'XP Total', value: state.user.xp.toLocaleString('pt-BR') },
            { label: 'Streak', value: `${state.user.streak} dias` },
            { label: 'Trilhas', value: `${state.completedTracks}/${state.tracks.length}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-background p-4 text-center transition-colors duration-200 hover:bg-muted/30"
            >
              <p className="text-lg font-bold tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors duration-200 disabled:opacity-60"
        >
          {logoutLoading ? 'Saindo...' : 'Sair da conta'}
        </button>
      </main>
    </div>
  );
}
