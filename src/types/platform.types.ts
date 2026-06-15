export type PlatformLessonType = 'video' | 'text' | 'quiz';
export type PlatformTrailStatus = 'completed' | 'active' | 'locked';

export type PlatformUser = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  xp: number;
  streak: number;
};

export type PlatformLesson = {
  id: string;
  title: string;
  type: PlatformLessonType;
  duration: string;
  completed: boolean;
  content?: string | null;
  questionCount?: number;
};

export type PlatformModule = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  locked: boolean;
  lessons: PlatformLesson[];
};

export type PlatformTrail = {
  id: string;
  title: string;
  description: string | null;
  xp: number;
  progress: number;
  status: PlatformTrailStatus;
  modules: PlatformModule[];
};

export type PlatformState = {
  user: PlatformUser;
  completedTracks: number;
  tracks: PlatformTrail[];
};

export type QuizAttemptCurrentQuestion = {
  id: string;
  content: string;
  type: string;
  options: Array<{
    id: string;
    content: string;
  }>;
};

export type QuizAttemptCurrentResponse = {
  hasOpenAttempt: boolean;
  attemptId?: string;
  quizId: string;
  completed: boolean;
  answeredQuestionsCount: number;
  totalQuestions: number;
  score?: number;
  passed?: boolean;
  answers: Array<{
    questionId: string;
    optionId: string;
  }>;
  questions: QuizAttemptCurrentQuestion[];
};

export type RankingEntry = {
  position: number;
  userId: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
};

export type TrackRankingResponse = {
  trackId: string;
  total: number;
  ranking: RankingEntry[];
};

export type QuizAttemptSubmitResponse =
  | {
      attemptId: string;
      quizId: string;
      completed: false;
      answeredQuestionsCount: number;
      totalQuestions: number;
    }
  | {
      attemptId: string;
      quizId: string;
      completed: true;
      answeredQuestionsCount: number;
      totalQuestions: number;
      score: number;
      passed: boolean;
    };
