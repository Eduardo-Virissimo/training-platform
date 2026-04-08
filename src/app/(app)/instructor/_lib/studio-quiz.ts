import type { QuizOptionForm, QuizQuestionForm } from './studio-types';

export const quizTypeLabels: Record<QuizQuestionForm['type'], string> = {
  SINGLE_CHOICE: 'Única escolha',
  MULTIPLE_CHOICE: 'Múltipla escolha',
  TRUE_FALSE: 'Verdadeiro/Falso',
};

export function createOption(content = '', isCorrect = false): QuizOptionForm {
  return {
    id: crypto.randomUUID(),
    content,
    isCorrect,
  };
}

export function createQuestion(type: QuizQuestionForm['type'] = 'SINGLE_CHOICE'): QuizQuestionForm {
  const defaultOptions =
    type === 'TRUE_FALSE'
      ? [createOption('Verdadeiro', true), createOption('Falso', false)]
      : [createOption(), createOption(), createOption(), createOption()];

  return {
    id: crypto.randomUUID(),
    content: '',
    type,
    options: defaultOptions,
  };
}
