"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Editor } from "@monaco-editor/react";
import { 
  Play, 
  CheckCircle,
  Save,
  Send
} from "lucide-react";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string, language: string) => void;
  onSubmit?: (code: string, language: string) => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  className?: string;
  testCases?: Array<{
    input: string;
    output: string;
    expected: string;
  }>;
  result?: {
    status: 'accepted' | 'wrong_answer' | 'error' | 'running';
    runtime?: number;
    testCaseResults?: Array<{
      passed: boolean;
      input: string;
      output: string;
      expected: string;
    }>;
  };
}

export function CodeEditor({ 
  initialCode = "", 
  language = "javascript",
  onCodeChange,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  className = "",
  testCases = [],
  result
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [activeTab, setActiveTab] = useState<'testcase' | 'results'>('testcase');

  // Supported languages with Judge0 IDs
  const languages = [
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

  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
    }
  };

  // Handle run code
  const handleRun = () => {
    onRun?.(code, selectedLanguage);
  };

  // Handle submit code
  const handleSubmit = () => {
    onSubmit?.(code, selectedLanguage);
  };

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    // Update code template based on language
    const templates: Record<string, string> = {
      'javascript': 'function solution() {\n    // Write your code here\n}',
      'python': 'def solution():\n    # Write your code here\n    pass',
      'java': 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
      'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      'c': '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      'csharp': 'using System;\n\nclass Solution {\n    static void Main() {\n        // Write your code here\n    }\n}',
      'go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}',
      'php': '<?php\n// Write your code here\n?>',
      'ruby': '# Write your code here',
      'typescript': 'function solution(): void {\n    // Write your code here\n}'
    };
    
    if (templates[lang.toLowerCase()]) {
      setCode(templates[lang.toLowerCase()]);
      onCodeChange?.(templates[lang.toLowerCase()]);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0 max-h-full">
      {/* Code Editor Container - Top Right Panel - Matches Problem Container Height */}
      <div className={`bg-background border border-border rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col min-h-0 max-h-full ${className}`} style={{ backgroundColor: 'var(--background)' }}>
        {/* Header - LeetCode Style */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-foreground">Code</h3>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.name.toLowerCase()}>
                {lang.name}
              </option>
            ))}
          </select>
            <span className="text-xs text-muted-foreground">Auto</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              title="Save"
          >
            <Save className="w-4 h-4" />
          </motion.button>
            <span className="text-xs text-green-600 font-medium">Saved</span>
          
          <motion.button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors ${
              isRunning || isSubmitting
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            whileHover={{ scale: isRunning || isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isRunning || isSubmitting ? 1 : 0.98 }}
          >
            {isRunning ? (
              <motion.div
                className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Play className="w-3 h-3" />
              )}
              <span>{isRunning ? "Running..." : "Run"}</span>
            </motion.button>
            
            <motion.button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors ${
                isRunning || isSubmitting
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              whileHover={{ scale: isRunning || isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isRunning || isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <motion.div
                  className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Send className="w-3 h-3" />
            )}
              <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
          </motion.button>
        </div>
      </div>

        {/* Monaco Editor - Professional code editor with syntax highlighting */}
        <div className="flex-1 relative min-h-0 bg-background">
          <Editor
            height="100%"
            language={selectedLanguage}
            value={code}
            onChange={(value) => handleCodeChange(value)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              lineHeight: 24,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              lineNumbers: 'on', // Use Monaco's built-in line numbers
              glyphMargin: false,
              folding: false,
              renderLineHighlight: 'line',
              selectOnLineNumbers: true,
              cursorBlinking: 'blink',
              cursorStyle: 'line',
              cursorWidth: 1,
              readOnly: false,
              contextmenu: true,
              mouseWheelZoom: false,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
              },
              padding: { top: 0, bottom: 0 },
              renderWhitespace: 'none',
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              trimAutoWhitespace: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              }
            }}
          />
        </div>
      </div>

      {/* Test Results Container - Bottom Right Panel */}
      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm max-h-80 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('testcase')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'testcase'
                ? 'text-foreground border-b-2 border-primary bg-muted/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
            }`}
          >
            Test Case
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'text-foreground border-b-2 border-primary bg-muted/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
            }`}
          >
            Results
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'testcase' ? (
            <>
              {/* Testcase Tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h4 className="text-sm font-medium text-foreground">Test Cases</h4>
                  <div className="flex space-x-1">
                    {testCases.length > 0 ? testCases.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedTestCase(index)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          index === selectedTestCase 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Case {index + 1}
                    </button>
                    )) : (
                      <button className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">No test cases</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Input/Output Section */}
              <div className="space-y-4">
                {testCases.length > 0 ? (
                  <>
                    {/* Input and Output - Side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Input */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Input:</label>
                        <div className="p-3 bg-muted/30 border border-border rounded text-sm font-mono">
                          {testCases[selectedTestCase].input}
                        </div>
                      </div>
                      
                      {/* Output */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Output:</label>
                        <div className="p-3 bg-muted/30 border border-border rounded text-sm font-mono">
                          {testCases[selectedTestCase].output}
                        </div>
                      </div>
                    </div>

                    {/* Expected Output - Full width below */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Expected:</label>
                      <div className="p-3 bg-muted/30 border border-border rounded text-sm font-mono">
                        {testCases[selectedTestCase].expected}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No test cases available</p>
                    <p className="text-sm">Test cases will appear here when you run your code</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Results Tab */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-foreground">Execution Results</h4>
                <div className="flex items-center space-x-3">
                  {result ? (
                    <>
                      <div className={`flex items-center space-x-2 ${
                        result.status === 'accepted' ? 'text-green-600' :
                        result.status === 'wrong_answer' ? 'text-red-600' :
                        result.status === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {result.status === 'accepted' ? 'Accepted' :
                           result.status === 'wrong_answer' ? 'Wrong Answer' :
                           result.status === 'error' ? 'Runtime Error' :
                           'Running...'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Runtime: {result.runtime || 0} ms
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Click Run to test your code</span>
                  )}
                </div>
              </div>

              {/* Overall Status Summary */}
              {result && (
                <div className={`p-3 rounded-lg mb-4 ${
                  result.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                  result.status === 'wrong_answer' ? 'bg-red-50 border border-red-200' :
                  result.status === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-5 h-5 ${
                        result.status === 'accepted' ? 'text-green-600' :
                        result.status === 'wrong_answer' ? 'text-red-600' :
                        result.status === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`} />
                      <span className={`font-medium ${
                        result.status === 'accepted' ? 'text-green-800' :
                        result.status === 'wrong_answer' ? 'text-red-800' :
                        result.status === 'error' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        {result.status === 'accepted' ? 'All test cases passed!' :
                         result.status === 'wrong_answer' ? 'Some test cases failed' :
                         result.status === 'error' ? 'Runtime error occurred' :
                         'Code is running...'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.testCaseResults?.length || 0} test cases
                    </div>
                  </div>
                </div>
              )}

              {/* Results Content */}
              <div className="space-y-4">
                {result?.testCaseResults && result.testCaseResults.length > 0 ? (
                  <>
                    {/* Test Case Results */}
                    <div className="space-y-3">
                      {result.testCaseResults.map((testResult, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-muted/10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">Test Case {index + 1}</span>
                            <div className={`flex items-center space-x-2 ${
                              testResult.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {testResult.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="text-muted-foreground text-xs font-medium mb-1 block">Input:</label>
                              <div className="p-3 bg-muted/30 border border-border rounded font-mono text-xs whitespace-pre-wrap">
                                {testResult.input}
                              </div>
                            </div>
                            <div>
                              <label className="text-muted-foreground text-xs font-medium mb-1 block">Output:</label>
                              <div className="p-3 bg-muted/30 border border-border rounded font-mono text-xs whitespace-pre-wrap">
                                {testResult.output || 'No output'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="text-muted-foreground text-xs font-medium mb-1 block">Expected:</label>
                            <div className="p-3 bg-muted/30 border border-border rounded font-mono text-xs whitespace-pre-wrap">
                              {testResult.expected}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : result ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No test case results available</p>
                    <p className="text-sm">Results will appear here after code execution</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No results available</p>
                    <p className="text-sm">Run your code to see execution results</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
            <div className="text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground">Contribute a testcase</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}