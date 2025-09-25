// Mock OpenAI service for testing when quota is exceeded
// This provides sample problems for testing the interface

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

// Mock problem templates
const mockProblems = {
  Easy: [
    {
      title: "Two Sum",
      difficulty: "Easy" as const,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      input_format: "First line contains n (2 ≤ n ≤ 10^4), the length of the array.\nSecond line contains n integers separated by spaces.\nThird line contains target integer.",
      output_format: "Print two indices separated by a space.",
      constraints: "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9",
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
          input: "5\n1 2 3 4 5\n8",
          output: "2 4"
        }
      ]
    },
    {
      title: "Palindrome Number",
      difficulty: "Easy" as const,
      description: "Given an integer x, return true if x is a palindrome integer.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\nFor example, 121 is a palindrome while 123 is not.",
      input_format: "Single line containing integer x.",
      output_format: "Print 'true' if x is a palindrome, 'false' otherwise.",
      constraints: "-2^31 ≤ x ≤ 2^31 - 1",
      sample_tests: [
        {
          input: "121",
          output: "true"
        },
        {
          input: "-121",
          output: "false"
        }
      ],
      hidden_tests: [
        {
          input: "10",
          output: "false"
        },
        {
          input: "0",
          output: "true"
        }
      ]
    }
  ],
  Medium: [
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium" as const,
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      input_format: "Single line containing string s.",
      output_format: "Print the length of the longest substring without repeating characters.",
      constraints: "0 ≤ s.length ≤ 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
      sample_tests: [
        {
          input: "abcabcbb",
          output: "3"
        },
        {
          input: "bbbbb",
          output: "1"
        }
      ],
      hidden_tests: [
        {
          input: "pwwkew",
          output: "3"
        },
        {
          input: "",
          output: "0"
        }
      ]
    }
  ],
  Hard: [
    {
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard" as const,
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
      input_format: "First line contains m and n (0 ≤ m, n ≤ 1000).\nSecond line contains m integers (sorted array nums1).\nThird line contains n integers (sorted array nums2).",
      output_format: "Print the median as a decimal number.",
      constraints: "nums1.length == m\nnums2.length == n\n0 ≤ m ≤ 1000\n0 ≤ n ≤ 1000\n1 ≤ m + n ≤ 2000\n-10^6 ≤ nums1[i], nums2[i] ≤ 10^6",
      sample_tests: [
        {
          input: "2 2\n1 3\n2 4",
          output: "2.5"
        },
        {
          input: "2 1\n1 2\n3",
          output: "2.0"
        }
      ],
      hidden_tests: [
        {
          input: "0 1\n\n2",
          output: "2.0"
        },
        {
          input: "1 0\n1\n",
          output: "1.0"
        }
      ]
    }
  ]
};

// Generate a mock problem
export async function generateProblem(): Promise<GeneratedProblem> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const difficulties = ['Easy', 'Medium', 'Hard'] as const;
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const problems = mockProblems[difficulty];
  const problem = problems[Math.floor(Math.random() * problems.length)];
  
  return problem;
}

// Generate problem with specific difficulty
export async function generateProblemWithDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<GeneratedProblem> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const problems = mockProblems[difficulty];
  const problem = problems[Math.floor(Math.random() * problems.length)];
  
  return problem;
}

// Generate problem with specific topic
export async function generateProblemWithTopic(topic: string, difficulty?: 'Easy' | 'Medium' | 'Hard'): Promise<GeneratedProblem> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const difficulties = difficulty ? [difficulty] : ['Easy', 'Medium', 'Hard'] as const;
  const selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const problems = mockProblems[selectedDifficulty];
  const problem = problems[Math.floor(Math.random() * problems.length)];
  
  // Add topic-specific title
  return {
    ...problem,
    title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} - ${problem.title}`
  };
}

// Generate hints for a problem
export async function generateProblemHints(problem: GeneratedProblem): Promise<{
  hints: string[];
  explanation: string;
  solution_approach: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    hints: [
      `Think about the problem step by step for ${problem.title}`,
      `Consider the constraints: ${problem.constraints}`,
      `Try to optimize your solution for better performance`
    ],
    explanation: `This is a ${problem.difficulty} problem that requires careful analysis of the input and output requirements.`,
    solution_approach: `1. Understand the problem requirements\n2. Analyze the constraints\n3. Design an efficient algorithm\n4. Implement and test your solution`
  };
}

// Generate tags for a problem
export async function generateProblemTags(problem: GeneratedProblem): Promise<{
  tags: string[];
  topic: string;
  category: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const topicMap: { [key: string]: string } = {
    'Two Sum': 'arrays',
    'Palindrome': 'strings',
    'Longest Substring': 'strings',
    'Median': 'arrays'
  };
  
  const topic = topicMap[problem.title.split(' - ')[1] || problem.title] || 'algorithms';
  
  return {
    tags: [topic, problem.difficulty.toLowerCase(), 'competitive-programming'],
    topic: topic,
    category: 'Data Structures and Algorithms'
  };
}

