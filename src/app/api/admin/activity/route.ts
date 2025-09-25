import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/activity - Get recent admin activity
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent submissions (as a proxy for activity)
    const recentSubmissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        problem: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: limit
    });

    // Format activity data
    const activity = recentSubmissions.map((submission, index) => ({
      id: submission.id,
      type: "submission",
      action: submission.result === 'ACCEPTED' ? 'Problem solved' : 'Code submitted',
      user: submission.user.username,
      time: getTimeAgo(submission.submittedAt),
      status: submission.result === 'ACCEPTED' ? 'success' : 'info',
      details: {
        problem: submission.problem.title,
        result: submission.result,
        score: submission.score
      }
    }));

    return NextResponse.json(activity);

  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin activity" },
      { status: 500 }
    );
  }
}

// Helper function to get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

