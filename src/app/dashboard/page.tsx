"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Mock data - removed unused userStats

const dailyChallenge = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9"
  ]
};

// Leaderboard data removed - now accessible via navbar

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("challenge");
  const [code, setCode] = useState("// Write your solution here\nfunction twoSum(nums, target) {\n    \n}");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // Use real user data from session
  const userStats = {
    currentStreak: session?.user?.currentStreak || 0,
    longestStreak: session?.user?.longestStreak || 0,
    problemsSolved: 42, // TODO: Get from database
    rank: 156, // TODO: Get from database
    totalUsers: 1250 // TODO: Get from database
  };

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
    <motion.div
      className="min-h-screen bg-background text-foreground"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
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

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-primary">{userStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-primary">{userStats.problemsSolved}</div>
            <div className="text-sm text-muted-foreground">Problems Solved</div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-primary">#{userStats.rank}</div>
            <div className="text-sm text-muted-foreground">AOT Academy Rank</div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-primary">{userStats.longestStreak}</div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex space-x-1 mb-8 bg-muted/50 rounded-lg p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { id: "challenge", label: "Today&apos;s Challenge", icon: "🎯" },
            { id: "editor", label: "Code Editor", icon: "💻" }
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-card-foreground">{dailyChallenge.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dailyChallenge.difficulty === "Easy" 
                      ? "bg-green-500/20 text-green-500" 
                      : dailyChallenge.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  }`}>
                    {dailyChallenge.difficulty}
                  </span>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {dailyChallenge.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Example:</h3>
                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                      <div className="text-muted-foreground">Input: {dailyChallenge.examples[0].input}</div>
                      <div className="text-foreground">Output: {dailyChallenge.examples[0].output}</div>
                      <div className="text-muted-foreground">Explanation: {dailyChallenge.examples[0].explanation}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">Constraints:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {dailyChallenge.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Today&apos;s Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Challenge Status</span>
                      <span className="text-primary font-medium">Not Started</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Time Spent</span>
                      <span className="text-foreground font-medium">0:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Attempts</span>
                      <span className="text-foreground font-medium">0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Streak Status</h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userStats.currentStreak} days</div>
                      <div className="text-sm text-muted-foreground">Keep it up!</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}


          {activeTab === "editor" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Code Editor */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-card-foreground">Code Editor</h2>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 bg-background border border-border rounded-lg text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-64 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none"
                    placeholder="Write your solution here..."
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Run Code
                  </motion.button>
                  <motion.button
                    className="flex-1 border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Solution
                  </motion.button>
                </div>
              </motion.div>

              {/* Output Panel */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Output</h3>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm text-muted-foreground">
                    Click &quot;Run Code&quot; to see your output here...
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Test Cases</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Test Case 1</span>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Test Case 2</span>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Test Case 3</span>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
}
