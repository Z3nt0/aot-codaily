import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      if (status === 'active') {
        where.lastSeen = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // Last 7 days
      } else if (status === 'inactive') {
        where.lastSeen = { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      }
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          discordId: true,
          username: true,
          discriminator: true,
          avatar: true,
          email: true,
          joinedAt: true,
          lastSeen: true,
          currentStreak: true,
          longestStreak: true,
          roles: true,
          _count: {
            select: {
              submissions: true
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalProblems, totalScore] = await Promise.all([
          prisma.submission.count({
            where: { userId: user.id, result: 'ACCEPTED' }
          }),
          prisma.submission.aggregate({
            where: { userId: user.id, result: 'ACCEPTED' },
            _sum: { score: true }
          })
        ]);

        return {
          ...user,
          totalProblems,
          totalScore: totalScore._sum.score || 0,
          submissions: user._count.submissions
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
