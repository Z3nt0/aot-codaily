/**
 * Problem JSON Schema Validation
 * Validates the JSON input for creating/editing problems
 */

export interface ProblemSchema {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate problem JSON schema
 */
export function validateProblemSchema(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be a valid JSON object');
    return { isValid: false, errors };
  }

  // Required fields
  const requiredFields = [
    'title', 'difficulty', 'description', 
    'input_format', 'output_format', 'constraints',
    'sample_tests', 'hidden_tests'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  if (data.title && typeof data.title !== 'string') {
    errors.push('title must be a string');
  }

  if (data.difficulty && !['Easy', 'Medium', 'Hard'].includes(data.difficulty)) {
    errors.push('difficulty must be "Easy", "Medium", or "Hard"');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('description must be a string');
  }

  if (data.input_format && typeof data.input_format !== 'string') {
    errors.push('input_format must be a string');
  }

  if (data.output_format && typeof data.output_format !== 'string') {
    errors.push('output_format must be a string');
  }

  if (data.constraints && typeof data.constraints !== 'string') {
    errors.push('constraints must be a string');
  }

  // Check arrays
  if (data.sample_tests && !Array.isArray(data.sample_tests)) {
    errors.push('sample_tests must be an array');
  }

  if (data.hidden_tests && !Array.isArray(data.hidden_tests)) {
    errors.push('hidden_tests must be an array');
  }

  // Check test case structure
  if (Array.isArray(data.sample_tests)) {
    data.sample_tests.forEach((test: any, index: number) => {
      if (typeof test !== 'object' || test === null) {
        errors.push(`sample_tests[${index}] must be an object`);
      } else {
        if (!test.input || typeof test.input !== 'string') {
          errors.push(`sample_tests[${index}].input must be a string`);
        }
        if (!test.output || typeof test.output !== 'string') {
          errors.push(`sample_tests[${index}].output must be a string`);
        }
      }
    });
  }

  if (Array.isArray(data.hidden_tests)) {
    data.hidden_tests.forEach((test: any, index: number) => {
      if (typeof test !== 'object' || test === null) {
        errors.push(`hidden_tests[${index}] must be an object`);
      } else {
        if (!test.input || typeof test.input !== 'string') {
          errors.push(`hidden_tests[${index}].input must be a string`);
        }
        if (!test.output || typeof test.output !== 'string') {
          errors.push(`hidden_tests[${index}].output must be a string`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get empty problem template
 */
export function getEmptyProblemTemplate(): string {
  return JSON.stringify({
    title: "",
    difficulty: "Easy",
    description: "",
    input_format: "",
    output_format: "",
    constraints: "",
    sample_tests: [
      {
        input: "",
        output: ""
      }
    ],
    hidden_tests: [
      {
        input: "",
        output: ""
      }
    ]
  }, null, 2);
}

/**
 * Get example problem template
 */
export function getExampleProblemTemplate(): string {
  return JSON.stringify({
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    input_format: "The first line contains an integer n (2 ≤ n ≤ 10^4), the length of the array.\nThe second line contains n integers nums[i] (-10^9 ≤ nums[i] ≤ 10^9).\nThe third line contains an integer target (-10^9 ≤ target ≤ 10^9).",
    output_format: "Print two integers i and j (0 ≤ i < j < n) such that nums[i] + nums[j] = target.",
    constraints: "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9\nOnly one valid answer exists.",
    sample_tests: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1"
      },
      {
        input: "3\n3 2 4\n6",
        output: "1 2"
      }
    ],
    hidden_tests: [
      {
        input: "2\n3 3\n6",
        output: "0 1"
      },
      {
        input: "4\n-1 -2 -3 -4\n-100",
        output: "0 1"
      }
    ]
  }, null, 2);
}

