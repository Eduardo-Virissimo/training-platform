import { AppError } from '@/errors/AppError';
import { prisma } from '@/lib/prisma';
import { QuizService } from '@/services/quiz.service';
import { UserHandler } from '@/types/user.types';
import { Role, UserTrackStatus, UserTrainingRole } from '@prisma/client';

const XP_PER_COMPLETED_LESSON = 100;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return 'US';
  }

  return parts.map((part) => part[0]!.toUpperCase()).join('');
}

function formatRole(role: Role): string {
  if (role === Role.ADMIN) return 'Administrador';
  if (role === Role.INSTRUCTOR) return 'Instrutor';
  return 'Colaborador';
}

function roleDepartment(role: Role): string {
  if (role === Role.ADMIN) return 'Administracao';
  if (role === Role.INSTRUCTOR) return 'Academia Corporativa';
  return 'Operacoes';
}

function computeProgress(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function estimateDuration(content: string | null | undefined): string {
  if (!content) {
    return '5 min';
  }

  const normalized = content.trim();
  if (!normalized) {
    return '5 min';
  }

  if (
    normalized.includes('youtube.com') ||
    normalized.includes('youtu.be') ||
    normalized.includes('vimeo.com')
  ) {
    return '8 min';
  }

  const words = normalized.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min`;
}

function inferLessonType(content: string | null | undefined): 'video' | 'text' {
  if (!content) {
    return 'text';
  }

  const normalized = content.toLowerCase();
  if (
    normalized.includes('youtube.com') ||
    normalized.includes('youtu.be') ||
    normalized.includes('vimeo.com')
  ) {
    return 'video';
  }

  return 'text';
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function computeStreak(activity: Date[]): number {
  if (activity.length === 0) {
    return 0;
  }

  const days = new Set(activity.map((item) => startOfDay(item).getTime()));
  let streak = 0;
  let cursor = startOfDay(new Date()).getTime();

  while (days.has(cursor)) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return streak;
}

export class PlatformService {
  static async getState(user: UserHandler) {
    const where =
      user.role === Role.ADMIN
        ? undefined
        : {
            userTracks: {
              some: {
                userId: user.id,
              },
            },
          };

    const tracks = await prisma.track.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        modules: {
          orderBy: {
            position: 'asc',
          },
          include: {
            trainings: {
              orderBy: {
                position: 'asc',
              },
              include: {
                training: {
                  include: {
                    userTrainings: {
                      where: {
                        userId: user.id,
                      },
                      select: {
                        id: true,
                        status: true,
                        completedAt: true,
                      },
                    },
                  },
                },
              },
            },
            quizzes: {
              orderBy: {
                position: 'asc',
              },
              include: {
                quiz: {
                  include: {
                    _count: {
                      select: {
                        questions: true,
                      },
                    },
                    attempts: {
                      where: {
                        userId: user.id,
                        completedAt: {
                          not: null,
                        },
                      },
                      orderBy: {
                        createdAt: 'desc',
                      },
                      take: 1,
                      select: {
                        passed: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const trailData = tracks.map((track) => {
      const modules = track.modules.map((module) => {
        const lessons = [
          ...module.trainings.map((moduleTraining) => {
            const userTraining = moduleTraining.training.userTrainings[0];
            const normalizedStatus = userTraining?.status?.toUpperCase();

            return {
              position: moduleTraining.position,
              lesson: {
                id: moduleTraining.training.id,
                title: moduleTraining.training.title,
                type: inferLessonType(moduleTraining.training.content),
                duration: estimateDuration(moduleTraining.training.content),
                completed: normalizedStatus === 'COMPLETED',
                content: moduleTraining.training.content,
              },
            };
          }),
          ...module.quizzes.map((moduleQuiz) => ({
            position: moduleQuiz.position,
            lesson: {
              id: moduleQuiz.quiz.id,
              title: moduleQuiz.quiz.title,
              type: 'quiz' as const,
              duration: `${Math.max(moduleQuiz.quiz._count.questions, 1) * 2} min`,
              completed: Boolean(moduleQuiz.quiz.attempts[0]?.passed),
              questionCount: moduleQuiz.quiz._count.questions,
            },
          })),
        ]
          .sort((a, b) => {
            if (a.position !== b.position) {
              return a.position - b.position;
            }

            return a.lesson.title.localeCompare(b.lesson.title);
          })
          .map((item) => item.lesson);

        const completedLessons = lessons.filter((lesson) => lesson.completed).length;

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          progress: computeProgress(lessons.length, completedLessons),
          locked: false,
          lessons,
        };
      });

      for (let index = 0; index < modules.length; index += 1) {
        const previousCompleted = index === 0 || modules[index - 1]!.progress === 100;
        modules[index]!.locked = !previousCompleted && modules[index]!.progress === 0;
      }

      const allLessons = modules.flatMap((module) => module.lessons);
      const completedLessons = allLessons.filter((lesson) => lesson.completed).length;

      return {
        id: track.id,
        title: track.title,
        description: track.description,
        xp: allLessons.length * 100,
        progress: computeProgress(allLessons.length, completedLessons),
        status: 'active' as 'completed' | 'active' | 'locked',
        modules,
      };
    });

    for (let index = 0; index < trailData.length; index += 1) {
      const previousCompleted = index === 0 || trailData[index - 1]!.status === 'completed';
      const trail = trailData[index]!;

      if (trail.progress === 100) {
        trail.status = 'completed';
      } else if (trail.progress > 0) {
        trail.status = 'active';
      } else {
        trail.status = previousCompleted ? 'active' : 'locked';
      }
    }

    const [completedTrainingActivity, quizActivity] = await Promise.all([
      prisma.userTraining.findMany({
        where: {
          userId: user.id,
          completedAt: {
            not: null,
          },
        },
        select: {
          completedAt: true,
        },
      }),
      prisma.quizAttempt.findMany({
        where: {
          userId: user.id,
          completedAt: {
            not: null,
          },
        },
        select: {
          completedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const allActivityDates = [
      ...completedTrainingActivity
        .map((entry) => entry.completedAt)
        .filter((item): item is Date => Boolean(item)),
      ...quizActivity.map((entry) => entry.completedAt ?? entry.createdAt),
    ];

    const completedTracks = trailData.filter((trail) => trail.progress === 100).length;
    const completedLessons = trailData
      .flatMap((trail) => trail.modules)
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.completed).length;

    return {
      user: {
        id: user.id,
        name: user.name,
        initials: getInitials(user.name),
        role: formatRole(user.role),
        department: roleDepartment(user.role),
        xp: completedLessons * XP_PER_COMPLETED_LESSON,
        streak: computeStreak(allActivityDates),
      },
      completedTracks,
      tracks: trailData,
    };
  }

  static async completeLesson(user: UserHandler, lessonId: string) {
    const lesson = await prisma.training.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        modules: {
          include: {
            module: {
              select: {
                trackId: true,
                track: {
                  select: {
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
        userTrainings: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            startedAt: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Aula nao encontrada', 404);
    }

    const trackAccess = lesson.modules.some((moduleTraining) => {
      return moduleTraining.module.track.userTracks.length > 0;
    });
    const directAccess = lesson.userTrainings.length > 0;

    if (user.role !== Role.ADMIN && !trackAccess && !directAccess) {
      throw new AppError('Voce nao pode concluir esta aula', 403);
    }

    const now = new Date();
    const existingUserTraining = lesson.userTrainings[0];

    if (existingUserTraining) {
      await prisma.userTraining.update({
        where: {
          id: existingUserTraining.id,
        },
        data: {
          status: 'COMPLETED',
          startedAt: existingUserTraining.startedAt ?? now,
          completedAt: now,
        },
      });
    } else {
      await prisma.userTraining.create({
        data: {
          userId: user.id,
          trainingId: lessonId,
          status: 'COMPLETED',
          role: UserTrainingRole.STUDENT,
          startedAt: now,
          completedAt: now,
        },
      });
    }

    const relatedTrackIds = Array.from(
      new Set(lesson.modules.map((moduleTraining) => moduleTraining.module.trackId))
    );

    await Promise.all(relatedTrackIds.map((trackId) => this.syncUserTrackStatus(user.id, trackId)));

    return {
      lessonId,
      completed: true,
    };
  }

  static async getQuiz(user: UserHandler, quizId: string) {
    const attempt = await QuizService.getCurrentAttempt(quizId, user);

    return {
      id: attempt.quizId,
      title: 'Quiz',
      description: null,
      questions: attempt.questions.map((question) => ({
        id: question.id,
        question: question.content,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.content,
        })),
        correctOptionId: null,
      })),
      latestAttempt: null,
    };
  }

  static async submitQuiz(
    user: UserHandler,
    quizId: string,
    answers: Array<{ questionId: string; optionId: string }>
  ) {
    let lastResult: Awaited<ReturnType<typeof QuizService.submitAttempt>> | null = null;

    for (const answer of answers) {
      lastResult = await QuizService.submitAttempt(
        {
          optionId: answer.optionId,
        },
        user
      );
    }

    if (!lastResult) {
      throw new AppError('Nenhuma resposta enviada', 400);
    }

    if (!lastResult.completed) {
      return {
        attemptId: lastResult.attemptId,
        totalQuestions: lastResult.totalQuestions,
        correctAnswers: 0,
        score: 0,
        passed: false,
      };
    }

    return {
      attemptId: lastResult.attemptId,
      totalQuestions: lastResult.totalQuestions,
      correctAnswers: Math.round((lastResult.score / 100) * lastResult.totalQuestions),
      score: Math.round(lastResult.score),
      passed: lastResult.passed,
    };
  }

  private static async syncUserTrackStatus(userId: string, trackId: string) {
    const track = await prisma.track.findUnique({
      where: {
        id: trackId,
      },
      include: {
        modules: {
          include: {
            trainings: {
              include: {
                training: {
                  include: {
                    userTrainings: {
                      where: {
                        userId,
                      },
                      select: {
                        status: true,
                        completedAt: true,
                      },
                    },
                  },
                },
              },
            },
            quizzes: {
              include: {
                quiz: {
                  include: {
                    attempts: {
                      where: {
                        userId,
                        passed: true,
                        completedAt: {
                          not: null,
                        },
                      },
                      select: {
                        id: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!track) {
      return;
    }

    let totalLessons = 0;
    let completedLessons = 0;

    for (const trackModule of track.modules) {
      for (const moduleTraining of trackModule.trainings) {
        totalLessons += 1;
        const userTraining = moduleTraining.training.userTrainings[0];
        const status = userTraining?.status?.toUpperCase();
        if (status === 'COMPLETED') {
          completedLessons += 1;
        }
      }

      for (const moduleQuiz of trackModule.quizzes) {
        totalLessons += 1;
        if (moduleQuiz.quiz.attempts.length > 0) {
          completedLessons += 1;
        }
      }
    }

    let status: UserTrackStatus = UserTrackStatus.NOT_STARTED;
    if (totalLessons > 0 && completedLessons > 0) {
      status =
        completedLessons === totalLessons ? UserTrackStatus.COMPLETED : UserTrackStatus.IN_PROGRESS;
    }

    await prisma.userTrack.upsert({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
      create: {
        userId,
        trackId,
        role: 'STUDENT',
        status,
      },
      update: {
        status,
      },
    });
  }
}
