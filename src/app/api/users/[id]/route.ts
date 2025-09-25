import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
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
          take: 10
        },
        streakEvents: {
          orderBy: { date: 'desc' },
          take: 30
        },
        _count: {
          select: {
            submissions: true,
            streakEvents: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate additional stats
    const [totalProblems, totalScore, recentSubmissions] = await Promise.all([
      prisma.submission.count({
        where: { userId: user.id, result: 'ACCEPTED' }
      }),
      prisma.submission.aggregate({
        where: { userId: user.id, result: 'ACCEPTED' },
        _sum: { score: true }
      }),
      prisma.submission.count({
        where: {
          userId: user.id,
          submittedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return NextResponse.json({
      ...user,
      totalProblems,
      totalScore: totalScore._sum.score || 0,
      recentSubmissions,
      submissions: user._count.submissions,
      streakEvents: user._count.streakEvents
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
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
    const { roles, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        roles: roles ? JSON.stringify(roles) : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

