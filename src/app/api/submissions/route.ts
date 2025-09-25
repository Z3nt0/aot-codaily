import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/submissions - Get user submissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const problemId = searchParams.get('problemId');
    const result = searchParams.get('result');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id
    };
    
    if (problemId) {
      where.problemId = problemId;
    }
    
    if (result && result !== 'all') {
      where.result = result.toUpperCase();
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.submission.count({ where })
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      problemId,
      language,
      code,
      result,
      score,
      runtimeMs,
      memoryKb,
      output
    } = body;

    // Validate required fields
    if (!problemId || !language || !code) {
      return NextResponse.json(
        { error: "Problem ID, language, and code are required" },
        { status: 400 }
      );
    }

    // Check if problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        problemId,
        language,
        code,
        result: result || 'PENDING',
        score: score || 0,
        runtimeMs: runtimeMs || 0,
        memoryKb: memoryKb || 0,
        output: output || null
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        }
      }
    });

    // Update user streak if submission is accepted
    if (result === 'ACCEPTED') {
      await updateUserStreak(session.user.id);
    }

    return NextResponse.json(submission, { status: 201 });

  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

// Helper function to update user streak
async function updateUserStreak(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already has a streak event for today
    const existingStreak = await prisma.streakEvent.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!existingStreak) {
      // Create new streak event
      await prisma.streakEvent.create({
        data: {
          userId,
          date: today,
          success: true
        }
      });

      // Update user streak
      const newCurrentStreak = user.currentStreak + 1;
      const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          streakLastSuccess: today,
          lastSeen: new Date()
        }
      });
    }
  } catch (error) {
    console.error("Error updating user streak:", error);
  }
}
