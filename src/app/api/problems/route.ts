import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/problems - Get all problems
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const problems = await prisma.problem.findMany({
      include: {
        testCases: true,
        submissions: {
          select: {
            id: true,
            result: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate acceptance rate for each problem
    const problemsWithStats = problems.map(problem => {
      const totalSubmissions = problem.submissions.length;
      const acceptedSubmissions = problem.submissions.filter(s => s.result === 'ACCEPTED').length;
      const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        scheduledDate: problem.scheduledDate,
        publishedAt: problem.publishedAt,
        isActive: problem.isActive,
        submissions: totalSubmissions,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        createdAt: problem.createdAt,
        updatedAt: problem.updatedAt
      };
    });

    return NextResponse.json({ problems: problemsWithStats });

  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST /api/problems - Create new problem
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received problem data:", body);
    
    const {
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      scheduledDate,
      testCases
    } = body;

    // Validate required fields
    if (!title || !description || !difficulty) {
      return NextResponse.json(
        { error: "Title, description, and difficulty are required" },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    const upperDifficulty = difficulty.toUpperCase();
    if (!validDifficulties.includes(upperDifficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be Easy, Medium, or Hard" },
        { status: 400 }
      );
    }

    // Check if there's already a problem scheduled for this date
    if (scheduledDate) {
      const existingProblem = await prisma.problem.findFirst({
        where: {
          scheduledDate: new Date(scheduledDate),
          isActive: true
        }
      });

      if (existingProblem) {
        return NextResponse.json(
          { error: `A problem is already scheduled for ${new Date(scheduledDate).toLocaleDateString()}. Only one problem per day is allowed.` },
          { status: 400 }
        );
      }
    }

    // Create problem with test cases
    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty: upperDifficulty,
        topic: topic || 'General',
        inputFormat,
        outputFormat,
        constraints,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        isActive: true,
        testCases: {
          create: testCases?.map((testCase: { type: string; input: string; output: string; isHidden: boolean }, index: number) => ({
            type: testCase.type || 'SAMPLE',
            input: testCase.input,
            output: testCase.output,
            isHidden: testCase.isHidden || false,
            order: index
          })) || []
        }
      },
      include: {
        testCases: true
      }
    });

    return NextResponse.json({
      success: true,
      problem: {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        scheduledDate: problem.scheduledDate,
        isActive: problem.isActive,
        testCases: problem.testCases.length
      }
    });

  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}