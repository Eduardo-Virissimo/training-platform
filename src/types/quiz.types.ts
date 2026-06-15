export type QuizOptionInput = {
  content: string;
  isCorrect: boolean;
};

export type QuizQuestionInput = {
  content: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  options: QuizOptionInput[];
};

export type QuizCreateData = {
  title: string;
  description?: string;
  moduleId: string;
  position?: number;
  questions?: QuizQuestionInput[];
};

export type QuizUpdateData = {
  title?: string;
  description?: string;
  moduleId?: string;
  position?: number;
  questions?: QuizQuestionInput[];
};

export type QuizSearchFilters = {
  id?: string;
  title?: string;
  moduleId?: string;
  userId?: string;
};

export type QuizAttemptSubmitData = {
  optionId?: string;
  optionIds?: string[];
};

export type QuizAttemptFilters = {
  quizId?: string;
  userId?: string;
};

export type QuizAttemptProgressResponse = {
  attemptId: string;
  quizId: string;
  completed: false;
  answeredQuestionsCount: number;
  totalQuestions: number;
};

export type QuizAttemptResultResponse = {
  attemptId: string;
  quizId: string;
  completed: true;
  answeredQuestionsCount: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
};

export type QuizAttemptSubmitResponse = QuizAttemptProgressResponse | QuizAttemptResultResponse;

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
  questions: Array<{
    id: string;
    content: string;
    type: string;
    options: Array<{
      id: string;
      content: string;
    }>;
  }>;
};
