import { Pencil, Trash2, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { QuizEditForm, QuizItem, TrainingEditForm, TrainingItem } from '../_lib/studio-types';

type QuickManagementCardProps = {
  trainingsSorted: TrainingItem[];
  quizzesSorted: QuizItem[];
  busyActionId: string | null;
  formatDate: (iso: string) => string;

  editingTrainingId: string | null;
  trainingEditForm: TrainingEditForm;
  setTrainingEditForm: Dispatch<SetStateAction<TrainingEditForm>>;
  setEditingTrainingId: Dispatch<SetStateAction<string | null>>;
  openTrainingEditor: (training: TrainingItem) => void;
  saveTrainingEdition: (trainingId: string) => Promise<void>;
  removeTraining: (trainingId: string, trainingTitle: string) => Promise<void>;

  editingQuizId: string | null;
  quizEditForm: QuizEditForm;
  setQuizEditForm: Dispatch<SetStateAction<QuizEditForm>>;
  setEditingQuizId: Dispatch<SetStateAction<string | null>>;
  openQuizEditor: (quiz: QuizItem) => void;
  saveQuizEdition: (quizId: string) => Promise<void>;
  removeQuiz: (quizId: string, quizTitle: string) => Promise<void>;
};

export function QuickManagementCard({
  trainingsSorted,
  quizzesSorted,
  busyActionId,
  formatDate,
  editingTrainingId,
  trainingEditForm,
  setTrainingEditForm,
  setEditingTrainingId,
  openTrainingEditor,
  saveTrainingEdition,
  removeTraining,
  editingQuizId,
  quizEditForm,
  setQuizEditForm,
  setEditingQuizId,
  openQuizEditor,
  saveQuizEdition,
  removeQuiz,
}: QuickManagementCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Gestão rápida</CardTitle>
        <CardDescription>
          Edição e exclusão de aulas e quizzes sem sair da área do instrutor.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Aulas
          </p>
          {trainingsSorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aula criada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {trainingsSorted.slice(0, 6).map((training) => (
                <li
                  key={training.id}
                  className="rounded-md border border-border/70 p-2.5 space-y-2"
                >
                  {editingTrainingId === training.id ? (
                    <>
                      <Input
                        value={trainingEditForm.title}
                        onChange={(event) =>
                          setTrainingEditForm((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                      />
                      <Textarea
                        value={trainingEditForm.description}
                        onChange={(event) =>
                          setTrainingEditForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                      <Textarea
                        className="min-h-20"
                        value={trainingEditForm.content}
                        onChange={(event) =>
                          setTrainingEditForm((prev) => ({
                            ...prev,
                            content: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => void saveTrainingEdition(training.id)}
                          disabled={busyActionId === `training-update-${training.id}`}
                        >
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setEditingTrainingId(null)}
                        >
                          <X className="size-3" />
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{training.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Atualizada em {formatDate(training.updatedAt)}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => openTrainingEditor(training)}
                        >
                          <Pencil className="size-3" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={busyActionId === `training-delete-${training.id}`}
                          onClick={() => void removeTraining(training.id, training.title)}
                        >
                          <Trash2 className="size-3" />
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quizzes
          </p>
          {quizzesSorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum quiz criado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {quizzesSorted.slice(0, 6).map((quiz) => (
                <li key={quiz.id} className="rounded-md border border-border/70 p-2.5 space-y-2">
                  {editingQuizId === quiz.id ? (
                    <>
                      <Input
                        value={quizEditForm.title}
                        onChange={(event) =>
                          setQuizEditForm((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                      />
                      <Textarea
                        value={quizEditForm.description}
                        onChange={(event) =>
                          setQuizEditForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        value={quizEditForm.position}
                        onChange={(event) =>
                          setQuizEditForm((prev) => ({
                            ...prev,
                            position: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => void saveQuizEdition(quiz.id)}
                          disabled={busyActionId === `quiz-update-${quiz.id}`}
                        >
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setEditingQuizId(null)}
                        >
                          <X className="size-3" />
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.questions.length} pergunta{quiz.questions.length === 1 ? '' : 's'}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => openQuizEditor(quiz)}
                        >
                          <Pencil className="size-3" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={busyActionId === `quiz-delete-${quiz.id}`}
                          onClick={() => void removeQuiz(quiz.id, quiz.title)}
                        >
                          <Trash2 className="size-3" />
                          Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
