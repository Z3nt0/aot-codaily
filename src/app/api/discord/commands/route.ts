import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API for Discord bot to fetch data for commands
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const command = searchParams.get('command');
  const userId = searchParams.get('userId');

  if (!command || !userId) {
    return NextResponse.json({ error: 'Missing command or userId' }, { status: 400 });
  }

  try {
    switch (command) {
      case 'today':
        return await getTodayProblem();
      case 'leaderboard':
        return await getLeaderboard(searchParams.get('period') || 'weekly');
      case 'streak':
        return await getUserStreak(userId);
      case 'help':
        return await getHelp();
      default:
        return NextResponse.json({ error: 'Unknown command' }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord command error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getTodayProblem() {
  const today = new Date();
  const problem = await prisma.problem.findFirst({
    where: {
      publishedAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      },
      isActive: true
    }
  });

  if (!problem) {
    return NextResponse.json({ 
      error: 'No problem available for today',
      message: 'Check back later for today\'s challenge!'
    });
  }

  return NextResponse.json({
    title: problem.title,
    description: problem.descriptionMd,
    difficulty: problem.difficulty,
    topic: problem.topic,
    examples: problem.metadata?.examples || [],
    constraints: problem.metadata?.constraints || []
  });
}

async function getLeaderboard(period: string) {
  const leaderboard = await prisma.leaderboard.findMany({
    where: { 
      type: period.toUpperCase(),
      period: period.toLowerCase()
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { rank: 'asc' },
    take: 10
  });

  return NextResponse.json({
    period,
    rankings: leaderboard.map(entry => ({
      rank: entry.rank,
      username: entry.user.username,
      score: entry.score,
      points: entry.points
    }))
  });
}

async function getUserStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    select: {
      username: true,
      currentStreak: true,
      longestStreak: true,
      streakLastSuccess: true,
      _count: {
        select: {
          submissions: {
            where: { result: 'ACCEPTED' }
          }
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' });
  }

  return NextResponse.json({
    username: user.username,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastSuccess: user.streakLastSuccess,
    totalSubmissions: user._count.submissions
  });
}

async function getHelp() {
  return NextResponse.json({
    title: '🤖 AOT CoDaily Bot Commands',
    description: 'Here are all the available commands:',
    commands: [
      {
        name: '/today',
        description: 'Get today\'s coding challenge with difficulty, tags, and interactive buttons'
      },
      {
        name: '/leaderboard [period]',
        description: 'Show leaderboard (Weekly/Monthly/All Time, defaults to weekly)'
      },
      {
        name: '/streak [user]',
        description: 'Check your current streak or another user\'s streak'
      },
      {
        name: '/help',
        description: 'Show this help message'
      }
    ],
    footer: 'Visit the website to submit solutions and track your progress!'
  });
}
