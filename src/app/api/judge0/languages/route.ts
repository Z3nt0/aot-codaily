import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { judge0API, SUPPORTED_LANGUAGES } from "@/lib/judge0";

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

    // Return supported languages
    return NextResponse.json({
      languages: SUPPORTED_LANGUAGES
    });

  } catch (error) {
    console.error("Judge0 languages error:", error);
    return NextResponse.json(
      { error: "Failed to get supported languages" },
      { status: 500 }
    );
  }
}

