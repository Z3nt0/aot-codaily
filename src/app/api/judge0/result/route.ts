import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { judge0API } from "@/lib/judge0";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Get submission result from Judge0
    const result = await judge0API.getSubmissionResult(token);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Judge0 result error:", error);
    return NextResponse.json(
      { error: "Failed to get submission result" },
      { status: 500 }
    );
  }
}

