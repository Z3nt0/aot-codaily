import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/problems/[id] - Get single problem
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: {
        testCases: {
          orderBy: { order: 'asc' }
        },
        submissions: {
          where: { userId: session.user.id },
          select: {
            id: true,
            result: true,
            score: true,
            submittedAt: true
          },
          orderBy: { submittedAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Calculate acceptance rate
    const totalSubmissions = problem._count.submissions;
    const acceptedSubmissions = await prisma.submission.count({
      where: {
        problemId: problem.id,
        result: 'ACCEPTED'
      }
    });
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    return NextResponse.json({
      ...problem,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      userSubmission: problem.submissions[0] || null
    });

  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

// PUT /api/problems/[id] - Update problem
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      topic,
      inputFormat,
      outputFormat,
      constraints,
      scheduledDate,
      isActive,
      testCases
    } = body;

    // Check if problem exists
    const existingProblem = await prisma.problem.findUnique({
      where: { id: params.id }
    });

    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Check if there's already a problem scheduled for this date (excluding current problem)
    if (scheduledDate) {
      const conflictingProblem = await prisma.problem.findFirst({
        where: {
          scheduledDate: new Date(scheduledDate),
          isActive: true,
          id: { not: params.id } // Exclude current problem
        }
      });

      if (conflictingProblem) {
        return NextResponse.json(
          { error: `A problem is already scheduled for ${new Date(scheduledDate).toLocaleDateString()}. Only one problem per day is allowed.` },
          { status: 400 }
        );
      }
    }

    // Update problem
    const problem = await prisma.problem.update({
      where: { id: params.id },
      data: {
        title,
        description,
        difficulty: difficulty?.toUpperCase(),
        topic,
        inputFormat,
        outputFormat,
        constraints,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        isActive,
        updatedAt: new Date()
      }
    });

    // Update test cases if provided
    if (testCases) {
      // Delete existing test cases
      await prisma.testCase.deleteMany({
        where: { problemId: params.id }
      });

      // Create new test cases
      await prisma.testCase.createMany({
        data: testCases.map((testCase: { type: string; input: string; output: string; isHidden: boolean }, index: number) => ({
          problemId: params.id,
          type: testCase.type || 'SAMPLE',
          input: testCase.input,
          output: testCase.output,
          isHidden: testCase.isHidden || false,
          order: index
        }))
      });
    }

    return NextResponse.json(problem);

  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

// DELETE /api/problems/[id] - Delete problem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if problem exists
    const existingProblem = await prisma.problem.findUnique({
      where: { id: params.id }
    });

    if (!existingProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Delete problem (cascade will delete test cases and submissions)
    await prisma.problem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Problem deleted successfully" });

  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}
