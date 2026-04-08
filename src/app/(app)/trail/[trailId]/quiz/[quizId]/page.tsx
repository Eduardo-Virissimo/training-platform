'use client';

import ProgressRing from '@/components/platform/ProgressRing';
import { fetchQuizCurrentAttempt, submitQuizAnswer } from '@/lib/platform-api';
import { usePlatformState } from '@/hooks/use-platform-state';
import { QuizAttemptCurrentResponse, QuizAttemptSubmitResponse } from '@/types/platform.types';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type AnswerMap = Record<string, string>;
type CompletedSubmit = Extract<QuizAttemptSubmitResponse, { completed: true }>;

export default function QuizPage() {
  const params = useParams<{ trailId: string; quizId: string }>();
  const { state, refresh } = usePlatformState();

  const [attemptData, setAttemptData] = useState<QuizAttemptCurrentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<CompletedSubmit | null>(null);

  const trail = useMemo(
    () => state?.tracks.find((item) => item.id === params.trailId),
    [params.trailId, state?.tracks]
  );

  const applyCurrentQuestionSelection = useCallback(
    (questionIndex: number, nextAnswers: AnswerMap, data: QuizAttemptCurrentResponse) => {
      const question = data.questions[questionIndex];
      if (!question) {
        setSelectedOption(null);
        return;
      }

      setSelectedOption(nextAnswers[question.id] ?? null);
    },
    []
  );

  const resolveInitialQuestionIndex = useCallback(
    (data: QuizAttemptCurrentResponse, nextAnswers: AnswerMap) => {
      const firstUnanswered = data.questions.findIndex((question) => !nextAnswers[question.id]);
      if (firstUnanswered >= 0) {
        return firstUnanswered;
      }

      return data.questions.length > 0 ? 0 : -1;
    },
    []
  );

  const loadCurrentAttempt = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchQuizCurrentAttempt(params.quizId);
      const normalizedAnswers: AnswerMap = Object.fromEntries(
        data.answers.map((answer) => [answer.questionId, answer.optionId])
      );

      const initialIndex = resolveInitialQuestionIndex(data, normalizedAnswers);

      setAttemptData(data);
      setAnswers(normalizedAnswers);
      setFinalResult(null);
      setCurrentQuestionIndex(initialIndex >= 0 ? initialIndex : 0);
      applyCurrentQuestionSelection(initialIndex >= 0 ? initialIndex : 0, normalizedAnswers, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o quiz.');
    } finally {
      setLoading(false);
    }
  }, [applyCurrentQuestionSelection, params.quizId, resolveInitialQuestionIndex]);

  useEffect(() => {
    void loadCurrentAttempt();
  }, [loadCurrentAttempt]);

  const moveToNextQuestion = useCallback(
    (nextAnswers: AnswerMap, data: QuizAttemptCurrentResponse) => {
      const nextIndex = data.questions.findIndex(
        (question, index) => index > currentQuestionIndex && !nextAnswers[question.id]
      );

      const fallbackIndex =
        nextIndex >= 0
          ? nextIndex
          : data.questions.findIndex((question) => !nextAnswers[question.id]);

      if (fallbackIndex >= 0) {
        setCurrentQuestionIndex(fallbackIndex);
        applyCurrentQuestionSelection(fallbackIndex, nextAnswers, data);
        return;
      }

      const lastIndex = Math.min(currentQuestionIndex + 1, Math.max(data.questions.length - 1, 0));
      setCurrentQuestionIndex(lastIndex);
      applyCurrentQuestionSelection(lastIndex, nextAnswers, data);
    },
    [applyCurrentQuestionSelection, currentQuestionIndex]
  );

  const handleSubmitCurrentAnswer = async () => {
    if (!attemptData || selectedOption === null) {
      return;
    }

    const currentQuestion = attemptData.questions[currentQuestionIndex];
    if (!currentQuestion) {
      return;
    }

    const currentSavedOption = answers[currentQuestion.id];
    const unchangedAnswer = currentSavedOption === selectedOption;

    if (unchangedAnswer) {
      moveToNextQuestion(answers, attemptData);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const submitResponse = await submitQuizAnswer(selectedOption);
      const nextAnswers = {
        ...answers,
        [currentQuestion.id]: selectedOption,
      };

      setAnswers(nextAnswers);

      if (submitResponse.completed) {
        setFinalResult(submitResponse);
        await refresh();
        return;
      }

      moveToNextQuestion(nextAnswers, attemptData);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Nao foi possivel salvar a resposta do quiz.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = async () => {
    setSubmitError(null);
    setFinalResult(null);
    await loadCurrentAttempt();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando quiz...</p>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          {error || 'Quiz nao encontrado.'}
        </p>
      </div>
    );
  }

  if (attemptData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">Quiz sem perguntas disponiveis.</p>
      </div>
    );
  }

  if (finalResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-[720px] mx-auto px-6 h-12 flex items-center">
            <Link
              href={`/trail/${params.trailId}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Voltar
            </Link>
          </div>
        </header>
        <main className="max-w-[480px] mx-auto px-6 py-20 text-center animate-soft-fade-up">
          <ProgressRing
            progress={Math.round(finalResult.score)}
            size={80}
            strokeWidth={5}
            className="mb-6"
          />
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {finalResult.passed ? 'Parabens!' : 'Quase la!'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sua pontuacao foi{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {Math.round(finalResult.score)}%
            </span>{' '}
            ({finalResult.answeredQuestionsCount}/{finalResult.totalQuestions} respostas).
          </p>
          {submitError && <p className="text-sm text-destructive mb-4">{submitError}</p>}
          <div className="flex gap-3 justify-center">
            <Link
              href={`/trail/${params.trailId}`}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors duration-200"
            >
              Voltar a trilha
            </Link>
            <button
              onClick={() => {
                void resetQuiz();
              }}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-105 transition-all duration-200"
            >
              Refazer quiz
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = attemptData.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground text-center">
          Nao foi possivel abrir a pergunta.
        </p>
      </div>
    );
  }

  const answeredQuestionsCount = Object.keys(answers).length;
  const progress = Math.round((answeredQuestionsCount / attemptData.totalQuestions) * 100);
  const currentSavedOption = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[720px] mx-auto px-6 h-12 flex items-center justify-between">
          <Link
            href={`/trail/${params.trailId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            {trail?.title || 'Trilha'}
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.min(currentQuestionIndex + 1, attemptData.totalQuestions)}/
            {attemptData.totalQuestions}
          </span>
        </div>
      </header>

      <div className="h-1 bg-muted">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="max-w-[480px] mx-auto px-6 py-12">
        <div key={currentQuestion.id} className="animate-soft-fade-up">
          <h2 className="text-lg font-bold tracking-tight mb-2 leading-snug">
            {currentQuestion.content}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {currentSavedOption
              ? 'Pergunta ja respondida, voce pode alterar se quiser.'
              : 'Selecione uma opcao.'}
          </p>

          <div className="space-y-2 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/[0.05]'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-1">{option.content}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {submitError && <p className="text-sm text-destructive mb-4">{submitError}</p>}

          <button
            onClick={() => {
              void handleSubmitCurrentAnswer();
            }}
            disabled={selectedOption === null || submitting}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedOption !== null && !submitting
                ? 'bg-primary text-primary-foreground hover:brightness-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {submitting
              ? 'Salvando...'
              : currentQuestionIndex + 1 >= attemptData.totalQuestions
                ? 'Finalizar quiz'
                : 'Salvar e continuar'}
            {!submitting && <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </main>
    </div>
  );
}
