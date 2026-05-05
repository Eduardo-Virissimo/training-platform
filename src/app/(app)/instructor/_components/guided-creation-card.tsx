import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Paperclip,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { Dispatch, DragEvent, FormEvent, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { MarkdownPreview } from '@/components/ui/markdown-preview';

import { Select } from './select';
import type {
  ActiveStudioTab,
  ModuleForm,
  ModuleItem,
  QuizForm,
  QuizQuestionForm,
  StudioSubmitting,
  TrackForm,
  TrackItem,
  TrainingForm,
  UploadedFileItem,
} from '../_lib/studio-types';

const quizTypeLabels: Record<QuizQuestionForm['type'], string> = {
  SINGLE_CHOICE: 'Única escolha',
  MULTIPLE_CHOICE: 'Múltiplas respostas',
  TRUE_FALSE: 'Verdadeiro/Falso',
};

type GuidedCreationCardProps = {
  activeTab: ActiveStudioTab;
  setActiveTab: (tab: string) => void;

  trackForm: TrackForm;
  setTrackForm: Dispatch<SetStateAction<TrackForm>>;
  moduleForm: ModuleForm;
  setModuleForm: Dispatch<SetStateAction<ModuleForm>>;
  trainingForm: TrainingForm;
  setTrainingForm: Dispatch<SetStateAction<TrainingForm>>;
  quizForm: QuizForm;
  setQuizForm: Dispatch<SetStateAction<QuizForm>>;

  tracks: TrackItem[];
  modules: ModuleItem[];
  filteredModules: ModuleItem[];

  submitting: StudioSubmitting;
  submitTrack: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitModule: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitTraining: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitQuiz: (event: FormEvent<HTMLFormElement>) => Promise<void>;

  uploadingTrainingFile: boolean;
  uploadedTrainingFiles: UploadedFileItem[];
  handleUploadTrainingFile: (file: File) => Promise<void>;
  insertFileLinkInTrainingContent: (file: UploadedFileItem) => void;

  quizQuestions: QuizQuestionForm[];
  setQuizQuestions: Dispatch<SetStateAction<QuizQuestionForm[]>>;
  createQuestion: () => QuizQuestionForm;
  createOption: () => { id: string; content: string; isCorrect: boolean };
  updateQuestion: (
    questionId: string,
    updater: (current: QuizQuestionForm) => QuizQuestionForm
  ) => void;
  removeQuestion: (questionId: string) => void;
  setQuestionType: (questionId: string, type: QuizQuestionForm['type']) => void;
  toggleOptionCorrectness: (questionId: string, optionId: string) => void;
  moveQuestion: (sourceIndex: number, targetIndex: number) => void;
  moveOption: (questionId: string, sourceIndex: number, targetIndex: number) => void;
};

export function GuidedCreationCard({
  activeTab,
  setActiveTab,
  trackForm,
  setTrackForm,
  moduleForm,
  setModuleForm,
  trainingForm,
  setTrainingForm,
  quizForm,
  setQuizForm,
  tracks,
  modules,
  filteredModules,
  submitting,
  submitTrack,
  submitModule,
  submitTraining,
  submitQuiz,
  uploadingTrainingFile,
  uploadedTrainingFiles,
  handleUploadTrainingFile,
  insertFileLinkInTrainingContent,
  quizQuestions,
  setQuizQuestions,
  createQuestion,
  createOption,
  updateQuestion,
  removeQuestion,
  setQuestionType,
  toggleOptionCorrectness,
  moveQuestion,
  moveOption,
}: GuidedCreationCardProps) {
  const creationSteps: Array<{ key: ActiveStudioTab; label: string; helper: string }> = [
    { key: 'track', label: 'Trilha', helper: 'Defina o objetivo macro.' },
    { key: 'module', label: 'Módulo', helper: 'Organize a jornada em blocos.' },
    { key: 'training', label: 'Aula', helper: 'Publique conteúdo da etapa.' },
    { key: 'quiz', label: 'Quiz', helper: 'Valide aprendizado.' },
  ];

  const currentStepIndex = creationSteps.findIndex((step) => step.key === activeTab);
  const previousStep = currentStepIndex > 0 ? creationSteps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex >= 0 && currentStepIndex < creationSteps.length - 1
      ? creationSteps[currentStepIndex + 1]
      : null;

  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);

  const [draggingOption, setDraggingOption] = useState<{
    questionId: string;
    optionId: string;
  } | null>(null);
  const [dragOverOptionId, setDragOverOptionId] = useState<string | null>(null);

  const [showMarkdownPreview, setShowMarkdownPreview] = useState(true);

  const handleQuestionDrop = (event: DragEvent, targetQuestionId: string) => {
    event.preventDefault();

    if (!draggingQuestionId || draggingQuestionId === targetQuestionId) return;

    const sourceIndex = quizQuestions.findIndex((question) => question.id === draggingQuestionId);
    const targetIndex = quizQuestions.findIndex((question) => question.id === targetQuestionId);

    if (sourceIndex >= 0 && targetIndex >= 0) {
      moveQuestion(sourceIndex, targetIndex);
    }

    setDraggingQuestionId(null);
    setDragOverQuestionId(null);
  };

  const handleOptionDrop = (event: DragEvent, questionId: string, targetOptionId: string) => {
    event.preventDefault();

    if (!draggingOption || draggingOption.questionId !== questionId) return;
    if (draggingOption.optionId === targetOptionId) return;

    const question = quizQuestions.find((item) => item.id === questionId);
    if (!question) return;

    const sourceIndex = question.options.findIndex(
      (option) => option.id === draggingOption.optionId
    );
    const targetIndex = question.options.findIndex((option) => option.id === targetOptionId);

    if (sourceIndex >= 0 && targetIndex >= 0) {
      moveOption(questionId, sourceIndex, targetIndex);
    }

    setDraggingOption(null);
    setDragOverOptionId(null);
  };

  return (
    <Card className="border-border/80">
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Wizard de criação</CardTitle>
        <CardDescription>Fluxo em etapas para montar trilha, conteúdo e validação.</CardDescription>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        <div className="grid gap-2 md:grid-cols-4">
          {creationSteps.map((step, index) => {
            const isCurrent = step.key === activeTab;
            const isDone = currentStepIndex > index;

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveTab(step.key)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  isCurrent
                    ? 'border-primary/50 bg-primary/5'
                    : isDone
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/80 hover:bg-muted/40'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Etapa {index + 1}
                  </p>
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold">{step.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{step.helper}</p>
              </button>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="track" className="pt-4">
            <form onSubmit={(event) => void submitTrack(event)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="track-title">Título da trilha</Label>
                <Input
                  id="track-title"
                  placeholder="Ex: Fundamentos de Segurança"
                  value={trackForm.title}
                  onChange={(e) => setTrackForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="track-description">Descrição</Label>
                <Textarea
                  id="track-description"
                  placeholder="Objetivo e escopo da trilha"
                  value={trackForm.description}
                  onChange={(e) =>
                    setTrackForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <Button type="submit" disabled={submitting.track}>
                {submitting.track ? 'Criando...' : 'Criar trilha'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="module" className="pt-4">
            <form onSubmit={(event) => void submitModule(event)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="module-track">Trilha</Label>
                <Select
                  id="module-track"
                  value={moduleForm.trackId}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, trackId: e.target.value }))}
                >
                  <option value="">Selecione a trilha</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-title">Título do módulo</Label>
                <Input
                  id="module-title"
                  placeholder="Ex: Conceitos básicos"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-description">Descrição</Label>
                <Textarea
                  id="module-description"
                  placeholder="Resumo do módulo"
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module-position">Posição</Label>
                <Input
                  id="module-position"
                  type="number"
                  min={0}
                  value={moduleForm.position}
                  onChange={(e) => setModuleForm((prev) => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <Button type="submit" disabled={submitting.module || tracks.length === 0}>
                {submitting.module ? 'Criando...' : 'Criar módulo'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="training" className="pt-4">
            <form onSubmit={(event) => void submitTraining(event)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="training-module">Módulo</Label>
                <Select
                  id="training-module"
                  value={trainingForm.moduleId}
                  onChange={(e) =>
                    setTrainingForm((prev) => ({ ...prev, moduleId: e.target.value }))
                  }
                >
                  <option value="">Selecione o módulo</option>
                  {filteredModules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id}>
                      {moduleItem.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-title">Título da aula</Label>
                <Input
                  id="training-title"
                  placeholder="Ex: Introdução à trilha"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-description">Descrição</Label>
                <Textarea
                  id="training-description"
                  placeholder="Resumo da aula"
                  value={trainingForm.description}
                  onChange={(e) =>
                    setTrainingForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="training-content">Conteúdo</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className="flex items-center gap-2"
                  >
                    {showMarkdownPreview ? (
                      <>
                        <EyeOff className="size-3" />
                        Ocultar preview
                      </>
                    ) : (
                      <>
                        <Eye className="size-3" />
                        Mostrar preview
                      </>
                    )}
                  </Button>
                </div>

                {showMarkdownPreview ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Editor (Markdown)</Label>
                      <Textarea
                        id="training-content"
                        placeholder="Digite o conteúdo em markdown...
Ex: # Título

## Subtítulo

- Item 1
- Item 2

**Texto em negrito** e *texto em itálico*"
                        className="min-h-64 lg:min-h-80 font-mono text-sm"
                        value={trainingForm.content}
                        onChange={(e) =>
                          setTrainingForm((prev) => ({ ...prev, content: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Preview</Label>
                      <div className="border border-border/70 rounded-md p-4 min-h-64 lg:min-h-80 overflow-y-auto bg-background">
                        <MarkdownPreview content={trainingForm.content} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id="training-content"
                    placeholder="Texto da aula ou URL do vídeo (suporta markdown)"
                    className="min-h-24"
                    value={trainingForm.content}
                    onChange={(e) =>
                      setTrainingForm((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
                )}

                <p className="text-xs text-muted-foreground">
                  Suporte completo a markdown. Use # para títulos, ** para negrito, * para itálico,
                  - para listas, e mais.
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Label htmlFor="training-file" className="flex items-center gap-2">
                  <Paperclip className="size-4" />
                  Anexar arquivo (opcional)
                </Label>
                <Input
                  id="training-file"
                  type="file"
                  disabled={uploadingTrainingFile}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void handleUploadTrainingFile(file);
                    event.target.value = '';
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  O arquivo é enviado para o backend e pode ser inserido no conteúdo da aula como
                  link.
                </p>

                {uploadedTrainingFiles.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {uploadedTrainingFiles.slice(0, 4).map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/70 p-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{file.filename}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{file.path}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="shrink-0"
                          onClick={() => insertFileLinkInTrainingContent(file)}
                        >
                          <LinkIcon className="size-3" />
                          Inserir link
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" disabled={submitting.training || modules.length === 0}>
                {submitting.training ? 'Criando...' : 'Criar aula'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="quiz" className="pt-4">
            <form onSubmit={(event) => void submitQuiz(event)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="quiz-module">Módulo</Label>
                <Select
                  id="quiz-module"
                  value={quizForm.moduleId}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, moduleId: e.target.value }))}
                >
                  <option value="">Selecione o módulo</option>
                  {filteredModules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id}>
                      {moduleItem.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-title">Título do quiz</Label>
                <Input
                  id="quiz-title"
                  placeholder="Ex: Verificação de conhecimento"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-description">Descrição</Label>
                <Textarea
                  id="quiz-description"
                  placeholder="Orientações do quiz"
                  value={quizForm.description}
                  onChange={(e) =>
                    setQuizForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-position">Posição</Label>
                <Input
                  id="quiz-position"
                  type="number"
                  min={0}
                  value={quizForm.position}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm">Perguntas do quiz</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setQuizQuestions((prev) => [...prev, createQuestion()])}
                  >
                    <Plus className="size-3" />
                    Nova pergunta
                  </Button>
                </div>

                <div className="space-y-3">
                  {quizQuestions.map((question, questionIndex) => (
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
                            disabled={quizQuestions.length <= 1}
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
                              setDraggingOption({ questionId: question.id, optionId: option.id })
                            }
                            onDragOver={(event) => {
                              if (!draggingOption || draggingOption.questionId !== question.id)
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
                            onDrop={(event) => handleOptionDrop(event, question.id, option.id)}
                            className={`flex items-center gap-2 rounded-md p-1 transition-colors ${
                              dragOverOptionId === option.id
                                ? 'bg-primary/5 ring-1 ring-primary/40'
                                : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleOptionCorrectness(question.id, option.id)}
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

                            {question.type !== 'TRUE_FALSE' && question.options.length > 2 && (
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

              <Button type="submit" disabled={submitting.quiz || modules.length === 0}>
                {submitting.quiz ? 'Criando...' : 'Criar quiz'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!previousStep}
            onClick={() => previousStep && setActiveTab(previousStep.key)}
          >
            <ChevronLeft className="size-4" />
            Etapa anterior
          </Button>

          <p className="text-xs text-muted-foreground">
            Etapa atual:{' '}
            <span className="font-medium text-foreground">
              {creationSteps[currentStepIndex]?.label}
            </span>
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!nextStep}
            onClick={() => nextStep && setActiveTab(nextStep.key)}
          >
            Próxima etapa
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
