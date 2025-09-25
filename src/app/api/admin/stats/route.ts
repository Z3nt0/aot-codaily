import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.discordId === process.env.ADMIN_DISCORD_ID;
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get last 7 days for active users
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalUsers,
      activeUsers,
      totalProblems,
      problemsToday,
      totalSubmissions,
      submissionsToday,
      averageStreak,
      topStreak
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (last 7 days)
      prisma.user.count({
        where: {
          lastSeen: { gte: sevenDaysAgo }
        }
      }),
      
      // Total problems
      prisma.problem.count(),
      
      // Problems created today
      prisma.problem.count({
        where: {
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      
      // Total submissions
      prisma.submission.count(),
      
      // Submissions today
      prisma.submission.count({
        where: {
          submittedAt: { gte: today, lt: tomorrow }
        }
      }),
      
      // Average streak
      prisma.user.aggregate({
        _avg: { currentStreak: true }
      }),
      
      // Top streak
      prisma.user.aggregate({
        _max: { longestStreak: true }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalProblems,
      problemsToday,
      totalSubmissions,
      submissionsToday,
      averageStreak: Math.round((averageStreak._avg.currentStreak || 0) * 100) / 100,
      topStreak: topStreak._max.longestStreak || 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}

