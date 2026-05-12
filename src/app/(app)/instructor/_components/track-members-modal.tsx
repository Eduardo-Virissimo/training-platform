'use client';

import { Users, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TrackMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackTitle: string;
}

export function TrackMembersModal({ isOpen, onClose, trackTitle }: TrackMembersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Membros da Trilha
          </DialogTitle>
          <DialogDescription>{trackTitle}</DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="text-center">
            <AlertTriangle className="size-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O backend para gerenciamento de membros da trilha ainda está sendo implementado.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Funcionalidades planejadas:</strong>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Listar todos os membros da trilha</li>
                <li>• Visualizar status de progresso</li>
                <li>• Remover membros da trilha</li>
                <li>• Gerenciar permissões</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
