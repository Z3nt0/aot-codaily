"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { 
  Users, 
  BookOpen, 
  Activity, 
  Settings, 
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Admin stats interface
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProblems: number;
  problemsToday: number;
  totalSubmissions: number;
  submissionsToday: number;
  averageStreak: number;
  topStreak: number;
}

interface RecentActivity {
  id: string;
  type: string;
  action: string;
  user: string;
  time: string;
  status: string;
}

interface TopUser {
  rank: number;
  id: string;
  username: string;
  currentStreak: number;
  totalProblems: number;
  totalScore: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin (you can implement proper role checking here)
    if (session?.user) {
      // For now, we'll check if the user has admin role in their roles array
      // You can implement proper admin role checking based on your requirements
      setIsAdmin(true); // Temporarily set to true for development
    }
  }, [session]);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats, activity, and top users in parallel
        const [statsResponse, activityResponse, leaderboardResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity'),
          fetch('/api/leaderboard?period=allTime&limit=3')
        ]);

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setAdminStats(stats);
        }

        if (activityResponse.ok) {
          const activity = await activityResponse.json();
          setRecentActivity(activity);
        }

        if (leaderboardResponse.ok) {
          const leaderboard = await leaderboardResponse.json();
          setTopUsers(leaderboard.leaderboard);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

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
          <h1 className="text-2xl font-bold mb-4">Please sign in to access admin panel</h1>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don&apos;t have permission to access the admin panel.</p>
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <AdminNavbar />

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
            Admin <span className="text-primary">Dashboard</span> 👨‍💼
          </h1>
          <p className="text-muted-foreground">
            Manage your AOT Academy platform and monitor system performance.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : adminStats?.totalUsers.toLocaleString() || '0'}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Active: {adminStats?.activeUsers || 0}
            </div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : adminStats?.activeUsers.toLocaleString() || '0'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last 7 days
            </div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Problems</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : adminStats?.totalProblems || '0'}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <Clock className="w-4 h-4 mr-1" />
              +{adminStats?.problemsToday || 0} today
            </div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : adminStats?.totalSubmissions.toLocaleString() || '0'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-purple-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{adminStats?.submissionsToday || 0} today
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading activity...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  {error}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === "success" ? "bg-green-500/20 text-green-600" :
                      activity.status === "warning" ? "bg-yellow-500/20 text-yellow-600" :
                      activity.status === "info" ? "bg-blue-500/20 text-blue-600" :
                      "bg-gray-500/20 text-gray-600"
                    }`}>
                      {activity.status === "success" ? <CheckCircle className="w-4 h-4" /> :
                       activity.status === "warning" ? <AlertCircle className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">@{activity.user} • {activity.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Top Users & System Status */}
          <div className="space-y-6">
            {/* Top Users */}
            <motion.div
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2 className="text-xl font-bold text-card-foreground mb-6">Top Performers</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading top users...
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-destructive">
                    {error}
                  </div>
                ) : topUsers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  topUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-orange-500 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {user.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{user.currentStreak} days</p>
                        <p className="text-xs text-muted-foreground">streak</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="text-xl font-bold text-card-foreground mb-6">System Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discord API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Judge0 API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Excellent</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h2 className="text-xl font-bold text-card-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              className="flex items-center space-x-3 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium">Manage Problems</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-3 p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Manage Users</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-3 p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span className="font-medium">View Analytics</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-3 p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-5 h-5 text-purple-500" />
              <span className="font-medium">System Settings</span>
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
    </AdminGuard>
  );
}
