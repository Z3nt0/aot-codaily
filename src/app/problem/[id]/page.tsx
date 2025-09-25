"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { CodeEditor } from "@/components/code/CodeEditor";
import { 
  Users, 
  Trophy,
} from "lucide-react";

// Problem interface
interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  inputFormat: string | null;
  outputFormat: string | null;
  constraints: string | null;
  testCases: Array<{
    id: string;
    type: string;
    input: string;
    output: string;
    isHidden: boolean;
  }>;
  submissions: number;
  acceptanceRate: number;
  userSubmission?: {
    id: string;
    result: string;
    score: number | null;
    submittedAt: string;
  } | null;
}

export default function ProblemPage() {
  const params = useParams();
  useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    status: 'accepted' | 'wrong_answer' | 'error' | 'running';
    runtime?: number;
    testCaseResults?: Array<{
      passed: boolean;
      input: string;
      output: string;
      expected: string;
    }>;
  } | null>(null);
  const [activeTab] = useState<"problem" | "submissions">("problem");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/problems/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch problem');
        }
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch problem');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProblem();
    }
  }, [params.id]);

  // Handle code execution
  const handleRunCode = async (code: string, language: string) => {
    setIsRunning(true);
    setResult(null);

    try {
      // Submit code to Judge0
      const response = await fetch('/api/judge0/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language_id: getLanguageId(language),
          source_code: code,
          stdin: problem?.testCases.find(t => t.type === 'SAMPLE')?.input || '',
          expected_output: problem?.testCases.find(t => t.type === 'SAMPLE')?.output || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Judge0 submission error:', errorData);
        throw new Error(`Failed to submit code: ${errorData.error || response.statusText}`);
      }

      const { token } = await response.json();

      // Poll for result
      const maxAttempts = 30;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`/api/judge0/result?token=${token}`);
        
        if (!resultResponse.ok) {
          throw new Error('Failed to get result');
        }

        const resultData = await resultResponse.json();

        // Check if submission is complete
        if (resultData.status.id !== 1 && resultData.status.id !== 2) {
          // Format result for CodeEditor
          const formattedResult = {
            status: (resultData.status.id === 3 ? 'accepted' : 
                   resultData.status.id === 4 ? 'wrong_answer' : 'error') as 'accepted' | 'wrong_answer' | 'error',
            runtime: resultData.time ? parseFloat(resultData.time) * 1000 : 0,
            testCaseResults: [{
              passed: resultData.status.id === 3,
              input: problem?.testCases.find(t => t.type === 'SAMPLE')?.input || '',
              output: resultData.stdout || '',
              expected: problem?.testCases.find(t => t.type === 'SAMPLE')?.output || ''
            }]
          };
          setResult(formattedResult);
          break;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Submission timeout');
      }

    } catch (error) {
      console.error('Code execution error:', error);
      setResult({
        status: 'error',
        runtime: 0,
        testCaseResults: [{
          passed: false,
          input: problem?.testCases.find(t => t.type === 'SAMPLE')?.input || '',
          output: error instanceof Error ? error.message : 'Unknown error',
          expected: problem?.testCases.find(t => t.type === 'SAMPLE')?.output || ''
        }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle submit code - runs all test cases and submits to database
  const handleSubmitCode = async (code: string, language: string) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      // Get all test cases (both sample and hidden)
      const allTestCases = problem?.testCases || [];
      
      if (allTestCases.length === 0) {
        throw new Error('No test cases available for this problem');
      }

      // Run code against all test cases
      const testResults = [];
      let allPassed = true;
      let totalRuntime = 0;

      for (const testCase of allTestCases) {
        try {
          // Submit to Judge0
          const response = await fetch('/api/judge0/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              language_id: getLanguageId(language),
              source_code: code,
              stdin: testCase.input,
              expected_output: testCase.output,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to submit to Judge0');
          }

          const { token } = await response.json();

          // Poll for result
          const maxAttempts = 30;
          let attempts = 0;
          let testResult = null;

          while (attempts < maxAttempts) {
            const resultResponse = await fetch(`/api/judge0/result?token=${token}`);
            
            if (!resultResponse.ok) {
              throw new Error('Failed to get result');
            }

            const resultData = await resultResponse.json();

            if (resultData.status.id !== 1 && resultData.status.id !== 2) {
              const passed = resultData.status.id === 3;
              const runtime = resultData.time ? parseFloat(resultData.time) * 1000 : 0;
              
              testResult = {
                passed,
                input: testCase.input,
                output: resultData.stdout || '',
                expected: testCase.output,
                runtime
              };
              
              if (!passed) allPassed = false;
              totalRuntime += runtime;
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }

          if (!testResult) {
            throw new Error('Test case timeout');
          }

          testResults.push(testResult);

        } catch (error) {
          console.error(`Test case ${testCase.id} failed:`, error);
          testResults.push({
            passed: false,
            input: testCase.input,
            output: error instanceof Error ? error.message : 'Unknown error',
            expected: testCase.output,
            runtime: 0
          });
          allPassed = false;
        }
      }

      // Create submission record
      const submissionResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: problem?.id,
          language,
          code,
          result: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
          score: allPassed ? 100 : 0,
          runtimeMs: Math.round(totalRuntime),
          output: testResults.map(r => r.output).join('\n')
        }),
      });

      if (!submissionResponse.ok) {
        throw new Error('Failed to save submission');
      }

      // Update result for display
      setResult({
        status: allPassed ? 'accepted' : 'wrong_answer',
        runtime: Math.round(totalRuntime),
        testCaseResults: testResults
      });

      // Refresh problem data to update submission count
      if (problem) {
        const updatedResponse = await fetch(`/api/problems/${problem.id}`);
        if (updatedResponse.ok) {
          const updatedProblem = await updatedResponse.json();
          setProblem(updatedProblem);
        }
      }

    } catch (error) {
      console.error('Submit error:', error);
      setResult({
        status: 'error',
        runtime: 0,
        testCaseResults: [{
          passed: false,
          input: '',
          output: error instanceof Error ? error.message : 'Unknown error',
          expected: ''
        }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get language ID for Judge0
  const getLanguageId = (lang: string) => {
    const langMap: Record<string, number> = {
      'javascript': 63,
      'python': 78,
      'java': 62,
      'cpp': 54,
      'c': 50,
      'csharp': 51,
      'go': 60,
      'php': 68,
      'ruby': 72,
      'typescript': 74,
    };
    return langMap[lang.toLowerCase()] || 63;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-lg">Loading...</span>
        </motion.div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The problem you're looking for doesn't exist."}
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </a>
        </motion.div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">Please sign in to solve problems</h1>
          <a
            href="/login"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-0">
          {/* Problem Description */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Problem Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground">{problem.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{problem.submissions.toLocaleString()} submissions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>{problem.acceptanceRate}% acceptance rate</span>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <div className="text-muted-foreground whitespace-pre-line">
                  {problem.description}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Input Format</h3>
                <div className="text-muted-foreground whitespace-pre-line font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {problem.inputFormat}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Output Format</h3>
                <div className="text-muted-foreground whitespace-pre-line font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {problem.outputFormat}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Constraints</h3>
                <div className="text-muted-foreground whitespace-pre-line font-mono text-sm bg-muted/50 p-3 rounded-lg">
                  {problem.constraints}
                </div>
              </div>

            </div>
          </motion.div>

          {/* Code Editor */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border h-full flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CodeEditor
              initialCode={code}
              language={language}
              onCodeChange={setCode}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              result={result || undefined}
              testCases={problem?.testCases?.filter(tc => tc.type === 'SAMPLE').map(tc => ({
                input: tc.input,
                output: tc.output,
                expected: tc.output
              })) || []}
              className="h-full"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
