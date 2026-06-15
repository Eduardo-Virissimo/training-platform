import {
  PlatformState,
  QuizAttemptCurrentResponse,
  QuizAttemptSubmitResponse,
  TrackRankingResponse,
} from '@/types/platform.types';

type ApiEnvelope<T> = {
  data: T;
};

type ApiErrorEnvelope = {
  error?: {
    message?: string;
  };
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!response.ok) {
    const errorMessage =
      payload && 'error' in payload
        ? payload.error?.message || 'Falha ao comunicar com a API.'
        : 'Falha ao comunicar com a API.';

    throw new Error(errorMessage);
  }

  if (!payload || !('data' in payload)) {
    throw new Error('Resposta invalida da API.');
  }

  return payload.data;
}

export async function fetchPlatformState(): Promise<PlatformState> {
  const response = await fetch('/api/platform/state', {
    method: 'GET',
    cache: 'no-store',
  });

  return parseApiResponse<PlatformState>(response);
}

export async function completeLesson(lessonId: string): Promise<void> {
  const response = await fetch('/api/platform/lesson/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lessonId,
    }),
  });

  await parseApiResponse<{ completed: boolean }>(response);
}

export async function fetchQuizCurrentAttempt(quizId: string): Promise<QuizAttemptCurrentResponse> {
  const query = new URLSearchParams({
    quizId,
  });

  const response = await fetch(`/api/quiz/attempt/current?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  return parseApiResponse<QuizAttemptCurrentResponse>(response);
}

export async function submitQuizAnswer(optionId: string): Promise<QuizAttemptSubmitResponse> {
  const response = await fetch('/api/quiz/attempt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      optionId,
    }),
  });

  return parseApiResponse<QuizAttemptSubmitResponse>(response);
}

export async function fetchTrackRanking(trackId: string, limit = 5): Promise<TrackRankingResponse> {
  const query = new URLSearchParams({
    limit: String(limit),
  });

  const response = await fetch(`/api/track/${trackId}/ranking?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  return parseApiResponse<TrackRankingResponse>(response);
}
