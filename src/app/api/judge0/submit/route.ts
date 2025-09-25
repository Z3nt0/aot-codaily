import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { judge0API, JUDGE0_STATUS } from "@/lib/judge0";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language_id, source_code, stdin, expected_output, problem_id } = body;

    // Validate required fields
    if (!language_id || !source_code) {
      return NextResponse.json(
        { error: "language_id and source_code are required" },
        { status: 400 }
      );
    }

    // Submit code to Judge0
    const submission = await judge0API.submitCode({
      language_id: parseInt(language_id),
      source_code,
      stdin: stdin || '',
      expected_output: expected_output || '',
    });

    // Return submission token
    return NextResponse.json({
      token: submission.token,
      message: "Code submitted successfully"
    });

  } catch (error) {
    console.error("Judge0 submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit code" },
      { status: 500 }
    );
  }
}

