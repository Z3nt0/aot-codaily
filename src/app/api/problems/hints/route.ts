import { NextRequest, NextResponse } from 'next/server';
import { generateProblemHints } from '@/lib/gemini-service';
import { prisma } from '@/lib/prisma';

// Generate hints for a specific problem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Generate hints using OpenAI
    const hints = await generateProblemHints({
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.descriptionMd,
      input_format: problem.inputFormat || '',
      output_format: problem.outputFormat || '',
      constraints: problem.constraints || '',
      sample_tests: problem.metadata?.sampleTests || [],
      hidden_tests: problem.metadata?.hiddenTests || []
    });

    // Update problem with generated hints
    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: {
        metadata: {
          ...problem.metadata,
          hints: hints.hints,
          explanation: hints.explanation,
          solutionApproach: hints.solution_approach,
        }
      }
    });

    return NextResponse.json({
      success: true,
      hints: {
        hints: hints.hints,
        explanation: hints.explanation,
        solutionApproach: hints.solution_approach,
      }
    });

  } catch (error) {
    console.error('Error generating hints:', error);
    return NextResponse.json(
      { error: 'Failed to generate hints' },
      { status: 500 }
    );
  }
}

// Get hints for a specific problem
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        title: true,
        metadata: true
      }
    });

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    const hints = problem.metadata?.hints || [];
    const explanation = problem.metadata?.explanation || '';
    const solutionApproach = problem.metadata?.solutionApproach || '';

    return NextResponse.json({
      success: true,
      hints: {
        hints,
        explanation,
        solutionApproach,
      }
    });

  } catch (error) {
    console.error('Error fetching hints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hints' },
      { status: 500 }
    );
  }
}
