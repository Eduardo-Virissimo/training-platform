import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  QuizAttemptFilters,
  QuizAttemptCurrentResponse,
  QuizAttemptSubmitData,
  QuizAttemptSubmitResponse,
  QuizCreateData,
  QuizSearchFilters,
  QuizUpdateData,
} from '@/types/quiz.types';
import { UserHandler } from '@/types/user.types';

const PASSING_SCORE = 70;

export const QuizService = {
  async create(data: QuizCreateData) {
    try {
      return await prisma.quiz.create({
        data: {
          title: data.title,
          description: data.description,
          modules: {
            create: {
              moduleId: data.moduleId,
              position: data.position ?? 0,
            },
          },
          questions: data.questions?.length
            ? {
                create: data.questions.map((question) => ({
                  content: question.content,
                  type: question.type,
                  options: {
                    create: question.options,
                  },
                })),
              }
            : undefined,
        },
        include: {
          modules: true,
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    } catch {
      throw new AppError('Failed to create quiz', 500);
    }
  },

  async search(filters: QuizSearchFilters, user: UserHandler) {
    try {
      const targetUserId = user.role === 'ADMIN' ? filters.userId : user.id;
      const userTrackFilter = targetUserId
        ? {
            some: {
              userId: targetUserId,
            },
          }
        : undefined;

      return await prisma.quiz.findMany({
        where: {
          id: filters.id,
          title: filters.title,
          modules: {
            some: {
              moduleId: filters.moduleId,
              module: {
                track: {
                  userTracks: {
                    ...userTrackFilter,
                  },
                },
              },
            },
          },
        },
        include: {
          modules: true,
          questions: {
            include: {
              options: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      throw new AppError('Failed to search quizzes', 500);
    }
  },

  async update(id: string, data: QuizUpdateData) {
    try {
      const updatedQuiz = await prisma.$transaction(async (tx) => {
        const quiz = await tx.quiz.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
          },
        });

        if (data.moduleId) {
          await tx.moduleQuiz.deleteMany({ where: { quizId: id } });
          await tx.moduleQuiz.create({
            data: {
              quizId: id,
              moduleId: data.moduleId,
              position: data.position ?? 0,
            },
          });
        } else if (typeof data.position === 'number') {
          await tx.moduleQuiz.updateMany({
            where: { quizId: id },
            data: { position: data.position },
          });
        }

        if (data.questions?.length) {
          for (const question of data.questions) {
            await tx.question.create({
              data: {
                quizId: id,
                content: question.content,
                type: question.type,
                options: {
                  create: question.options,
                },
              },
            });
          }
        }

        return quiz;
      });

      return await prisma.quiz.findUnique({
        where: { id: updatedQuiz.id },
        include: {
          modules: true,
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Quiz not found', 404);
      }
      throw new AppError('Failed to update quiz', 500);
    }
  },

  async delete(id: string) {
    try {
      await prisma.quiz.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Quiz not found', 404);
      }
      throw new AppError('Failed to delete quiz', 500);
    }
  },

  async submitAttempt(
    data: QuizAttemptSubmitData,
    user: UserHandler
  ): Promise<QuizAttemptSubmitResponse> {
    const rawOptionIds = data.optionIds?.length
      ? data.optionIds
      : data.optionId
        ? [data.optionId]
        : [];

    if (rawOptionIds.length === 0) {
      throw new AppError('At least one option must be provided', 400);
    }

    const uniqueOptionIds = [...new Set(rawOptionIds)];

    const selectedOptions = await prisma.option.findMany({
      where: {
        id: {
          in: uniqueOptionIds,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            quizId: true,
          },
        },
      },
    });

    if (selectedOptions.length !== uniqueOptionIds.length) {
      throw new AppError('Invalid options in quiz attempt', 400);
    }

    const quizIds = new Set(selectedOptions.map((option) => option.question.quizId));

    if (quizIds.size !== 1) {
      throw new AppError('All selected options must belong to the same quiz', 400);
    }

    const quizId = selectedOptions[0].question.quizId;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        modules: {
          take: 1,
          include: {
            module: {
              include: {
                track: {
                  include: {
                    userTracks: {
                      where: {
                        userId: user.id,
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const hasAccess = quiz.modules.some(
      (moduleQuiz) => moduleQuiz.module.track.userTracks.length > 0
    );

    if (!hasAccess && user.role !== 'ADMIN') {
      throw new AppError('You are not allowed to answer this quiz', 403);
    }

    const uniqueQuestionIds = new Set<string>();
    const answersToPersist: Array<{ questionId: string; optionId: string; isCorrect: boolean }> =
      [];

    for (const optionId of uniqueOptionIds) {
      let matchedQuestionId: string | null = null;
      let isCorrect = false;

      for (const question of quiz.questions) {
        const option = question.options.find((item) => item.id === optionId);
        if (option) {
          matchedQuestionId = question.id;
          isCorrect = option.isCorrect;
          break;
        }
      }

      if (!matchedQuestionId) {
        throw new AppError('Invalid option for quiz attempt', 400);
      }

      if (uniqueQuestionIds.has(matchedQuestionId)) {
        throw new AppError('Duplicate answers for the same question are not allowed', 400);
      }

      uniqueQuestionIds.add(matchedQuestionId);
      answersToPersist.push({
        questionId: matchedQuestionId,
        optionId,
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    let attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId: user.id,
        completedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!attempt) {
      attempt = await prisma.quizAttempt.create({
        data: {
          quizId,
          userId: user.id,
          score: 0,
          passed: false,
          completedAt: null,
        },
      });
    }

    const answeredQuestionIds = answersToPersist.map((answer) => answer.questionId);

    if (answeredQuestionIds.length > 0) {
      await prisma.answer.deleteMany({
        where: {
          attemptId: attempt.id,
          questionId: {
            in: answeredQuestionIds,
          },
        },
      });

      await prisma.answer.createMany({
        data: answersToPersist.map((answer) => ({
          attemptId: attempt.id,
          questionId: answer.questionId,
          optionId: answer.optionId,
        })),
      });
    }

    const persistedAnswers = await prisma.answer.findMany({
      where: {
        attemptId: attempt.id,
      },
      include: {
        option: {
          select: {
            isCorrect: true,
          },
        },
      },
    });

    const answeredQuestionsCount = new Set(persistedAnswers.map((answer) => answer.questionId))
      .size;
    const correctAnswers = persistedAnswers.filter((answer) => answer.option.isCorrect).length;
    const score =
      totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0;
    const isCompleted = totalQuestions > 0 && answeredQuestionsCount >= totalQuestions;

    if (!isCompleted) {
      return {
        attemptId: attempt.id,
        quizId,
        completed: false,
        answeredQuestionsCount,
        totalQuestions,
      };
    }

    return await prisma.quizAttempt
      .update({
        where: { id: attempt.id },
        data: {
          score,
          passed: score >= PASSING_SCORE,
          completedAt: new Date(),
        },
        include: {
          answers: true,
        },
      })
      .then((completedAttempt) => ({
        attemptId: completedAttempt.id,
        quizId: completedAttempt.quizId,
        completed: true,
        answeredQuestionsCount,
        totalQuestions,
        score: completedAttempt.score,
        passed: completedAttempt.passed,
      }));
  },

  async getCurrentAttempt(quizId: string, user: UserHandler): Promise<QuizAttemptCurrentResponse> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        modules: {
          take: 1,
          include: {
            module: {
              include: {
                track: {
                  include: {
                    userTracks: {
                      where: {
                        userId: user.id,
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const hasAccess = quiz.modules.some(
      (moduleQuiz) => moduleQuiz.module.track.userTracks.length > 0
    );

    if (!hasAccess && user.role !== 'ADMIN') {
      throw new AppError('You are not allowed to access this quiz', 403);
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId: user.id,
        completedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        answers: true,
      },
    });

    if (!attempt) {
      return {
        hasOpenAttempt: false,
        quizId,
        completed: false,
        answeredQuestionsCount: 0,
        totalQuestions: quiz.questions.length,
        answers: [],
        questions: quiz.questions.map((question) => ({
          id: question.id,
          content: question.content,
          type: question.type,
          options: question.options.map((option) => ({
            id: option.id,
            content: option.content,
          })),
        })),
      };
    }

    const answeredQuestionsCount = attempt.answers.length;

    return {
      hasOpenAttempt: true,
      attemptId: attempt.id,
      quizId,
      completed: false,
      answeredQuestionsCount,
      totalQuestions: quiz.questions.length,
      answers: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        optionId: answer.optionId,
      })),
      questions: quiz.questions.map((question) => ({
        id: question.id,
        content: question.content,
        type: question.type,
        options: question.options.map((option) => ({
          id: option.id,
          content: option.content,
        })),
      })),
    };
  },

  async listAttempts(filters: QuizAttemptFilters, user: UserHandler) {
    try {
      const targetUserId = user.role === 'ADMIN' ? filters.userId : user.id;

      return await prisma.quizAttempt.findMany({
        where: {
          userId: targetUserId,
          quizId: filters.quizId,
        },
        include: {
          answers: true,
          quiz: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      throw new AppError('Failed to list quiz attempts', 500);
    }
  },
};
