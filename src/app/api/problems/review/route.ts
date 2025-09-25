import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProblemHints, generateProblemTags } from '@/lib/gemini-service';
import { generateProblemHints as mockGenerateProblemHints, generateProblemTags as mockGenerateProblemTags } from '@/lib/openai-service-mock';

// Review and approve/reject a generated problem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, action, reviewerId, feedback } = body;

    if (!problemId || !action || !reviewerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    if (action === 'approve') {
      // Generate additional metadata using OpenAI (with fallback to mock)
      let hints, tags;
      try {
        [hints, tags] = await Promise.all([
          generateProblemHints({
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.descriptionMd,
            input_format: problem.inputFormat || '',
            output_format: problem.outputFormat || '',
            constraints: problem.constraints || '',
            sample_tests: problem.metadata?.sampleTests || [],
            hidden_tests: problem.metadata?.hiddenTests || []
          }),
          generateProblemTags({
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.descriptionMd,
            input_format: problem.inputFormat || '',
            output_format: problem.outputFormat || '',
            constraints: problem.constraints || '',
            sample_tests: problem.metadata?.sampleTests || [],
            hidden_tests: problem.metadata?.hiddenTests || []
          })
        ]);
      } catch (error) {
        console.log('Gemini API error, using mock data for hints and tags:', error.message);
        [hints, tags] = await Promise.all([
          mockGenerateProblemHints({
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.descriptionMd,
            input_format: problem.inputFormat || '',
            output_format: problem.outputFormat || '',
            constraints: problem.constraints || '',
            sample_tests: problem.metadata?.sampleTests || [],
            hidden_tests: problem.metadata?.hiddenTests || []
          }),
          mockGenerateProblemTags({
            title: problem.title,
            difficulty: problem.difficulty,
            description: problem.descriptionMd,
            input_format: problem.inputFormat || '',
            output_format: problem.outputFormat || '',
            constraints: problem.constraints || '',
            sample_tests: problem.metadata?.sampleTests || [],
            hidden_tests: problem.metadata?.hiddenTests || []
          })
        ]);
      }

      // Update problem with approval and additional metadata
      const updatedProblem = await prisma.problem.update({
        where: { id: problemId },
        data: {
          isActive: true,
          publishedAt: new Date(),
          metadata: {
            ...problem.metadata,
            approved: true,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString(),
            feedback: feedback || null,
            hints: hints.hints,
            explanation: hints.explanation,
            solutionApproach: hints.solution_approach,
            tags: tags.tags,
            topic: tags.topic,
            category: tags.category,
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Problem approved and activated',
        problem: {
          id: updatedProblem.id,
          title: updatedProblem.title,
          difficulty: updatedProblem.difficulty,
          isActive: updatedProblem.isActive,
          publishedAt: updatedProblem.publishedAt,
          metadata: updatedProblem.metadata,
        }
      });

    } else if (action === 'reject') {
      // Update problem with rejection
      const updatedProblem = await prisma.problem.update({
        where: { id: problemId },
        data: {
          metadata: {
            ...problem.metadata,
            approved: false,
            reviewedBy: reviewerId,
            reviewedAt: new Date().toISOString(),
            feedback: feedback || 'Problem rejected during review',
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Problem rejected',
        problem: {
          id: updatedProblem.id,
          title: updatedProblem.title,
          feedback: updatedProblem.metadata?.feedback,
        }
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error reviewing problem:', error);
    return NextResponse.json(
      { error: 'Failed to review problem' },
      { status: 500 }
    );
  }
}

// Get problems pending review
export async function GET() {
  try {
    const pendingProblems = await prisma.problem.findMany({
      where: {
        metadata: {
          path: ['openaiGenerated'],
          equals: true
        },
        isActive: false,
        metadata: {
          path: ['approved'],
          equals: false
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      pendingProblems: pendingProblems.map(problem => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.descriptionMd,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        createdAt: problem.createdAt,
        metadata: problem.metadata,
      }))
    });

  } catch (error) {
    console.error('Error fetching pending problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending problems' },
      { status: 500 }
    );
  }
}
