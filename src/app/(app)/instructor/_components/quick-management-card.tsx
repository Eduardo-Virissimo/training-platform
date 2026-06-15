import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Dispatch, SetStateAction, DragEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { Select } from './select';
import type {
  QuizEditForm,
  QuizItem,
  QuizQuestionForm,
  TrainingEditForm,
  TrainingItem,
} from '../_lib/studio-types';
import { createOption, createQuestion, quizTypeLabels } from '../_lib/studio-quiz';

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
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [draggingOption, setDraggingOption] = useState<{
    questionId: string;
    optionId: string;
  } | null>(null);
  const [dragOverOptionId, setDragOverOptionId] = useState<string | null>(null);

  const updateQuestion = (
    questionId: string,
    updater: (current: QuizQuestionForm) => QuizQuestionForm
  ) => {
    setQuizEditForm((prev) => ({
      ...prev,
      questions: prev.questions.map((item) => (item.id === questionId ? updater(item) : item)),
    }));
  };

  const removeQuestion = (questionId: string) => {
    setQuizEditForm((prev) => ({
      ...prev,
      questions:
        prev.questions.length <= 1
          ? prev.questions
          : prev.questions.filter((item) => item.id !== questionId),
    }));
  };

  const moveQuestion = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    setQuizEditForm((prev) => {
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= prev.questions.length ||
        targetIndex >= prev.questions.length
      ) {
        return prev;
      }

      const next = [...prev.questions];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return {
        ...prev,
        questions: next,
      };
    });
  };

  const moveOption = (questionId: string, sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    updateQuestion(questionId, (current) => {
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= current.options.length ||
        targetIndex >= current.options.length
      ) {
        return current;
      }

      const nextOptions = [...current.options];
      const [moved] = nextOptions.splice(sourceIndex, 1);
      nextOptions.splice(targetIndex, 0, moved);

      return {
        ...current,
        options: nextOptions,
      };
    });
  };

  const setQuestionType = (questionId: string, nextType: QuizQuestionForm['type']) => {
    updateQuestion(questionId, (current) => {
      if (current.type === nextType) return current;

      if (nextType === 'TRUE_FALSE') {
        return {
          ...current,
          type: nextType,
          options: [createOption('Verdadeiro', true), createOption('Falso', false)],
        };
      }

      const baseOptions = current.options
        .slice(0, Math.max(2, current.options.length))
        .map((option, index) => ({
          ...option,
          isCorrect:
            nextType === 'SINGLE_CHOICE' ? index === 0 && option.isCorrect : option.isCorrect,
        }));

      return {
        ...current,
        type: nextType,
        options: baseOptions.length >= 2 ? baseOptions : [createOption(), createOption()],
      };
    });
  };

  const toggleOptionCorrectness = (questionId: string, optionId: string) => {
    updateQuestion(questionId, (current) => {
      const updatedOptions = current.options.map((option) => {
        if (current.type === 'SINGLE_CHOICE' || current.type === 'TRUE_FALSE') {
          return {
            ...option,
            isCorrect: option.id === optionId,
          };
        }

        if (option.id !== optionId) return option;

        return {
          ...option,
          isCorrect: !option.isCorrect,
        };
      });

      return {
        ...current,
        options: updatedOptions,
      };
    });
  };

  const handleQuestionDrop = (event: DragEvent<HTMLDivElement>, targetQuestionId: string) => {
    event.preventDefault();
    if (!draggingQuestionId || draggingQuestionId === targetQuestionId) return;

    const sourceIndex = quizEditForm.questions.findIndex((q) => q.id === draggingQuestionId);
    const targetIndex = quizEditForm.questions.findIndex((q) => q.id === targetQuestionId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      moveQuestion(sourceIndex, targetIndex);
    }
  };

  const handleOptionDrop = (
    event: DragEvent<HTMLDivElement>,
    questionId: string,
    targetOptionId: string
  ) => {
    event.preventDefault();
    if (
      !draggingOption ||
      draggingOption.questionId !== questionId ||
      draggingOption.optionId === targetOptionId
    )
      return;

    const question = quizEditForm.questions.find((q) => q.id === questionId);
    if (!question) return;

    const sourceIndex = question.options.findIndex((o) => o.id === draggingOption.optionId);
    const targetIndex = question.options.findIndex((o) => o.id === targetOptionId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      moveOption(questionId, sourceIndex, targetIndex);
    }
  };
  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Gestão rápida</CardTitle>
        <CardDescription>Edição e exclusão de aulas e quizzes.</CardDescription>
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Título do quiz</Label>
                        <Input
                          value={quizEditForm.title}
                          onChange={(event) =>
                            setQuizEditForm((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Descrição</Label>
                        <Textarea
                          value={quizEditForm.description}
                          onChange={(event) =>
                            setQuizEditForm((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Posição</Label>
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
                      </div>

                      <div className="space-y-3 rounded-lg border border-border/70 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm">Perguntas do quiz</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              setQuizEditForm((prev) => ({
                                ...prev,
                                questions: [...prev.questions, createQuestion()],
                              }))
                            }
                          >
                            <Plus className="size-3" />
                            Nova pergunta
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {quizEditForm.questions.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              draggable
                              onDragStart={() => setDraggingQuestionId(question.id)}
                              onDragOver={(event) => {
                                event.preventDefault();
                                if (dragOverQuestionId !== question.id) {
                                  setDragOverQuestionId(question.id);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverQuestionId === question.id) {
                                  setDragOverQuestionId(null);
                                }
                              }}
                              onDragEnd={() => {
                                setDraggingQuestionId(null);
                                setDragOverQuestionId(null);
                              }}
                              onDrop={(event) => handleQuestionDrop(event, question.id)}
                              className={`rounded-md border p-3 space-y-3 transition-colors ${
                                dragOverQuestionId === question.id
                                  ? 'border-primary/60 bg-primary/5'
                                  : 'border-border/70'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Pergunta {questionIndex + 1}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={question.type}
                                    className="h-7 text-xs w-40"
                                    onChange={(event) =>
                                      setQuestionType(
                                        question.id,
                                        event.target.value as QuizQuestionForm['type']
                                      )
                                    }
                                  >
                                    {Object.entries(quizTypeLabels).map(([value, label]) => (
                                      <option key={value} value={value}>
                                        {label}
                                      </option>
                                    ))}
                                  </Select>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-xs"
                                    disabled={quizEditForm.questions.length <= 1}
                                    onClick={() => removeQuestion(question.id)}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>

                              <Textarea
                                placeholder="Digite a pergunta"
                                value={question.content}
                                onChange={(event) =>
                                  updateQuestion(question.id, (current) => ({
                                    ...current,
                                    content: event.target.value,
                                  }))
                                }
                              />

                              <div className="space-y-2">
                                {question.options.map((option) => (
                                  <div
                                    key={option.id}
                                    draggable={question.type !== 'TRUE_FALSE'}
                                    onDragStart={() =>
                                      setDraggingOption({
                                        questionId: question.id,
                                        optionId: option.id,
                                      })
                                    }
                                    onDragOver={(event) => {
                                      if (
                                        !draggingOption ||
                                        draggingOption.questionId !== question.id
                                      )
                                        return;
                                      event.preventDefault();
                                      if (dragOverOptionId !== option.id) {
                                        setDragOverOptionId(option.id);
                                      }
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverOptionId === option.id) {
                                        setDragOverOptionId(null);
                                      }
                                    }}
                                    onDragEnd={() => {
                                      setDraggingOption(null);
                                      setDragOverOptionId(null);
                                    }}
                                    onDrop={(event) =>
                                      handleOptionDrop(event, question.id, option.id)
                                    }
                                    className={`flex items-center gap-2 rounded-md p-1 transition-colors ${
                                      dragOverOptionId === option.id
                                        ? 'bg-primary/5 ring-1 ring-primary/40'
                                        : ''
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleOptionCorrectness(question.id, option.id)
                                      }
                                      className={cn(
                                        'size-7 rounded-md border flex items-center justify-center shrink-0',
                                        option.isCorrect
                                          ? 'border-primary bg-primary/10 text-primary'
                                          : 'border-border text-muted-foreground hover:bg-muted'
                                      )}
                                      title="Marcar como correta"
                                    >
                                      {option.isCorrect ? (
                                        <Check className="size-3.5" />
                                      ) : (
                                        <span className="text-[11px]">✓</span>
                                      )}
                                    </button>

                                    <Input
                                      placeholder="Texto da opção"
                                      value={option.content}
                                      onChange={(event) =>
                                        updateQuestion(question.id, (current) => ({
                                          ...current,
                                          options: current.options.map((item) =>
                                            item.id === option.id
                                              ? { ...item, content: event.target.value }
                                              : item
                                          ),
                                        }))
                                      }
                                    />

                                    {question.type !== 'TRUE_FALSE' &&
                                      question.options.length > 2 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon-xs"
                                          onClick={() =>
                                            updateQuestion(question.id, (current) => ({
                                              ...current,
                                              options: current.options.filter(
                                                (item) => item.id !== option.id
                                              ),
                                            }))
                                          }
                                        >
                                          <Trash2 className="size-3" />
                                        </Button>
                                      )}
                                  </div>
                                ))}
                              </div>

                              <p className="text-[11px] text-muted-foreground">
                                Arraste perguntas e opções para ajustar a ordem do quiz.
                              </p>

                              {question.type !== 'TRUE_FALSE' && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={() =>
                                    updateQuestion(question.id, (current) => ({
                                      ...current,
                                      options: [...current.options, createOption()],
                                    }))
                                  }
                                >
                                  <Plus className="size-3" />
                                  Adicionar opção
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

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
                    </div>
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
