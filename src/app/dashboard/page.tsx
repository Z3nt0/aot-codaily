"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";

// Types for today's challenge data
interface TodayChallenge {
  problem: {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    examples: Array<{
      input: string;
      output: string;
      explanation: string;
    }>;
  };
  userProgress: {
    status: 'not_started' | 'attempted' | 'completed';
    attempts: number;
    lastSubmission: string | null;
  };
  streak: {
    current: number;
    longest: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("challenge");
  const [todayChallenge, setTodayChallenge] = useState<TodayChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch today's challenge
  useEffect(() => {
    const fetchTodayChallenge = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/today');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch today\'s challenge');
        }
        
        const data = await response.json();
        setTodayChallenge(data);
      } catch (err) {
        console.error('Error fetching today\'s challenge:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch today\'s challenge');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchTodayChallenge();
    } else if (status === 'unauthenticated') {
      setError('Please log in to view today\'s challenge');
      setLoading(false);
    }
  }, [status]);


  if (status === "loading") {
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

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <Link
            href="/login"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
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
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-primary">{session?.user?.username || "Developer"}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to tackle today&apos;s challenge? Let&apos;s keep that streak going!
          </p>
        </motion.div>


        {/* Tab Navigation */}
        <motion.div
          className="flex space-x-1 mb-8 bg-muted/50 rounded-lg p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { id: "challenge", label: "Today's Challenge", icon: "🎯" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === "challenge" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Challenge Description */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div 
                        className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-muted-foreground">Loading today&apos;s challenge...</span>
                    </motion.div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-yellow-500 mb-2">⏰</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Challenge Today</h3>
                    <p className="text-muted-foreground mb-4">
                      {error.includes("Check back later") 
                        ? "No challenge is scheduled for today. Check back tomorrow or contact an admin to schedule one!"
                        : error
                      }
                    </p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mr-2"
                      >
                        Refresh
                      </button>
                      <button 
                        onClick={() => window.location.href = '/leaderboard'}
                        className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                ) : todayChallenge ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-card-foreground">{todayChallenge.problem.title}</h2>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          todayChallenge.problem.difficulty === "EASY" 
                            ? "bg-green-500/20 text-green-500" 
                            : todayChallenge.problem.difficulty === "MEDIUM"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {todayChallenge.problem.difficulty}
                        </span>
                        <Link
                          href={`/problem/${todayChallenge.problem.id}`}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          Solve Challenge
                        </Link>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {todayChallenge.problem.description}
                    </p>

                    <div className="space-y-4">
                      {todayChallenge.problem.examples.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Example:</h3>
                          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                            <div className="text-muted-foreground">Input: {todayChallenge.problem.examples[0].input}</div>
                            <div className="text-foreground">Output: {todayChallenge.problem.examples[0].output}</div>
                            <div className="text-muted-foreground">Explanation: {todayChallenge.problem.examples[0].explanation}</div>
                          </div>
                        </div>
                      )}

                      {todayChallenge.problem.constraints && (
                        <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Constraints:</h3>
                          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                            {todayChallenge.problem.constraints}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {todayChallenge ? (
                  <>
                    <div className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-6">
                      <h3 className="text-lg font-semibold text-primary mb-4">Today&apos;s Progress</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Challenge Status</span>
                          <span className={`font-medium ${
                            todayChallenge.userProgress.status === 'completed' 
                              ? 'text-green-500' 
                              : todayChallenge.userProgress.status === 'attempted'
                              ? 'text-yellow-500'
                              : 'text-muted-foreground'
                          }`}>
                            {todayChallenge.userProgress.status === 'completed' ? '✅ Completed' :
                             todayChallenge.userProgress.status === 'attempted' ? '🔄 In Progress' :
                             '⏳ Not Started'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Attempts</span>
                          <span className="text-foreground font-medium">{todayChallenge.userProgress.attempts}</span>
                        </div>
                        {todayChallenge.userProgress.lastSubmission && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Last Attempt</span>
                            <span className="text-foreground font-medium text-sm">
                              {new Date(todayChallenge.userProgress.lastSubmission).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-card-foreground mb-4">Streak Status</h3>
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">🔥</div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{todayChallenge.streak.current} days</div>
                          <div className="text-sm text-muted-foreground">
                            Best: {todayChallenge.streak.longest} days
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                    <div className="text-center py-4">
                      <div className="text-muted-foreground">No challenge data available</div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}


        </motion.div>
      </main>
    </div>
  );
}
