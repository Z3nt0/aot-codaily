"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { 
  TrendingUp,
  Users, 
  BookOpen, 
  Trophy, 
  Activity,
  BarChart3
} from "lucide-react";

// Analytics data interfaces
interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  averageStreak: number;
  topStreak: number;
}

interface UserGrowth {
  month: string;
  users: number;
  growth: number;
}

interface ProblemStats {
  difficulty: string;
  count: number;
  submissions: number;
  acceptanceRate: number;
}

interface TopProblem {
  title: string;
  difficulty: string;
  submissions: number;
  acceptanceRate: number;
}

interface UserActivity {
  hour: string;
  active: number;
  submissions: number;
}

export default function AnalyticsPage() {
  const { status } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStats[]>([]);
  const [topProblems, setTopProblems] = useState<TopProblem[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch all analytics data in parallel
        const [overviewResponse, problemsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/problems')
        ]);

        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json();
          setOverview(overviewData);
        }

        if (problemsResponse.ok) {
          const problemsData = await problemsResponse.json();
          
          // Calculate problem stats by difficulty
          const difficultyStats = problemsData.problems.reduce((acc: Record<string, { count: number; submissions: number; acceptanceRate: number }>, problem: { difficulty: string; submissions: number; acceptanceRate: number }) => {
            const difficulty = problem.difficulty.toLowerCase();
            if (!acc[difficulty]) {
              acc[difficulty] = { count: 0, submissions: 0, acceptanceRate: 0 };
            }
            acc[difficulty].count++;
            acc[difficulty].submissions += problem.submissions;
            acc[difficulty].acceptanceRate += problem.acceptanceRate;
            return acc;
          }, {});

          const problemStatsArray = Object.entries(difficultyStats).map(([difficulty, stats]: [string, { count: number; submissions: number; acceptanceRate: number }]) => ({
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            count: stats.count,
            submissions: stats.submissions,
            acceptanceRate: Math.round((stats.acceptanceRate / stats.count) * 100) / 100
          }));

          setProblemStats(problemStatsArray);

          // Get top problems
          const topProblemsArray = problemsData.problems
            .sort((a: { submissions: number }, b: { submissions: number }) => b.submissions - a.submissions)
            .slice(0, 5)
            .map((problem: { title: string; difficulty: string; submissions: number; acceptanceRate: number }) => ({
              title: problem.title,
              difficulty: problem.difficulty,
              submissions: problem.submissions,
              acceptanceRate: problem.acceptanceRate
            }));

          setTopProblems(topProblemsArray);
        }

        // Generate mock user growth data (since we don't have historical data yet)
        const mockUserGrowth = [
          { month: "Jan", users: 50, growth: 0 },
          { month: "Feb", users: 75, growth: 50 },
          { month: "Mar", users: 120, growth: 60 },
          { month: "Apr", users: 180, growth: 50 },
          { month: "May", users: 250, growth: 39 },
          { month: "Jun", users: 320, growth: 28 }
        ];
        setUserGrowth(mockUserGrowth);

        // Generate mock user activity data
        const mockUserActivity = [
          { hour: "00:00", active: 5, submissions: 2 },
          { hour: "06:00", active: 15, submissions: 8 },
          { hour: "12:00", active: 45, submissions: 25 },
          { hour: "18:00", active: 60, submissions: 35 },
          { hour: "21:00", active: 40, submissions: 20 }
        ];
        setUserActivity(mockUserActivity);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Analytics <span className="text-primary">Dashboard</span> 📊
              </h1>
              <p className="text-muted-foreground">
                Track platform performance and user engagement metrics.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
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
                  {loading ? '...' : overview?.totalUsers.toLocaleString() || '0'}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{overview?.activeUsers || 0} active users
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
                  {loading ? '...' : overview?.activeUsers.toLocaleString() || '0'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              {overview?.averageStreak || 0} avg streak
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
                  {loading ? '...' : overview?.totalProblems || '0'}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <BarChart3 className="w-4 h-4 mr-1" />
              {overview?.totalSubmissions.toLocaleString() || '0'} submissions
            </div>
          </motion.div>

          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Streak</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : overview?.averageStreak || '0'} days
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-yellow-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Top streak: {overview?.topStreak || 0} days
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-6">User Growth</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading chart data...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              ) : userGrowth.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              ) : (
                userGrowth.map((data, index) => (
                <motion.div
                  key={data.month}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-card-foreground">{data.month}</span>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.users / 300) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{data.users}</div>
                    <div className={`text-sm ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.growth > 0 ? '+' : ''}{data.growth}%
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Problem Difficulty Distribution */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-6">Problem Difficulty</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading problem stats...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              ) : problemStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No problem data available
                </div>
              ) : (
                problemStats.map((stat, index) => (
                <motion.div
                  key={stat.difficulty}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stat.difficulty === 'Easy' ? 'text-green-600 bg-green-100' :
                      stat.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {stat.difficulty}
                    </span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          stat.difficulty === 'Easy' ? 'bg-green-500' :
                          stat.difficulty === 'Medium' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(stat.count / 156) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{stat.count}</div>
                    <div className="text-sm text-muted-foreground">{stat.acceptanceRate}% acceptance</div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Problems and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Problems */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-6">Top Problems</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading top problems...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              ) : topProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No problems available
                </div>
              ) : (
                topProblems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div>
                    <div className="font-medium text-card-foreground">{problem.title}</div>
                    <div className="text-sm text-muted-foreground">{problem.difficulty}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{problem.submissions}</div>
                    <div className="text-sm text-muted-foreground">{problem.acceptanceRate}% acceptance</div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* User Activity by Hour */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="text-xl font-bold text-card-foreground mb-6">Daily Activity Pattern</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading activity data...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              ) : userActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity data available
                </div>
              ) : (
                userActivity.map((activity, index) => (
                <motion.div
                  key={activity.hour}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-card-foreground w-12">{activity.hour}</span>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(activity.active / 250) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{activity.active} active</div>
                    <div className="text-sm text-muted-foreground">{activity.submissions} submissions</div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
