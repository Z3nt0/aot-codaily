// DeepSeek Problem Generation Service
// Handles AI-powered problem generation with human review workflow

import OpenAI from 'openai';

// Initialize DeepSeek client (using OpenAI SDK with DeepSeek endpoint)
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export interface GeneratedProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  sample_tests: Array<{
    input: string;
    output: string;
  }>;
  hidden_tests: Array<{
    input: string;
    output: string;
  }>;
}

export interface ProblemMetadata {
  openaiGenerated: boolean;
  generatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approved: boolean;
  tags?: string[];
  topic?: string;
}

// Generate a new programming problem using OpenAI
export async function generateProblem(): Promise<GeneratedProblem> {
  try {
    const prompt = `You are a problem setter for an online judge that uses the Judge0 API.

Generate ONE random programming problem with these requirements:

1. **Supported Languages**: Must work in any language Judge0 supports (e.g., C, C++, Java, Python, JavaScript).
2. **Difficulty**: Randomly choose from Easy, Medium, or Hard.
3. **Output Format**: Return a single JSON object with the following fields:

{
  "title": "Short descriptive title",
  "difficulty": "Easy | Medium | Hard",
  "description": "Clear problem statement with input/output specs and constraints.",
  "input_format": "Describe input format",
  "output_format": "Describe output format",
  "constraints": "List constraints",
  "sample_tests": [
    {
      "input": "Sample input string exactly as given to stdin",
      "output": "Expected output string exactly as returned to stdout"
    },
    {
      "input": "...",
      "output": "..."
    }
  ],
  "hidden_tests": [
    {
      "input": "...",
      "output": "..."
    }
  ]
}

4. **Judge0 Compatibility**:
   - Ensure all inputs/outputs are plain text (no interactive input).
   - Avoid tasks requiring external libraries or network calls.
   - Provide at least 2 sample_tests and 2 hidden_tests.

Return ONLY the JSON object with no extra text.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert problem setter for competitive programming platforms. Generate high-quality, well-tested programming problems."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const problem = JSON.parse(response) as GeneratedProblem;
    
    // Validate the generated problem
    validateGeneratedProblem(problem);
    
    return problem;
  } catch (error) {
    console.error('Error generating problem with OpenAI:', error);
    throw new Error('Failed to generate problem with OpenAI');
  }
}

// Validate generated problem structure
function validateGeneratedProblem(problem: any): asserts problem is GeneratedProblem {
  const requiredFields = ['title', 'difficulty', 'description', 'input_format', 'output_format', 'constraints'];
  
  for (const field of requiredFields) {
    if (!problem[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!['Easy', 'Medium', 'Hard'].includes(problem.difficulty)) {
    throw new Error('Invalid difficulty level');
  }

  if (!Array.isArray(problem.sample_tests) || problem.sample_tests.length < 2) {
    throw new Error('At least 2 sample tests required');
  }

  if (!Array.isArray(problem.hidden_tests) || problem.hidden_tests.length < 2) {
    throw new Error('At least 2 hidden tests required');
  }

  // Validate test cases
  for (const test of [...problem.sample_tests, ...problem.hidden_tests]) {
    if (!test.input || !test.output) {
      throw new Error('Invalid test case structure');
    }
  }
}

// Generate problem with specific difficulty
export async function generateProblemWithDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<GeneratedProblem> {
  try {
    const prompt = `Generate a ${difficulty} programming problem for an online judge.

Requirements:
1. Difficulty: ${difficulty}
2. Must work with Judge0 API (C, C++, Java, Python, JavaScript)
3. Plain text input/output only
4. At least 2 sample tests and 2 hidden tests
5. Clear problem statement with constraints

Return ONLY a JSON object with this structure:
{
  "title": "Short descriptive title",
  "difficulty": "${difficulty}",
  "description": "Clear problem statement with input/output specs and constraints.",
  "input_format": "Describe input format",
  "output_format": "Describe output format",
  "constraints": "List constraints",
  "sample_tests": [
    {
      "input": "Sample input string exactly as given to stdin",
      "output": "Expected output string exactly as returned to stdout"
    }
  ],
  "hidden_tests": [
    {
      "input": "Hidden test input",
      "output": "Expected output"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert problem setter specializing in ${difficulty} competitive programming problems.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const problem = JSON.parse(response) as GeneratedProblem;
    validateGeneratedProblem(problem);
    
    return problem;
  } catch (error) {
    console.error(`Error generating ${difficulty} problem:`, error);
    throw new Error(`Failed to generate ${difficulty} problem`);
  }
}

// Generate problem with specific topic
export async function generateProblemWithTopic(topic: string, difficulty?: 'Easy' | 'Medium' | 'Hard'): Promise<GeneratedProblem> {
  try {
    const difficultyText = difficulty ? ` with ${difficulty} difficulty` : ' with random difficulty';
    const prompt = `Generate a programming problem about ${topic}${difficultyText} for an online judge.

Requirements:
1. Topic: ${topic}
2. Must work with Judge0 API (C, C++, Java, Python, JavaScript)
3. Plain text input/output only
4. At least 2 sample tests and 2 hidden tests
5. Clear problem statement with constraints

Return ONLY a JSON object with this structure:
{
  "title": "Short descriptive title",
  "difficulty": "Easy | Medium | Hard",
  "description": "Clear problem statement with input/output specs and constraints.",
  "input_format": "Describe input format",
  "output_format": "Describe output format",
  "constraints": "List constraints",
  "sample_tests": [
    {
      "input": "Sample input string exactly as given to stdin",
      "output": "Expected output string exactly as returned to stdout"
    }
  ],
  "hidden_tests": [
    {
      "input": "Hidden test input",
      "output": "Expected output"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert problem setter specializing in ${topic} problems.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const problem = JSON.parse(response) as GeneratedProblem;
    validateGeneratedProblem(problem);
    
    return problem;
  } catch (error) {
    console.error(`Error generating ${topic} problem:`, error);
    throw new Error(`Failed to generate ${topic} problem`);
  }
}

// Generate problem hints and explanations
export async function generateProblemHints(problem: GeneratedProblem): Promise<{
  hints: string[];
  explanation: string;
  solution_approach: string;
}> {
  try {
    const prompt = `Given this programming problem, provide helpful hints and explanations:

Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

Provide:
1. 3 progressive hints (from subtle to more direct)
2. A clear explanation of the solution approach
3. Step-by-step solution methodology

Return ONLY a JSON object:
{
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "explanation": "Clear explanation of the solution approach",
  "solution_approach": "Step-by-step methodology"
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert programming tutor. Provide clear, helpful hints and explanations for competitive programming problems."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating hints:', error);
    throw new Error('Failed to generate problem hints');
  }
}

// Generate problem tags and categorization
export async function generateProblemTags(problem: GeneratedProblem): Promise<{
  tags: string[];
  topic: string;
  category: string;
}> {
  try {
    const prompt = `Analyze this programming problem and provide appropriate tags and categorization:

Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

Provide:
1. 3-5 relevant tags (e.g., "arrays", "sorting", "greedy", "dynamic-programming")
2. Primary topic/category
3. Problem type classification

Return ONLY a JSON object:
{
  "tags": ["tag1", "tag2", "tag3"],
  "topic": "Primary topic",
  "category": "Problem type"
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert at categorizing competitive programming problems. Provide accurate tags and classifications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating tags:', error);
    throw new Error('Failed to generate problem tags');
  }
}
