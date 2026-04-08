import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { Dispatch, DragEvent, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type {
  ModuleEditForm,
  ModuleItem,
  QuizItem,
  TrackEditForm,
  TrackItem,
} from '../_lib/studio-types';

type ContentStructureCardProps = {
  tracks: TrackItem[];
  modulesByTrack: Map<string, ModuleItem[]>;
  quizzesByModule: Map<string, QuizItem[]>;
  formatDate: (iso: string) => string;
  busyActionId: string | null;

  editingTrackId: string | null;
  trackEditForm: TrackEditForm;
  setTrackEditForm: Dispatch<SetStateAction<TrackEditForm>>;
  setEditingTrackId: Dispatch<SetStateAction<string | null>>;
  openTrackEditor: (track: TrackItem) => void;
  saveTrackEdition: (trackId: string) => Promise<void>;
  removeTrack: (trackId: string, trackTitle: string) => Promise<void>;

  editingModuleId: string | null;
  moduleEditForm: ModuleEditForm;
  setModuleEditForm: Dispatch<SetStateAction<ModuleEditForm>>;
  setEditingModuleId: Dispatch<SetStateAction<string | null>>;
  openModuleEditor: (moduleItem: ModuleItem) => void;
  saveModuleEdition: (moduleId: string) => Promise<void>;
  removeModule: (moduleId: string, moduleTitle: string) => Promise<void>;
  reorderModulesInTrack: (
    trackId: string,
    sourceModuleId: string,
    targetModuleId: string
  ) => Promise<void>;

  startModuleCreationFromTrack: (trackId: string) => void;
  startTrainingCreationFromModule: (moduleId: string, trackId: string) => void;
  startQuizCreationFromModule: (moduleId: string, trackId: string) => void;
};

export function ContentStructureCard({
  tracks,
  modulesByTrack,
  quizzesByModule,
  formatDate,
  busyActionId,
  editingTrackId,
  trackEditForm,
  setTrackEditForm,
  setEditingTrackId,
  openTrackEditor,
  saveTrackEdition,
  removeTrack,
  editingModuleId,
  moduleEditForm,
  setModuleEditForm,
  setEditingModuleId,
  openModuleEditor,
  saveModuleEdition,
  removeModule,
  reorderModulesInTrack,
  startModuleCreationFromTrack,
  startTrainingCreationFromModule,
  startQuizCreationFromModule,
}: ContentStructureCardProps) {
  const [draggingModule, setDraggingModule] = useState<{
    moduleId: string;
    trackId: string;
  } | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null);

  const handleModuleDrop = async (event: DragEvent, targetModuleId: string, trackId: string) => {
    event.preventDefault();

    if (!draggingModule) return;
    if (draggingModule.trackId !== trackId) return;
    if (draggingModule.moduleId === targetModuleId) return;

    await reorderModulesInTrack(trackId, draggingModule.moduleId, targetModuleId);
    setDraggingModule(null);
    setDragOverModuleId(null);
  };

  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Estrutura de conteúdo</CardTitle>
        <CardDescription>
          Visão hierárquica das trilhas com seus módulos e quizzes vinculados.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma trilha criada ainda.</p>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => {
              const trackModules = modulesByTrack.get(track.id) ?? [];

              return (
                <div
                  key={track.id}
                  className="rounded-lg border border-border/70 bg-background/60 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      {editingTrackId === track.id ? (
                        <div className="space-y-2 max-w-115">
                          <Input
                            value={trackEditForm.title}
                            onChange={(event) =>
                              setTrackEditForm((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                          />
                          <Textarea
                            value={trackEditForm.description}
                            onChange={(event) =>
                              setTrackEditForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => void saveTrackEdition(track.id)}
                              disabled={busyActionId === `track-update-${track.id}`}
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => setEditingTrackId(null)}
                            >
                              <X className="size-3" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-sm font-semibold">{track.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {track.description?.trim() || 'Sem descrição'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => startModuleCreationFromTrack(track.id)}
                            >
                              <Plus className="size-3" />
                              Novo módulo nesta trilha
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => openTrackEditor(track)}
                            >
                              <Pencil className="size-3" />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              disabled={busyActionId === `track-delete-${track.id}`}
                              onClick={() => void removeTrack(track.id, track.title)}
                            >
                              <Trash2 className="size-3" />
                              Excluir
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{trackModules.length} módulos</p>
                      <p>Criada em {formatDate(track.createdAt)}</p>
                    </div>
                  </div>

                  {trackModules.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">Sem módulos nessa trilha.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {trackModules.map((moduleItem) => {
                        const moduleQuizzes = quizzesByModule.get(moduleItem.id) ?? [];

                        return (
                          <li
                            key={moduleItem.id}
                            draggable={editingModuleId !== moduleItem.id}
                            onDragStart={() =>
                              setDraggingModule({ moduleId: moduleItem.id, trackId: track.id })
                            }
                            onDragOver={(event) => {
                              if (!draggingModule || draggingModule.trackId !== track.id) return;
                              event.preventDefault();
                              if (dragOverModuleId !== moduleItem.id) {
                                setDragOverModuleId(moduleItem.id);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverModuleId === moduleItem.id) {
                                setDragOverModuleId(null);
                              }
                            }}
                            onDragEnd={() => {
                              setDraggingModule(null);
                              setDragOverModuleId(null);
                            }}
                            onDrop={(event) =>
                              void handleModuleDrop(event, moduleItem.id, track.id)
                            }
                            className={`rounded-md border px-2.5 py-2 text-xs transition-colors ${
                              dragOverModuleId === moduleItem.id
                                ? 'border-primary/60 bg-primary/5'
                                : 'border-border/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              {editingModuleId === moduleItem.id ? (
                                <div className="w-full space-y-2">
                                  <Input
                                    value={moduleEditForm.title}
                                    onChange={(event) =>
                                      setModuleEditForm((prev) => ({
                                        ...prev,
                                        title: event.target.value,
                                      }))
                                    }
                                  />
                                  <Textarea
                                    value={moduleEditForm.description}
                                    onChange={(event) =>
                                      setModuleEditForm((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    type="number"
                                    min={0}
                                    value={moduleEditForm.position}
                                    onChange={(event) =>
                                      setModuleEditForm((prev) => ({
                                        ...prev,
                                        position: event.target.value,
                                      }))
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="xs"
                                      onClick={() => void saveModuleEdition(moduleItem.id)}
                                      disabled={busyActionId === `module-update-${moduleItem.id}`}
                                    >
                                      Salvar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      onClick={() => setEditingModuleId(null)}
                                    >
                                      <X className="size-3" />
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium">
                                    #{moduleItem.position} • {moduleItem.title}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {moduleQuizzes.length} quiz
                                    {moduleQuizzes.length === 1 ? '' : 'zes'}
                                  </p>
                                </>
                              )}
                            </div>

                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Arraste para reordenar o módulo dentro da trilha.
                            </p>

                            {!!moduleQuizzes.length && (
                              <p className="mt-1 text-muted-foreground">
                                {moduleQuizzes
                                  .slice(0, 3)
                                  .map((quiz) => quiz.title)
                                  .join(' · ')}
                                {moduleQuizzes.length > 3 ? ' · ...' : ''}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  startTrainingCreationFromModule(moduleItem.id, track.id)
                                }
                              >
                                <Plus className="size-3" />
                                Nova aula
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => startQuizCreationFromModule(moduleItem.id, track.id)}
                              >
                                <Plus className="size-3" />
                                Novo quiz
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => openModuleEditor(moduleItem)}
                              >
                                <Pencil className="size-3" />
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                disabled={busyActionId === `module-delete-${moduleItem.id}`}
                                onClick={() => void removeModule(moduleItem.id, moduleItem.title)}
                              >
                                <Trash2 className="size-3" />
                                Excluir
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
