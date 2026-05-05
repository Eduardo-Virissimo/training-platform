'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, FormEvent, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { SnackbarContainer } from '@/components/ui/snackbar';
import { useSnackbar } from '@/hooks/use-snackbar';

import { ContentStructureCard } from './_components/content-structure-card';
import { GuidedCreationCard } from './_components/guided-creation-card';
import { LatestPublicationsCard } from './_components/latest-publications-card';
import { PublicationPrioritiesCard } from './_components/publication-priorities-card';
import { QuickManagementCard } from './_components/quick-management-card';
import { StudioOverviewCard } from './_components/studio-overview-card';
import { apiRequest } from './_lib/studio-api';
import { createOption, createQuestion } from './_lib/studio-quiz';
import type {
  ActiveStudioTab,
  ModuleEditForm,
  ModuleItem,
  QuizEditForm,
  QuizItem,
  QuizQuestionForm,
  TrackEditForm,
  TrackItem,
  TrainingEditForm,
  TrainingItem,
  UploadedFileItem,
} from './_lib/studio-types';

export default function InstructorStudio() {
  type WorkspaceTab = 'create' | 'structure' | 'operations' | 'insights';

  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const { snackbars, showSnackbar, closeSnackbar } = useSnackbar();
  const showSnackbarRef = useRef(showSnackbar);
  showSnackbarRef.current = showSnackbar;

  const [trackForm, setTrackForm] = useState({ title: '', description: '' });
  const [moduleForm, setModuleForm] = useState({
    trackId: '',
    title: '',
    description: '',
    position: '0',
  });
  const [trainingForm, setTrainingForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    content: '',
  });
  const [quizForm, setQuizForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    position: '0',
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionForm[]>([createQuestion()]);
  const [uploadedTrainingFiles, setUploadedTrainingFiles] = useState<UploadedFileItem[]>([]);
  const [uploadingTrainingFile, setUploadingTrainingFile] = useState(false);

  const [submitting, setSubmitting] = useState({
    track: false,
    module: false,
    training: false,
    quiz: false,
  });

  const [activeTab, setActiveTab] = useState<ActiveStudioTab>('track');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('create');
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackEditForm, setTrackEditForm] = useState<TrackEditForm>({ title: '', description: '' });

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleEditForm, setModuleEditForm] = useState<ModuleEditForm>({
    title: '',
    description: '',
    position: '0',
  });

  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingEditForm, setTrainingEditForm] = useState<TrainingEditForm>({
    title: '',
    description: '',
    content: '',
  });

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizEditForm, setQuizEditForm] = useState<QuizEditForm>({
    title: '',
    description: '',
    position: '0',
    questions: [],
  });

  const moduleById = useMemo(
    () => new Map(modules.map((moduleItem) => [moduleItem.id, moduleItem])),
    [modules]
  );

  const trackById = useMemo(() => new Map(tracks.map((item) => [item.id, item])), [tracks]);

  const loadData = useCallback(async () => {
    try {
      setSyncing(true);

      const [trackData, moduleData, trainingData, quizData] = await Promise.all([
        apiRequest<TrackItem[]>('/api/track'),
        apiRequest<ModuleItem[]>('/api/module'),
        apiRequest<TrainingItem[]>('/api/training'),
        apiRequest<QuizItem[]>('/api/quiz'),
      ]);

      setTracks(trackData);
      setModules(moduleData);
      setTrainings(trainingData);
      setQuizzes(quizData);

      setModuleForm((prev) => ({
        ...prev,
        trackId: prev.trackId || trackData[0]?.id || '',
      }));
      setTrainingForm((prev) => ({
        ...prev,
        moduleId: prev.moduleId || moduleData[0]?.id || '',
      }));
      setQuizForm((prev) => ({
        ...prev,
        moduleId: prev.moduleId || moduleData[0]?.id || '',
      }));
    } catch (err) {
      showSnackbarRef.current(
        err instanceof Error ? err.message : 'Falha ao carregar dados.',
        'error'
      );
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredModules = useMemo(() => {
    if (!moduleForm.trackId) return modules;
    return modules.filter((item) => item.trackId === moduleForm.trackId);
  }, [modules, moduleForm.trackId]);

  const modulesByTrack = useMemo(() => {
    const grouped = new Map<string, ModuleItem[]>();

    for (const moduleItem of modules) {
      const list = grouped.get(moduleItem.trackId) ?? [];
      list.push(moduleItem);
      grouped.set(moduleItem.trackId, list);
    }

    for (const list of grouped.values()) {
      list.sort((a, b) => a.position - b.position);
    }

    return grouped;
  }, [modules]);

  const quizzesByModule = useMemo(() => {
    const grouped = new Map<string, QuizItem[]>();

    for (const quiz of quizzes) {
      for (const relation of quiz.modules ?? []) {
        const list = grouped.get(relation.moduleId) ?? [];
        list.push(quiz);
        grouped.set(relation.moduleId, list);
      }
    }

    return grouped;
  }, [quizzes]);

  const modulesWithoutQuiz = useMemo(
    () =>
      modules.filter((moduleItem) => {
        const moduleQuizzes = quizzesByModule.get(moduleItem.id) ?? [];
        return moduleQuizzes.length === 0;
      }),
    [modules, quizzesByModule]
  );

  const trainingsSorted = useMemo(
    () => [...trainings].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [trainings]
  );

  const quizzesSorted = useMemo(
    () => [...quizzes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [quizzes]
  );

  const latestItems = useMemo(() => {
    const moduleEvents = modules.map((item) => ({
      id: item.id,
      type: 'Módulo' as const,
      title: item.title,
      date: item.createdAt,
    }));

    const trainingEvents = trainings.map((item) => ({
      id: item.id,
      type: 'Aula' as const,
      title: item.title,
      date: item.createdAt,
    }));

    const quizEvents = quizzes.map((item) => ({
      id: item.id,
      type: 'Quiz' as const,
      title: item.title,
      date: item.createdAt,
    }));

    return [...moduleEvents, ...trainingEvents, ...quizEvents]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 8);
  }, [modules, trainings, quizzes]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const runEntityAction = async (actionId: string, action: () => Promise<void>) => {
    try {
      setBusyActionId(actionId);
      await action();
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao processar ação.', 'error');
    } finally {
      setBusyActionId(null);
    }
  };

  const buildEntityQuery = (basePath: string, id: string) => {
    const query = new URLSearchParams({ id });
    return `${basePath}?${query.toString()}`;
  };

  const openTrackEditor = (track: TrackItem) => {
    setEditingTrackId(track.id);
    setTrackEditForm({
      title: track.title,
      description: track.description ?? '',
    });
  };

  const saveTrackEdition = async (trackId: string) => {
    if (!trackEditForm.title.trim()) {
      showSnackbar('Informe o título da trilha.', 'error');
      return;
    }

    await runEntityAction(`track-update-${trackId}`, async () => {
      await apiRequest<TrackItem>(buildEntityQuery('/api/track', trackId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trackEditForm.title.trim(),
          description: trackEditForm.description.trim() || undefined,
        }),
      });

      setEditingTrackId(null);
      showSnackbar('Trilha atualizada com sucesso.', 'success');
    });
  };

  const removeTrack = async (trackId: string, trackTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a trilha "${trackTitle}"?`)) {
      return;
    }

    await runEntityAction(`track-delete-${trackId}`, async () => {
      await apiRequest<unknown>(buildEntityQuery('/api/track', trackId), {
        method: 'DELETE',
      });

      setEditingTrackId((prev) => (prev === trackId ? null : prev));
      showSnackbar('Trilha excluída com sucesso.', 'success');
    });
  };

  const openModuleEditor = (moduleItem: ModuleItem) => {
    setEditingModuleId(moduleItem.id);
    setModuleEditForm({
      title: moduleItem.title,
      description: moduleItem.description ?? '',
      position: String(moduleItem.position),
    });
  };

  const saveModuleEdition = async (moduleId: string) => {
    if (!moduleEditForm.title.trim()) {
      showSnackbar('Informe o título do módulo.', 'error');
      return;
    }

    await runEntityAction(`module-update-${moduleId}`, async () => {
      await apiRequest<ModuleItem>(buildEntityQuery('/api/module', moduleId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleEditForm.title.trim(),
          description: moduleEditForm.description.trim() || undefined,
          position: Number(moduleEditForm.position || 0),
        }),
      });

      setEditingModuleId(null);
      showSnackbar('Módulo atualizado com sucesso.', 'success');
    });
  };

  const removeModule = async (moduleId: string, moduleTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o módulo "${moduleTitle}"?`)) {
      return;
    }

    await runEntityAction(`module-delete-${moduleId}`, async () => {
      await apiRequest<unknown>(buildEntityQuery('/api/module', moduleId), {
        method: 'DELETE',
      });

      setEditingModuleId((prev) => (prev === moduleId ? null : prev));
      showSnackbar('Módulo excluído com sucesso.', 'success');
    });
  };

  const reorderModulesInTrack = async (
    trackId: string,
    sourceModuleId: string,
    targetModuleId: string
  ) => {
    if (sourceModuleId === targetModuleId) return;

    const trackModules = modulesByTrack.get(trackId) ?? [];
    const sourceIndex = trackModules.findIndex((item) => item.id === sourceModuleId);
    const targetIndex = trackModules.findIndex((item) => item.id === targetModuleId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const reordered = [...trackModules];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered
      .map((moduleItem, index) => ({
        id: moduleItem.id,
        previousPosition: moduleItem.position,
        nextPosition: index,
      }))
      .filter((item) => item.previousPosition !== item.nextPosition);

    if (updates.length === 0) return;

    await runEntityAction(`module-reorder-${trackId}`, async () => {
      await Promise.all(
        updates.map((item) =>
          apiRequest<ModuleItem>(buildEntityQuery('/api/module', item.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position: item.nextPosition,
            }),
          })
        )
      );

      showSnackbar('Ordem dos módulos atualizada com sucesso.', 'success');
    });
  };

  const openTrainingEditor = (training: TrainingItem) => {
    setEditingTrainingId(training.id);
    setTrainingEditForm({
      title: training.title,
      description: training.description ?? '',
      content: training.content ?? '',
    });
  };

  const saveTrainingEdition = async (trainingId: string) => {
    if (!trainingEditForm.title.trim()) {
      showSnackbar('Informe o título da aula.', 'error');
      return;
    }

    await runEntityAction(`training-update-${trainingId}`, async () => {
      await apiRequest<TrainingItem>(buildEntityQuery('/api/training', trainingId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trainingEditForm.title.trim(),
          description: trainingEditForm.description.trim() || undefined,
          content: trainingEditForm.content.trim() || undefined,
        }),
      });

      setEditingTrainingId(null);
      showSnackbar('Aula atualizada com sucesso.', 'success');
    });
  };

  const removeTraining = async (trainingId: string, trainingTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a aula "${trainingTitle}"?`)) {
      return;
    }

    await runEntityAction(`training-delete-${trainingId}`, async () => {
      await apiRequest<unknown>(buildEntityQuery('/api/training', trainingId), {
        method: 'DELETE',
      });

      setEditingTrainingId((prev) => (prev === trainingId ? null : prev));
      showSnackbar('Aula excluída com sucesso.', 'success');
    });
  };

  const openQuizEditor = (quiz: QuizItem) => {
    setEditingQuizId(quiz.id);
    setQuizEditForm({
      title: quiz.title,
      description: quiz.description ?? '',
      position: String(quiz.modules?.[0]?.position ?? 0),
      questions: quiz.questions.map((q) => ({
        id: q.id,
        content: q.content,
        type: q.type as QuizQuestionForm['type'],
        options:
          q.options?.map((o) => ({
            id: o.id,
            content: o.content,
            isCorrect: o.isCorrect ?? false,
          })) ?? [],
      })),
    });
  };

  const saveQuizEdition = async (quizId: string) => {
    if (!quizEditForm.title.trim()) {
      showSnackbar('Informe o título do quiz.', 'error');
      return;
    }

    const normalizedQuestions = quizEditForm.questions
      .map((question) => ({
        content: question.content.trim(),
        type: question.type,
        options: question.options
          .map((option) => ({
            content: option.content.trim(),
            isCorrect: option.isCorrect,
          }))
          .filter((option) => option.content.length > 0),
      }))
      .filter((question) => question.content.length > 0);

    if (normalizedQuestions.length === 0) {
      showSnackbar('Adicione ao menos uma pergunta no quiz.', 'error');
      return;
    }

    for (const question of normalizedQuestions) {
      if (question.options.length < 2) {
        showSnackbar('Cada pergunta precisa de ao menos 2 opções preenchidas.', 'error');
        return;
      }

      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (correctCount === 0) {
        showSnackbar('Marque pelo menos uma alternativa correta em cada pergunta.', 'error');
        return;
      }

      if (
        (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') &&
        correctCount !== 1
      ) {
        showSnackbar(
          'Perguntas de escolha única/Verdadeiro ou Falso devem ter somente uma opção correta.',
          'error'
        );
        return;
      }
    }

    await runEntityAction(`quiz-update-${quizId}`, async () => {
      await apiRequest<QuizItem>(buildEntityQuery('/api/quiz', quizId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizEditForm.title.trim(),
          description: quizEditForm.description.trim() || undefined,
          position: Number(quizEditForm.position || 0),
          questions: normalizedQuestions,
        }),
      });

      setEditingQuizId(null);
      showSnackbar('Quiz atualizado com sucesso.', 'success');
    });
  };

  const removeQuiz = async (quizId: string, quizTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o quiz "${quizTitle}"?`)) {
      return;
    }

    await runEntityAction(`quiz-delete-${quizId}`, async () => {
      await apiRequest<unknown>(buildEntityQuery('/api/quiz', quizId), {
        method: 'DELETE',
      });

      setEditingQuizId((prev) => (prev === quizId ? null : prev));
      showSnackbar('Quiz excluído com sucesso.', 'success');
    });
  };

  const submitTrack = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!trackForm.title.trim()) {
      showSnackbar('Informe o título da trilha.', 'error');
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, track: true }));

      const created = await apiRequest<TrackItem>('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trackForm.title.trim(),
          description: trackForm.description.trim() || undefined,
        }),
      });

      setTrackForm({ title: '', description: '' });
      setModuleForm((prev) => ({ ...prev, trackId: created.id }));
      showSnackbar('Trilha criada com sucesso.', 'success');
      setActiveTab('module');
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao criar trilha.', 'error');
    } finally {
      setSubmitting((prev) => ({ ...prev, track: false }));
    }
  };

  const submitModule = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!moduleForm.trackId) {
      showSnackbar('Selecione a trilha do módulo.', 'error');
      return;
    }

    if (!moduleForm.title.trim()) {
      showSnackbar('Informe o título do módulo.', 'error');
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, module: true }));

      const created = await apiRequest<ModuleItem>('/api/module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: moduleForm.trackId,
          title: moduleForm.title.trim(),
          description: moduleForm.description.trim() || undefined,
          position: Number(moduleForm.position || 0),
        }),
      });

      setModuleForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        position: String(Number(prev.position || 0) + 1),
      }));
      setTrainingForm((prev) => ({ ...prev, moduleId: created.id }));
      setQuizForm((prev) => ({ ...prev, moduleId: created.id }));
      showSnackbar('Módulo criado com sucesso.', 'success');
      setActiveTab('training');
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao criar módulo.', 'error');
    } finally {
      setSubmitting((prev) => ({ ...prev, module: false }));
    }
  };

  const submitTraining = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!trainingForm.moduleId) {
      showSnackbar('Selecione o módulo da aula.', 'error');
      return;
    }

    if (!trainingForm.title.trim()) {
      showSnackbar('Informe o título da aula.', 'error');
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, training: true }));

      await apiRequest('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: trainingForm.moduleId,
          title: trainingForm.title.trim(),
          description: trainingForm.description.trim() || undefined,
          content: trainingForm.content.trim() || undefined,
        }),
      });

      setTrainingForm((prev) => ({ ...prev, title: '', description: '', content: '' }));
      showSnackbar('Aula criada com sucesso.', 'success');
      setActiveTab('quiz');
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao criar aula.', 'error');
    } finally {
      setSubmitting((prev) => ({ ...prev, training: false }));
    }
  };

  const handleUploadTrainingFile = async (file: File) => {
    try {
      setUploadingTrainingFile(true);

      const formData = new FormData();
      formData.append('file', file);

      const uploaded = await apiRequest<UploadedFileItem>('/api/file', {
        method: 'POST',
        body: formData,
      });

      setUploadedTrainingFiles((prev) => [uploaded, ...prev]);
      showSnackbar(`Arquivo "${uploaded.filename}" enviado com sucesso.`, 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao enviar arquivo.', 'error');
    } finally {
      setUploadingTrainingFile(false);
    }
  };

  const insertFileLinkInTrainingContent = (file: UploadedFileItem) => {
    setTrainingForm((prev) => {
      const nextContent = prev.content
        ? `${prev.content.trim()}\n\n[Arquivo: ${file.filename}](${file.path})`
        : `[Arquivo: ${file.filename}](${file.path})`;

      return {
        ...prev,
        content: nextContent,
      };
    });
    showSnackbar(`Link do arquivo "${file.filename}" inserido no conteúdo.`, 'success');
  };

  const startModuleCreationFromTrack = (trackId: string) => {
    setModuleForm((prev) => ({
      ...prev,
      trackId,
    }));
    setWorkspaceTab('create');
    setActiveTab('module');
  };

  const startTrainingCreationFromModule = (moduleId: string, trackId: string) => {
    setModuleForm((prev) => ({
      ...prev,
      trackId,
    }));
    setTrainingForm((prev) => ({
      ...prev,
      moduleId,
    }));
    setWorkspaceTab('create');
    setActiveTab('training');
  };

  const startQuizCreationFromModule = (moduleId: string, trackId: string) => {
    setModuleForm((prev) => ({
      ...prev,
      trackId,
    }));
    setQuizForm((prev) => ({
      ...prev,
      moduleId,
    }));
    setWorkspaceTab('create');
    setActiveTab('quiz');
  };

  const updateQuestion = (
    questionId: string,
    updater: (current: QuizQuestionForm) => QuizQuestionForm
  ) => {
    setQuizQuestions((prev) => prev.map((item) => (item.id === questionId ? updater(item) : item)));
  };

  const removeQuestion = (questionId: string) => {
    setQuizQuestions((prev) =>
      prev.length <= 1 ? prev : prev.filter((item) => item.id !== questionId)
    );
  };

  const moveQuizQuestion = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    setQuizQuestions((prev) => {
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= prev.length ||
        targetIndex >= prev.length
      ) {
        return prev;
      }

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const moveQuizOption = (questionId: string, sourceIndex: number, targetIndex: number) => {
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

  const submitQuiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quizForm.moduleId) {
      showSnackbar('Selecione o módulo do quiz.', 'error');
      return;
    }

    if (!quizForm.title.trim()) {
      showSnackbar('Informe o título do quiz.', 'error');
      return;
    }

    const normalizedQuestions = quizQuestions
      .map((question) => ({
        content: question.content.trim(),
        type: question.type,
        options: question.options
          .map((option) => ({
            content: option.content.trim(),
            isCorrect: option.isCorrect,
          }))
          .filter((option) => option.content.length > 0),
      }))
      .filter((question) => question.content.length > 0);

    if (normalizedQuestions.length === 0) {
      showSnackbar('Adicione ao menos uma pergunta no quiz.', 'error');
      return;
    }

    for (const question of normalizedQuestions) {
      if (question.options.length < 2) {
        showSnackbar('Cada pergunta precisa de ao menos 2 opções preenchidas.', 'error');
        return;
      }

      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (correctCount === 0) {
        showSnackbar('Marque pelo menos uma alternativa correta em cada pergunta.', 'error');
        return;
      }

      if (
        (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') &&
        correctCount !== 1
      ) {
        showSnackbar(
          'Perguntas de escolha única/Verdadeiro ou Falso devem ter somente uma opção correta.',
          'error'
        );
        return;
      }
    }

    try {
      setSubmitting((prev) => ({ ...prev, quiz: true }));

      await apiRequest('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: quizForm.moduleId,
          title: quizForm.title.trim(),
          description: quizForm.description.trim() || undefined,
          position: Number(quizForm.position || 0),
          questions: normalizedQuestions,
        }),
      });

      setQuizForm((prev) => ({
        ...prev,
      }));

      showSnackbar('Quiz criado com sucesso.', 'success');
      setActiveTab('quiz');
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Falha ao criar quiz.', 'error');
    } finally {
      setSubmitting((prev) => ({ ...prev, quiz: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando painel do instrutor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80">
        <div className="max-w-300 mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <Button
            onClick={() => void loadData()}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-300 mx-auto px-6 py-8 space-y-6">
        <StudioOverviewCard />

        <Tabs value={workspaceTab} onValueChange={(tab) => setWorkspaceTab(tab as WorkspaceTab)}>
          <TabsList className="w-full grid grid-cols-4" variant="line">
            <TabsTrigger value="create">1. Criação</TabsTrigger>
            <TabsTrigger value="structure">2. Estrutura</TabsTrigger>
            <TabsTrigger value="operations">3. Operação</TabsTrigger>
            <TabsTrigger value="insights">4. Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="pt-4">
            <GuidedCreationCard
              activeTab={activeTab}
              setActiveTab={(tab) => setActiveTab(tab as ActiveStudioTab)}
              trackForm={trackForm}
              setTrackForm={setTrackForm}
              moduleForm={moduleForm}
              setModuleForm={setModuleForm}
              trainingForm={trainingForm}
              setTrainingForm={setTrainingForm}
              quizForm={quizForm}
              setQuizForm={setQuizForm}
              tracks={tracks}
              modules={modules}
              filteredModules={filteredModules}
              submitting={submitting}
              submitTrack={submitTrack}
              submitModule={submitModule}
              submitTraining={submitTraining}
              submitQuiz={submitQuiz}
              uploadingTrainingFile={uploadingTrainingFile}
              uploadedTrainingFiles={uploadedTrainingFiles}
              handleUploadTrainingFile={handleUploadTrainingFile}
              insertFileLinkInTrainingContent={insertFileLinkInTrainingContent}
              quizQuestions={quizQuestions}
              setQuizQuestions={setQuizQuestions}
              createQuestion={() => createQuestion()}
              createOption={() => createOption()}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              setQuestionType={setQuestionType}
              toggleOptionCorrectness={toggleOptionCorrectness}
              moveQuestion={moveQuizQuestion}
              moveOption={moveQuizOption}
            />
          </TabsContent>

          <TabsContent value="structure" className="pt-4">
            <ContentStructureCard
              tracks={tracks}
              modulesByTrack={modulesByTrack}
              quizzesByModule={quizzesByModule}
              formatDate={formatDate}
              busyActionId={busyActionId}
              editingTrackId={editingTrackId}
              trackEditForm={trackEditForm}
              setTrackEditForm={setTrackEditForm}
              setEditingTrackId={setEditingTrackId}
              openTrackEditor={openTrackEditor}
              saveTrackEdition={saveTrackEdition}
              removeTrack={removeTrack}
              editingModuleId={editingModuleId}
              moduleEditForm={moduleEditForm}
              setModuleEditForm={setModuleEditForm}
              setEditingModuleId={setEditingModuleId}
              openModuleEditor={openModuleEditor}
              saveModuleEdition={saveModuleEdition}
              removeModule={removeModule}
              reorderModulesInTrack={reorderModulesInTrack}
              startModuleCreationFromTrack={startModuleCreationFromTrack}
              startTrainingCreationFromModule={startTrainingCreationFromModule}
              startQuizCreationFromModule={startQuizCreationFromModule}
            />
          </TabsContent>

          <TabsContent value="operations" className="pt-4 space-y-6">
            <PublicationPrioritiesCard
              modulesWithoutQuiz={modulesWithoutQuiz}
              trackById={trackById}
              startQuizCreationFromModule={startQuizCreationFromModule}
            />

            <QuickManagementCard
              trainingsSorted={trainingsSorted}
              quizzesSorted={quizzesSorted}
              busyActionId={busyActionId}
              formatDate={formatDate}
              editingTrainingId={editingTrainingId}
              trainingEditForm={trainingEditForm}
              setTrainingEditForm={setTrainingEditForm}
              setEditingTrainingId={setEditingTrainingId}
              openTrainingEditor={openTrainingEditor}
              saveTrainingEdition={saveTrainingEdition}
              removeTraining={removeTraining}
              editingQuizId={editingQuizId}
              quizEditForm={quizEditForm}
              setQuizEditForm={setQuizEditForm}
              setEditingQuizId={setEditingQuizId}
              openQuizEditor={openQuizEditor}
              saveQuizEdition={saveQuizEdition}
              removeQuiz={removeQuiz}
            />
          </TabsContent>

          <TabsContent value="insights" className="pt-4 space-y-6">
            <Card>
              <CardHeader className="border-b border-border/70 pb-4">
                <CardTitle>Visão consolidada</CardTitle>
                <CardDescription>
                  Indicadores rápidos para acompanhamento editorial do estúdio.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Sem quiz', value: modulesWithoutQuiz.length },
                    { label: 'Aulas recentes', value: trainingsSorted.slice(0, 6).length },
                    { label: 'Quizzes recentes', value: quizzesSorted.slice(0, 6).length },
                    { label: 'Eventos no feed', value: latestItems.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold tabular-nums">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <LatestPublicationsCard
              latestItems={latestItems}
              quizzes={quizzes}
              moduleById={moduleById}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </main>

      <SnackbarContainer snackbars={snackbars} onClose={closeSnackbar} />
    </div>
  );
}
