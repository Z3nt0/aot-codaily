/**
 * Judge0 API Integration
 * Handles code execution and submission to Judge0 API
 */

// Judge0 API Configuration
export const JUDGE0_CONFIG = {
  baseUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  apiKey: process.env.JUDGE0_API_KEY,
  timeout: 10000, // 10 seconds
};

// Supported Programming Languages
export const SUPPORTED_LANGUAGES = [
  { id: 50, name: 'C', extension: 'c' },
  { id: 54, name: 'C++', extension: 'cpp' },
  { id: 51, name: 'C#', extension: 'cs' },
  { id: 60, name: 'Go', extension: 'go' },
  { id: 62, name: 'Java', extension: 'java' },
  { id: 63, name: 'JavaScript', extension: 'js' },
  { id: 78, name: 'Python', extension: 'py' },
  { id: 68, name: 'PHP', extension: 'php' },
  { id: 72, name: 'Ruby', extension: 'rb' },
  { id: 74, name: 'TypeScript', extension: 'ts' },
];

// Judge0 API Types
export interface Judge0Submission {
  language_id: number;
  source_code: string;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: string;
  memory_limit?: string;
  wall_time_limit?: string;
}

export interface Judge0Response {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  time?: string;
  memory?: string;
  status: {
    id: number;
    description: string;
  };
}

export interface Judge0Token {
  token: string;
}

export interface Judge0SubmissionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  time?: string;
  memory?: string;
  status: {
    id: number;
    description: string;
  };
}

// Judge0 Status Codes
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: 7,
  INTERNAL_ERROR: 8,
  EXCEEDED_WALL_TIME_LIMIT: 9,
  MEMORY_LIMIT_EXCEEDED: 10,
  RUNTIME_SIGNAL: 11,
  RUNTIME_ERROR_NON_ZERO_EXIT: 12,
};

// Judge0 API Functions
export class Judge0API {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = JUDGE0_CONFIG.baseUrl, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || JUDGE0_CONFIG.apiKey;
  }

  /**
   * Submit code for execution
   */
  async submitCode(submission: Judge0Submission): Promise<Judge0Token> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const requestBody = {
      ...submission,
      cpu_time_limit: submission.cpu_time_limit || '2.0',
      memory_limit: submission.memory_limit || '128000',
      wall_time_limit: submission.wall_time_limit || '5.0',
    };

    console.log('Judge0 API Request:', {
      url: `${this.baseUrl}/submissions`,
      headers,
      body: requestBody
    });

    const response = await fetch(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Judge0 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Judge0 API Error Response:', errorText);
      throw new Error(`Judge0 API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get submission result by token
   */
  async getSubmissionResult(token: string): Promise<Judge0SubmissionResult> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const response = await fetch(`${this.baseUrl}/submissions/${token}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all supported languages
   */
  async getLanguages(): Promise<any[]> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const response = await fetch(`${this.baseUrl}/languages`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Poll for submission result until completion
   */
  async pollSubmissionResult(token: string, maxAttempts: number = 30): Promise<Judge0SubmissionResult> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getSubmissionResult(token);
      
      // Check if submission is complete
      if (result.status.id !== JUDGE0_STATUS.IN_QUEUE && 
          result.status.id !== JUDGE0_STATUS.PROCESSING) {
        return result;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Submission timeout: Maximum polling attempts reached');
  }
}

// Utility Functions
export function getLanguageById(id: number) {
  return SUPPORTED_LANGUAGES.find(lang => lang.id === id);
}

export function getLanguageByName(name: string) {
  return SUPPORTED_LANGUAGES.find(lang => 
    lang.name.toLowerCase() === name.toLowerCase()
  );
}

export function formatJudge0Status(status: number): string {
  const statusMap: Record<number, string> = {
    [JUDGE0_STATUS.IN_QUEUE]: 'In Queue',
    [JUDGE0_STATUS.PROCESSING]: 'Processing',
    [JUDGE0_STATUS.ACCEPTED]: 'Accepted',
    [JUDGE0_STATUS.WRONG_ANSWER]: 'Wrong Answer',
    [JUDGE0_STATUS.TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded',
    [JUDGE0_STATUS.COMPILATION_ERROR]: 'Compilation Error',
    [JUDGE0_STATUS.RUNTIME_ERROR]: 'Runtime Error',
    [JUDGE0_STATUS.INTERNAL_ERROR]: 'Internal Error',
    [JUDGE0_STATUS.EXCEEDED_WALL_TIME_LIMIT]: 'Wall Time Limit Exceeded',
    [JUDGE0_STATUS.MEMORY_LIMIT_EXCEEDED]: 'Memory Limit Exceeded',
    [JUDGE0_STATUS.RUNTIME_SIGNAL]: 'Runtime Signal',
    [JUDGE0_STATUS.RUNTIME_ERROR_NON_ZERO_EXIT]: 'Runtime Error (Non-zero Exit)',
  };
  
  return statusMap[status] || 'Unknown Status';
}

export function getStatusColor(status: number): string {
  const colorMap: Record<number, string> = {
    [JUDGE0_STATUS.ACCEPTED]: 'text-green-600',
    [JUDGE0_STATUS.WRONG_ANSWER]: 'text-red-600',
    [JUDGE0_STATUS.TIME_LIMIT_EXCEEDED]: 'text-yellow-600',
    [JUDGE0_STATUS.COMPILATION_ERROR]: 'text-red-600',
    [JUDGE0_STATUS.RUNTIME_ERROR]: 'text-red-600',
    [JUDGE0_STATUS.INTERNAL_ERROR]: 'text-red-600',
    [JUDGE0_STATUS.MEMORY_LIMIT_EXCEEDED]: 'text-yellow-600',
  };
  
  return colorMap[status] || 'text-gray-600';
}

// Create Judge0 API instance
export const judge0API = new Judge0API();

