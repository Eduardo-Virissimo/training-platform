export type TrackItem = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
};

export type ModuleItem = {
  id: string;
  trackId: string;
  title: string;
  description?: string | null;
  position: number;
  createdAt: string;
};

export type TrainingItem = {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuizQuestionItem = {
  id: string;
  content: string;
  type?: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  options?: Array<{
    id: string;
    content: string;
    isCorrect?: boolean;
  }>;
};

export type QuizModuleItem = {
  moduleId: string;
  position: number;
};

export type QuizItem = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  modules: QuizModuleItem[];
  questions: QuizQuestionItem[];
};

export type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message?: string;
  };
};

export type UploadedFileItem = {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  key: string;
  createdAt: string;
};

export type QuizOptionForm = {
  id: string;
  content: string;
  isCorrect: boolean;
};

export type QuizQuestionForm = {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE';
  options: QuizOptionForm[];
};

export type TrackEditForm = {
  title: string;
  description: string;
};

export type ModuleEditForm = {
  title: string;
  description: string;
  position: string;
};

export type TrainingEditForm = {
  title: string;
  description: string;
  content: string;
};

export type QuizEditForm = {
  title: string;
  description: string;
  position: string;
};

export type TrackForm = {
  title: string;
  description: string;
};

export type ModuleForm = {
  trackId: string;
  title: string;
  description: string;
  position: string;
};

export type TrainingForm = {
  moduleId: string;
  title: string;
  description: string;
  content: string;
};

export type QuizForm = {
  moduleId: string;
  title: string;
  description: string;
  position: string;
};

export type StudioSubmitting = {
  track: boolean;
  module: boolean;
  training: boolean;
  quiz: boolean;
};

export type ActiveStudioTab = 'track' | 'module' | 'training' | 'quiz';
