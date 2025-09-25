"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Mock user stats - in real app, these would come from database
  const userStats = {
    currentStreak: session?.user?.currentStreak || 0,
    longestStreak: session?.user?.longestStreak || 0,
    problemsSolved: 42,
    rank: 156,
    totalUsers: 1250,
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    favoriteLanguage: "JavaScript",
    achievements: [
      { id: 1, name: "First Problem Solved", description: "Solved your first coding challenge", icon: "🎯", earned: true },
      { id: 2, name: "Week Warrior", description: "Solved problems for 7 consecutive days", icon: "⚔️", earned: true },
      { id: 3, name: "Algorithm Master", description: "Solved 50 algorithm problems", icon: "🧠", earned: false },
      { id: 4, name: "Speed Demon", description: "Solved a problem in under 5 minutes", icon: "⚡", earned: false },
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {session?.user?.avatar ? (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`}
                  alt={session.user.username}
                  className="w-24 h-24 rounded-full border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                  <span className="text-3xl font-bold text-primary">
                    {session?.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {session?.user?.username || "Developer"}
              </h1>
              <p className="text-muted-foreground mb-4">
                Discord ID: {session?.user?.discordId}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Joined: {userStats.joinDate}</span>
                <span>Last Active: {userStats.lastActive}</span>
                <span>Favorite: {userStats.favoriteLanguage}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex space-x-1 mb-8 bg-muted/50 rounded-lg p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "achievements", label: "Achievements", icon: "🏆" },
            { id: "settings", label: "Settings", icon: "⚙️" }
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
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Stats Cards */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{userStats.currentStreak}</div>
                      <div className="text-sm text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{userStats.longestStreak}</div>
                      <div className="text-sm text-muted-foreground">Best Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{userStats.problemsSolved}</div>
                      <div className="text-sm text-muted-foreground">Problems Solved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">#{userStats.rank}</div>
                      <div className="text-sm text-muted-foreground">Global Rank</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Solved &quot;Two Sum&quot; problem</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Extended streak to 5 days</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">Achieved &quot;Week Warrior&quot; badge</span>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Chart */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-card-foreground mb-4">Progress This Month</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Problems Solved</span>
                      <span>12/30</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Streak Days</span>
                      <span>5/30</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time Spent</span>
                      <span>8.5h/40h</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid md:grid-cols-2 gap-6">
              {userStats.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 ${
                    achievement.earned ? 'border-primary/50' : 'opacity-60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-4xl ${achievement.earned ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${achievement.earned ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            ✓ Earned
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-card-foreground mb-6">Account Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={session?.user?.username || ''}
                      disabled
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Username is managed through Discord
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={session?.user?.email || 'Not provided'}
                      disabled
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email is managed through Discord
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-sm">Daily challenge reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-sm">Achievement notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm">Leaderboard updates</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
