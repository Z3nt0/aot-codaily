"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  createdAt: string;
  metadata: any;
}

interface ProblemReviewerProps {
  problems: Problem[];
  onProblemReviewed: (problemId: string, action: 'approve' | 'reject', feedback?: string) => void;
  onRefresh: () => void;
}

export function ProblemReviewer({ problems, onProblemReviewed, onRefresh }: ProblemReviewerProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!selectedProblem) return;
    
    setIsReviewing(true);
    try {
      await onProblemReviewed(selectedProblem.id, action, reviewFeedback);
      setSelectedProblem(null);
      setReviewFeedback('');
      onRefresh();
    } catch (error) {
      console.error('Error reviewing problem:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pending Review ({problems.length})</h2>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
        >
          Refresh
        </button>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No problems pending review</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {problems.map((problem) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{problem.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProblem(problem)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Review
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {problem.description.substring(0, 200)}...
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-foreground">Input Format:</strong>
                  <p className="text-muted-foreground text-xs mt-1">{problem.inputFormat}</p>
                </div>
                <div>
                  <strong className="text-foreground">Output Format:</strong>
                  <p className="text-muted-foreground text-xs mt-1">{problem.outputFormat}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Review Problem</h3>
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{selectedProblem.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
              
              <div>
                <strong className="text-foreground">Description:</strong>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProblem.description}</p>
              </div>
              
              <div>
                <strong className="text-foreground">Input Format:</strong>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProblem.inputFormat}</p>
              </div>
              
              <div>
                <strong className="text-foreground">Output Format:</strong>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProblem.outputFormat}</p>
              </div>
              
              <div>
                <strong className="text-foreground">Constraints:</strong>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedProblem.constraints}</p>
              </div>

              {/* Sample Tests */}
              {selectedProblem.metadata?.sampleTests && (
                <div>
                  <strong className="text-foreground">Sample Tests:</strong>
                  <div className="mt-2 space-y-2">
                    {selectedProblem.metadata.sampleTests.map((test: any, index: number) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-md">
                        <div className="text-sm">
                          <strong>Input:</strong>
                          <pre className="mt-1 text-xs">{test.input}</pre>
                        </div>
                        <div className="text-sm mt-2">
                          <strong>Output:</strong>
                          <pre className="mt-1 text-xs">{test.output}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Review Feedback (Optional):</label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Add any feedback or notes about this problem..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleReview('approve')}
                disabled={isReviewing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isReviewing ? 'Processing...' : 'Approve & Publish'}
              </button>
              <button
                onClick={() => handleReview('reject')}
                disabled={isReviewing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isReviewing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => setSelectedProblem(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
