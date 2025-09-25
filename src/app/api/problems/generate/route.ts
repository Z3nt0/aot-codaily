import { NextRequest, NextResponse } from 'next/server';
import { generateProblem, generateProblemWithDifficulty, generateProblemWithTopic } from '@/lib/gemini-service';
import { generateProblem as mockGenerateProblem, generateProblemWithDifficulty as mockGenerateProblemWithDifficulty, generateProblemWithTopic as mockGenerateProblemWithTopic } from '@/lib/openai-service-mock';
import { prisma } from '@/lib/prisma';

// Generate a new problem using OpenAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty, topic, generateHints = false } = body;

    let generatedProblem;
    
    try {
      // Try Gemini first
      if (topic && difficulty) {
        generatedProblem = await generateProblemWithTopic(topic, difficulty);
      } else if (difficulty) {
        generatedProblem = await generateProblemWithDifficulty(difficulty);
      } else if (topic) {
        generatedProblem = await generateProblemWithTopic(topic);
      } else {
        generatedProblem = await generateProblem();
      }
    } catch (error) {
      console.log('Gemini API error, using mock data:', error.message);
      
      // Fallback to mock data
      if (topic && difficulty) {
        generatedProblem = await mockGenerateProblemWithTopic(topic, difficulty);
      } else if (difficulty) {
        generatedProblem = await mockGenerateProblemWithDifficulty(difficulty);
      } else if (topic) {
        generatedProblem = await mockGenerateProblemWithTopic(topic);
      } else {
        generatedProblem = await mockGenerateProblem();
      }
    }

    // Store the generated problem in database
    const problem = await prisma.problem.create({
      data: {
        title: generatedProblem.title,
        descriptionMd: generatedProblem.description,
        difficulty: generatedProblem.difficulty,
        inputFormat: generatedProblem.input_format,
        outputFormat: generatedProblem.output_format,
        constraints: generatedProblem.constraints,
        metadata: {
          openaiGenerated: true,
          generatedAt: new Date().toISOString(),
          approved: false,
          sampleTests: generatedProblem.sample_tests,
          hiddenTests: generatedProblem.hidden_tests,
        },
        isActive: false, // Requires human review before activation
        publishedAt: null,
      }
    });

    return NextResponse.json({
      success: true,
      problem: {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.descriptionMd,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        metadata: problem.metadata,
        isActive: problem.isActive,
        createdAt: problem.createdAt,
      }
    });

  } catch (error) {
    console.error('Error generating problem:', error);
    return NextResponse.json(
      { error: 'Failed to generate problem' },
      { status: 500 }
    );
  }
}

// Get generation status and pending problems
export async function GET() {
  try {
    const pendingProblems = await prisma.problem.findMany({
      where: {
        metadata: {
          path: ['openaiGenerated'],
          equals: true
        },
        isActive: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      pendingProblems: pendingProblems.map(problem => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
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
