'use client';

import { usePlatformState } from '@/hooks/use-platform-state';
import { useSnackbar } from '@/hooks/use-snackbar';
import { SnackbarContainer } from '@/components/ui/snackbar';
import { ArrowLeft, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { state, loading, error, refresh } = usePlatformState();
  const router = useRouter();
  const { snackbars, showSnackbar, closeSnackbar } = useSnackbar();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const handleEditName = () => {
    if (!state) return;
    setEditedName(state.user.name);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleSaveName = async () => {
    if (editedName.trim().length < 3) {
      showSnackbar('Nome deve ter pelo menos 3 caracteres', 'warning');
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (response.ok) {
        setIsEditingName(false);
        showSnackbar('Nome atualizado com sucesso!', 'success');
        // Atualizar os dados do usuário
        await refresh();
      } else {
        const error = await response.json();
        showSnackbar(error.message || 'Erro ao atualizar nome', 'error');
      }
    } catch (error) {
      showSnackbar('Erro ao atualizar nome', 'error');
    } finally {
      setUpdateLoading(false);
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
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl font-bold tracking-tight bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={updateLoading}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={updateLoading}
                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-60"
                  title="Salvar"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updateLoading}
                  className="p-1 text-red-600 hover:text-red-700 disabled:opacity-60"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{state.user.name}</h1>
                <button
                  onClick={handleEditName}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar nome"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
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

      <SnackbarContainer snackbars={snackbars} onClose={closeSnackbar} />
    </div>
  );
}
