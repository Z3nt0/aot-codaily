"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProblemGeneratorProps {
  onProblemGenerated?: (problem: any) => void;
}

export function ProblemGenerator({ onProblemGenerated }: ProblemGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Random'>('Random');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: difficulty === 'Random' ? undefined : difficulty,
          topic: customTopic || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onProblemGenerated?.(data.problem);
        alert('Problem generated successfully!');
      } else {
        alert('Failed to generate problem: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating problem:', error);
      alert('Failed to generate problem');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-4">AI Problem Generator</h2>
      
      <div className="space-y-4">
        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Random">Random</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Topic (Optional)</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          >
            <option value="">No specific topic</option>
            <option value="arrays">Arrays</option>
            <option value="strings">Strings</option>
            <option value="sorting">Sorting</option>
            <option value="searching">Searching</option>
            <option value="dynamic-programming">Dynamic Programming</option>
            <option value="greedy">Greedy Algorithms</option>
            <option value="graphs">Graphs</option>
            <option value="trees">Trees</option>
            <option value="math">Mathematics</option>
            <option value="geometry">Geometry</option>
          </select>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Or enter a custom topic..."
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Problem...
            </div>
          ) : (
            'Generate Problem'
          )}
        </button>
      </div>

      {/* Generation Tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-md">
        <h3 className="font-medium mb-2">💡 Generation Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• AI generates problems compatible with Judge0 API</li>
          <li>• Problems include sample tests and hidden tests</li>
          <li>• All problems require human review before publishing</li>
          <li>• Generated problems are automatically tagged and categorized</li>
        </ul>
      </div>
    </motion.div>
  );
}

