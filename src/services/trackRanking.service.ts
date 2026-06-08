import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/AppError';

const XP_PER_LESSON = 100;

export type RankingEntry = {
  position: number;
  userId: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
};

export type RankingResult = {
  trackId: string;
  total: number;
  ranking: RankingEntry[];
};

export async function getRanking(
  trackId: string,
  currentUserId: string,
  limit: number
): Promise<RankingResult> {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { id: true },
  });

  if (!track) {
    throw new AppError('Trilha não encontrada', 404);
  }

  const members = await prisma.userTrack.findMany({
    where: {
      trackId,
      role: 'STUDENT',
    },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (members.length === 0) {
    return { trackId, total: 0, ranking: [] };
  }

  const memberIds = members.map((m) => m.userId);

  const [completedTrainings, quizAttempts] = await Promise.all([
    prisma.userTraining.findMany({
      where: {
        userId: { in: memberIds },
        status: 'COMPLETED',
        training: {
          modules: {
            some: {
              module: {
                trackId,
              },
            },
          },
        },
      },
      select: {
        userId: true,
        trainingId: true,
      },
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId: { in: memberIds },
        completedAt: { not: null },
        quiz: {
          modules: {
            some: {
              module: {
                trackId,
              },
            },
          },
        },
      },
      select: {
        userId: true,
        quizId: true,
        passed: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  const trainingCountByUser = new Map<string, number>();
  for (const ut of completedTrainings) {
    trainingCountByUser.set(ut.userId, (trainingCountByUser.get(ut.userId) ?? 0) + 1);
  }

  const lastAttemptByUserQuiz = new Map<string, boolean>();
  for (const attempt of quizAttempts) {
    const key = `${attempt.userId}:${attempt.quizId}`;
    if (!lastAttemptByUserQuiz.has(key)) {
      lastAttemptByUserQuiz.set(key, attempt.passed);
    }
  }

  const passedQuizCountByUser = new Map<string, number>();
  for (const [key, passed] of lastAttemptByUserQuiz.entries()) {
    if (passed) {
      const userId = key.split(':')[0]!;
      passedQuizCountByUser.set(userId, (passedQuizCountByUser.get(userId) ?? 0) + 1);
    }
  }

  const scored = members.map((member) => {
    const trainingsCompleted = trainingCountByUser.get(member.userId) ?? 0;
    const quizzesPassed = passedQuizCountByUser.get(member.userId) ?? 0;
    const score = (trainingsCompleted + quizzesPassed) * XP_PER_LESSON;

    return {
      userId: member.userId,
      name: member.user.name,
      score,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const total = scored.length;

  const topEntries = scored.slice(0, limit);
  const currentUserIndex = scored.findIndex((e) => e.userId === currentUserId);
  const currentUserInTop = currentUserIndex !== -1 && currentUserIndex < limit;

  const ranking: RankingEntry[] = topEntries.map((entry, index) => ({
    position: index + 1,
    userId: entry.userId,
    name: entry.name,
    score: entry.score,
    isCurrentUser: entry.userId === currentUserId,
  }));

  if (!currentUserInTop && currentUserIndex !== -1) {
    const u = scored[currentUserIndex]!;
    ranking.push({
      position: currentUserIndex + 1,
      userId: u.userId,
      name: u.name,
      score: u.score,
      isCurrentUser: true,
    });
  }

  return { trackId, total, ranking };
}
