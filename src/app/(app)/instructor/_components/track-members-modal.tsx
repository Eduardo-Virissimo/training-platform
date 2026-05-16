'use client';

import { AlertTriangle, Mail, UserMinus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../_lib/studio-api';
import type { TrackItem } from '../_lib/studio-types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type UserTrackRole = 'STUDENT' | 'INSTRUCTOR';
type UserTrackStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

type TrackMemberRow = {
  id: string;
  userId: string;
  trackId: string;
  role: UserTrackRole;
  status: UserTrackStatus;
  user: { id: string; name: string; email: string };
};

interface TrackMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackTitle: string;
}

const statusLabel: Record<UserTrackStatus, string> = {
  NOT_STARTED: 'Não iniciado',
  IN_PROGRESS: 'Em progresso',
  COMPLETED: 'Concluído',
};

const statusBadgeClass: Record<UserTrackStatus, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

const roleLabel: Record<UserTrackRole, string> = {
  STUDENT: 'Aluno',
  INSTRUCTOR: 'Instrutor',
};

function membersUrl(trackId: string) {
  return `/api/track/${trackId}/members`;
}

function memberUrl(trackId: string, userId: string) {
  return `/api/track/${trackId}/members/${userId}`;
}

export function TrackMembersModal({
  isOpen,
  onClose,
  trackId,
  trackTitle,
}: TrackMembersModalProps) {
  const [members, setMembers] = useState<TrackMemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<TrackMemberRow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await apiRequest<{ members: TrackMemberRow[] }>(membersUrl(trackId));
      setMembers(data.members);
    } catch (e) {
      setMembers([]);
      setFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Não foi possível carregar os membros.',
      });
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    if (!isOpen || !trackId) return;
    void loadMembers();
  }, [isOpen, trackId, loadMembers]);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) {
      setFeedback({ type: 'error', text: 'Informe o e-mail do usuário.' });
      return;
    }

    setInviting(true);
    setFeedback(null);
    try {
      const query = new URLSearchParams({ id: trackId }).toString();
      await apiRequest<TrackItem>(`/api/track/user?${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setInviteEmail('');
      setFeedback({ type: 'success', text: 'Usuário adicionado à trilha.' });
      await loadMembers();
    } catch (e) {
      setFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Falha ao adicionar membro.',
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserTrackRole) => {
    setBusyUserId(userId);
    setFeedback(null);
    try {
      const updated = await apiRequest<TrackMemberRow>(memberUrl(trackId, userId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      setMembers((prev) => prev.map((m) => (m.userId === userId ? updated : m)));
      setFeedback({ type: 'success', text: 'Permissão atualizada.' });
    } catch (e) {
      setFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Não foi possível atualizar a permissão.',
      });
      await loadMembers();
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberPendingRemoval) return;

    const { userId } = memberPendingRemoval;
    setRemoving(true);
    setBusyUserId(userId);
    setFeedback(null);
    try {
      await apiRequest<void>(memberUrl(trackId, userId), { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setMemberPendingRemoval(null);
      setFeedback({ type: 'success', text: 'Membro removido da trilha.' });
    } catch (e) {
      setFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Não foi possível remover o membro.',
      });
    } finally {
      setRemoving(false);
      setBusyUserId(null);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMemberPendingRemoval(null);
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Membros da Trilha
            </DialogTitle>
            <DialogDescription>{trackTitle}</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleInvite}
            className="space-y-2 rounded-lg border border-border/70 p-3"
          >
            <Label htmlFor="track-invite-email" className="text-xs font-medium">
              Adicionar por e-mail
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="relative min-w-0 flex-1">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="track-invite-email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-9"
                  disabled={inviting}
                />
              </div>
              <Button type="submit" size="sm" disabled={inviting || !trackId}>
                {inviting ? 'Adicionando…' : 'Adicionar'}
              </Button>
            </div>
          </form>

          {feedback ? (
            <p
              className={cn(
                'text-sm',
                feedback.type === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-destructive'
              )}
              role="status"
            >
              {feedback.text}
            </p>
          ) : null}

          <div className="max-h-[min(50vh,22rem)] overflow-y-auto rounded-lg border border-border/60">
            {loading ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Carregando membros…</p>
            ) : members.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhum membro nesta trilha ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium text-foreground">{member.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          statusBadgeClass[member.status]
                        )}
                      >
                        {statusLabel[member.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          void handleRoleChange(member.userId, value as UserTrackRole)
                        }
                        disabled={busyUserId === member.userId}
                      >
                        <SelectTrigger
                          id={`role-${member.userId}`}
                          className="min-w-38 shadow-none"
                          aria-label={`Papel de ${member.user.name}`}
                        >
                          <SelectValue placeholder="Papel" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={6} align="end">
                          <SelectItem value="STUDENT">Aluno</SelectItem>
                          <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={busyUserId === member.userId}
                        onClick={() => setMemberPendingRemoval(member)}
                      >
                        <UserMinus className="size-4" />
                        Remover
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={memberPendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open && !removing) setMemberPendingRemoval(null);
        }}
      >
        <DialogContent className="z-60 max-w-md gap-0 p-0 sm:max-w-md">
          <div className="border-b border-destructive/20 bg-destructive/5 px-6 py-5">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" aria-hidden />
              </div>
              <DialogTitle>Remover membro da trilha?</DialogTitle>
              <DialogDescription className="text-left leading-relaxed">
                Tem certeza que deseja remover{' '}
                <span className="font-medium text-foreground">
                  {memberPendingRemoval?.user.name}
                </span>{' '}
                da trilha <span className="font-medium text-foreground">{trackTitle}</span>?
              </DialogDescription>
            </DialogHeader>
          </div>

          {memberPendingRemoval ? (
            <div className="space-y-4 px-6 py-4">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">E-mail</dt>
                    <dd className="truncate text-right font-medium">
                      {memberPendingRemoval.user.email}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Papel</dt>
                    <dd className="font-medium">{roleLabel[memberPendingRemoval.role]}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Progresso</dt>
                    <dd>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          statusBadgeClass[memberPendingRemoval.status]
                        )}
                      >
                        {statusLabel[memberPendingRemoval.status]}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                O usuário perderá o acesso a esta trilha e ao progresso registrado nela. Para
                participar novamente, será necessário adicioná-lo outra vez.
              </p>
            </div>
          ) : null}

          <DialogFooter className="gap-2 border-t border-border/70 px-6 py-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={removing}
              onClick={() => setMemberPendingRemoval(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removing}
              onClick={() => void confirmRemoveMember()}
            >
              {removing ? 'Removendo…' : 'Sim, remover membro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
