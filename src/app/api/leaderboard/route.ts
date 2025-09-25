import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const limit = parseInt(searchParams.get('limit') || '10');

    let startDate: Date;
    const endDate: Date = new Date();

    // Calculate date range based on period
    switch (period) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'allTime':
      default:
        startDate = new Date('2020-01-01'); // Far back date
        break;
    }

    // Get leaderboard data based on period
    let leaderboardData;

    if (period === 'allTime') {
      // All-time leaderboard based on total problems solved
      leaderboardData = await prisma.user.findMany({
        select: {
          id: true,
          discordId: true,
          username: true,
          discriminator: true,
          avatar: true,
          currentStreak: true,
          longestStreak: true,
          joinedAt: true,
          _count: {
            select: {
              submissions: {
                where: { result: 'ACCEPTED' }
              }
            }
          }
        },
        orderBy: {
          submissions: {
            _count: 'desc'
          }
        },
        take: limit
      });

      // Calculate total score for each user
      const usersWithScore = await Promise.all(
        leaderboardData.map(async (user) => {
          const totalScore = await prisma.submission.aggregate({
            where: {
              userId: user.id,
              result: 'ACCEPTED'
            },
            _sum: { score: true }
          });

          return {
            ...user,
            totalProblems: user._count.submissions,
            totalScore: totalScore._sum.score || 0
          };
        })
      );

      leaderboardData = usersWithScore;
    } else {
      // Period-based leaderboard
      leaderboardData = await prisma.user.findMany({
        select: {
          id: true,
          discordId: true,
          username: true,
          discriminator: true,
          avatar: true,
          currentStreak: true,
          longestStreak: true,
          joinedAt: true,
          _count: {
            select: {
              submissions: {
                where: {
                  result: 'ACCEPTED',
                  submittedAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          submissions: {
            _count: 'desc'
          }
        },
        take: limit
      });

      // Calculate period score for each user
      const usersWithScore = await Promise.all(
        leaderboardData.map(async (user) => {
          const periodScore = await prisma.submission.aggregate({
            where: {
              userId: user.id,
              result: 'ACCEPTED',
              submittedAt: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: { score: true }
          });

          return {
            ...user,
            totalProblems: user._count.submissions,
            totalScore: periodScore._sum.score || 0
          };
        })
      );

      leaderboardData = usersWithScore;
    }

    // Add rank to each user
    const rankedLeaderboard = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get current user's rank if they're not in top results
    let userRank = null;
    if (session.user.id) {
      const userStats = await getUserRank(session.user.id, period, startDate, endDate);
      if (userStats) {
        userRank = userStats;
      }
    }

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      period,
      userRank,
      totalUsers: await prisma.user.count()
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// Helper function to get user's rank
async function getUserRank(userId: string, period: string, startDate: Date, endDate: Date) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        discordId: true,
        username: true,
        discriminator: true,
        avatar: true,
        currentStreak: true,
        longestStreak: true,
        joinedAt: true
      }
    });

    if (!user) return null;

    let userProblems: number;
    let userScore: number;

    if (period === 'allTime') {
      // All-time stats
      const [problems, score] = await Promise.all([
        prisma.submission.count({
          where: { userId, result: 'ACCEPTED' }
        }),
        prisma.submission.aggregate({
          where: { userId, result: 'ACCEPTED' },
          _sum: { score: true }
        })
      ]);
      userProblems = problems;
      userScore = score._sum.score || 0;
    } else {
      // Period-based stats
      const [problems, score] = await Promise.all([
        prisma.submission.count({
          where: {
            userId,
            result: 'ACCEPTED',
            submittedAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.submission.aggregate({
          where: {
            userId,
            result: 'ACCEPTED',
            submittedAt: { gte: startDate, lte: endDate }
          },
          _sum: { score: true }
        })
      ]);
      userProblems = problems;
      userScore = score._sum.score || 0;
    }

    // Calculate rank
    let rank = 1;
    if (period === 'allTime') {
      const usersAbove = await prisma.user.count({
        where: {
          submissions: {
            some: {
              result: 'ACCEPTED'
            }
          }
        }
      });
      rank = usersAbove + 1;
    } else {
      const usersAbove = await prisma.user.count({
        where: {
          submissions: {
            some: {
              result: 'ACCEPTED',
              submittedAt: { gte: startDate, lte: endDate }
            }
          }
        }
      });
      rank = usersAbove + 1;
    }

    return {
      ...user,
      rank,
      totalProblems: userProblems,
      totalScore: userScore
    };

  } catch (error) {
    console.error("Error calculating user rank:", error);
    return null;
  }
}
