"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Mock leaderboard data
const leaderboardData = {
  daily: [
    { rank: 1, name: "Alex Chen", username: "alexchen", streak: 45, problems: 156, score: 2847, avatar: null },
    { rank: 2, name: "Sarah Kim", username: "sarahkim", streak: 38, problems: 142, score: 2653, avatar: null },
    { rank: 3, name: "Mike Johnson", username: "mikej", streak: 35, problems: 138, score: 2519, avatar: null },
    { rank: 4, name: "Emma Wilson", username: "emmaw", streak: 32, problems: 125, score: 2384, avatar: null },
    { rank: 5, name: "David Lee", username: "davidl", streak: 28, problems: 118, score: 2251, avatar: null },
    { rank: 6, name: "Lisa Zhang", username: "lisaz", streak: 25, problems: 112, score: 2103, avatar: null },
    { rank: 7, name: "Tom Brown", username: "tomb", streak: 22, problems: 98, score: 1956, avatar: null },
    { rank: 8, name: "Anna Davis", username: "annad", streak: 20, problems: 87, score: 1823, avatar: null },
    { rank: 9, name: "Chris Wilson", username: "chrisw", streak: 18, problems: 76, score: 1694, avatar: null },
    { rank: 10, name: "Maria Garcia", username: "mariag", streak: 15, problems: 65, score: 1567, avatar: null }
  ],
  weekly: [
    { rank: 1, name: "Sarah Kim", username: "sarahkim", streak: 38, problems: 142, score: 2653, avatar: null },
    { rank: 2, name: "Alex Chen", username: "alexchen", streak: 45, problems: 156, score: 2847, avatar: null },
    { rank: 3, name: "Emma Wilson", username: "emmaw", streak: 32, problems: 125, score: 2384, avatar: null },
    { rank: 4, name: "Mike Johnson", username: "mikej", streak: 35, problems: 138, score: 2519, avatar: null },
    { rank: 5, name: "David Lee", username: "davidl", streak: 28, problems: 118, score: 2251, avatar: null }
  ],
  allTime: [
    { rank: 1, name: "Alex Chen", username: "alexchen", streak: 45, problems: 156, score: 2847, avatar: null },
    { rank: 2, name: "Sarah Kim", username: "sarahkim", streak: 38, problems: 142, score: 2653, avatar: null },
    { rank: 3, name: "Mike Johnson", username: "mikej", streak: 35, problems: 138, score: 2519, avatar: null },
    { rank: 4, name: "Emma Wilson", username: "emmaw", streak: 32, problems: 125, score: 2384, avatar: null },
    { rank: 5, name: "David Lee", username: "davidl", streak: 28, problems: 118, score: 2251, avatar: null },
    { rank: 6, name: "Lisa Zhang", username: "lisaz", streak: 25, problems: 112, score: 2103, avatar: null },
    { rank: 7, name: "Tom Brown", username: "tomb", streak: 22, problems: 98, score: 1956, avatar: null },
    { rank: 8, name: "Anna Davis", username: "annad", streak: 20, problems: 87, score: 1823, avatar: null },
    { rank: 9, name: "Chris Wilson", username: "chrisw", streak: 18, problems: 76, score: 1694, avatar: null },
    { rank: 10, name: "Maria Garcia", username: "mariag", streak: 15, problems: 65, score: 1567, avatar: null }
  ]
};

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [activePeriod, setActivePeriod] = useState("daily");

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
          <h1 className="text-2xl font-bold mb-4">Please sign in to view leaderboard</h1>
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

  const currentLeaderboard = leaderboardData[activePeriod as keyof typeof leaderboardData];

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
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            AOT Academy <span className="text-primary">Leaderboard</span> 🏆
          </h1>
          <p className="text-muted-foreground">
            See how you rank among your fellow AOT Academy students!
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          className="flex space-x-1 mb-8 bg-muted/50 rounded-lg p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { id: "daily", label: "Daily", icon: "📅" },
            { id: "weekly", label: "Weekly", icon: "📊" },
            { id: "allTime", label: "All Time", icon: "🏆" }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activePeriod === period.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <span>{period.icon}</span>
              <span className="font-medium">{period.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              {activePeriod === "daily" && "Daily Rankings"}
              {activePeriod === "weekly" && "Weekly Rankings"}
              {activePeriod === "allTime" && "All-Time Rankings"}
            </h2>
            <div className="text-sm text-muted-foreground">
              {currentLeaderboard.length} students
            </div>
          </div>

          <div className="space-y-3">
            {currentLeaderboard.map((user, index) => (
              <motion.div
                key={user.rank}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  index < 3 ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    index === 2 ? "bg-orange-500 text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Streak</div>
                    <div className="font-bold text-primary">{user.streak} days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Problems</div>
                    <div className="font-bold text-foreground">{user.problems}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="font-bold text-primary">{user.score}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Your Rank (if user is in leaderboard) */}
        {session?.user && (
          <motion.div
            className="mt-8 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-primary mb-4">Your Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">#156</div>
                <div className="text-sm text-muted-foreground">AOT Academy Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">7</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">42</div>
                <div className="text-sm text-muted-foreground">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,250</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
