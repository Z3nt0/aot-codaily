import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range (UTC)
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    
    // Find today's problem
    const todayProblem = await prisma.problem.findFirst({
      where: {
        scheduledDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        isActive: true
      },
      include: {
        testCases: {
          where: {
            isHidden: false
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!todayProblem) {
      return NextResponse.json({ 
        error: "No challenge available for today",
        message: "Check back later for today's challenge!"
      }, { status: 404 });
    }

    // Get user's submission status for today's problem
    const userSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        problemId: todayProblem.id
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Get user's streak information
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        currentStreak: true,
        longestStreak: true
      }
    });

    // Format the response
    const response = {
      problem: {
        id: todayProblem.id,
        title: todayProblem.title,
        difficulty: todayProblem.difficulty,
        description: todayProblem.description,
        inputFormat: todayProblem.inputFormat,
        outputFormat: todayProblem.outputFormat,
        constraints: todayProblem.constraints,
        examples: todayProblem.testCases.map(testCase => ({
          input: testCase.input,
          output: testCase.output,
          explanation: testCase.input // Using input as explanation for now
        }))
      },
      userProgress: {
        status: userSubmission ? (userSubmission.result === 'ACCEPTED' ? 'completed' : 'attempted') : 'not_started',
        attempts: await prisma.submission.count({
          where: {
            userId: session.user.id,
            problemId: todayProblem.id
          }
        }),
        lastSubmission: userSubmission?.submittedAt || null
      },
      streak: {
        current: user?.currentStreak || 0,
        longest: user?.longestStreak || 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching today's challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's challenge" },
      { status: 500 }
    );
  }
}
