"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { 
  Search, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Trophy,
  Activity
} from "lucide-react";

// User interface
interface User {
  id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  email: string;
  joinedAt: string;
  lastSeen: string | null;
  currentStreak: number;
  longestStreak: number;
  totalProblems: number;
  totalScore: number;
  submissions: number;
  roles: string | null;
}

export default function UsersManagement() {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filterStatus === "inactive" && (!user.lastSeen || new Date(user.lastSeen) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
    const matchesRole = filterRole === "all" || (user.roles && user.roles.includes(filterRole));
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const getStatusColor = (user: User) => {
    if (!user || !user.lastSeen) {
      return "text-yellow-600 bg-yellow-100";
    }
    const isActive = new Date(user.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return isActive ? "text-green-600 bg-green-100" : "text-yellow-600 bg-yellow-100";
  };

  const getRoleColor = (roles: string | null) => {
    if (!roles) return "text-gray-600 bg-gray-100";
    try {
      const roleArray = JSON.parse(roles);
      if (Array.isArray(roleArray)) {
        if (roleArray.includes("admin")) return "text-purple-600 bg-purple-100";
        if (roleArray.includes("moderator")) return "text-blue-600 bg-blue-100";
      }
      return "text-green-600 bg-green-100";
    } catch (error) {
      return "text-gray-600 bg-gray-100";
    }
  };

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
            User <span className="text-primary">Management</span> 👥
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions for AOT Academy.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="student">Student</option>
            </select>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <button className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm">
                  Ban Users
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Streak</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Problems</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Score</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Last Seen</th>
                  <th className="px-6 py-4 text-left font-semibold text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                              alt={user.username}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{user.username}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                        {user.lastSeen && new Date(user.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.roles)}`}>
                        {(() => {
                          if (!user.roles) return 'User';
                          try {
                            const roleArray = JSON.parse(user.roles);
                            if (Array.isArray(roleArray)) {
                              if (roleArray.includes('admin')) return 'Admin';
                              if (roleArray.includes('moderator')) return 'Moderator';
                            }
                            return 'User';
                          } catch (error) {
                            return 'User';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium">{user.currentStreak}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span>{user.totalProblems}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">{user.totalScore.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowUserDetails(user.id)}
                        >
                          <UserCheck className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Mail className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <UserX className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Details Modal */}
        {showUserDetails && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowUserDetails(null)}
          >
            <motion.div
              className="bg-background rounded-xl border border-border p-6 max-w-2xl w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const user = users.find(u => u.id === showUserDetails);
                if (!user) return null;
                
                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">User Details</h2>
                      <button
                        onClick={() => setShowUserDetails(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-card-foreground mb-3">Profile Information</h3>
                        <div className="space-y-2">
                          <div><span className="text-muted-foreground">Username:</span> @{user.username}</div>
                          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
                          <div><span className="text-muted-foreground">Discord ID:</span> {user.id}</div>
                          <div><span className="text-muted-foreground">Joined:</span> {new Date(user.joinedAt).toLocaleDateString()}</div>
                          <div><span className="text-muted-foreground">Last Seen:</span> {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-card-foreground mb-3">Performance Stats</h3>
                        <div className="space-y-2">
                          <div><span className="text-muted-foreground">Current Streak:</span> {user.currentStreak} days</div>
                          <div><span className="text-muted-foreground">Longest Streak:</span> {user.longestStreak} days</div>
                          <div><span className="text-muted-foreground">Problems Solved:</span> {user.totalProblems}</div>
                          <div><span className="text-muted-foreground">Total Score:</span> {user.totalScore.toLocaleString()}</div>
                          <div><span className="text-muted-foreground">Submissions:</span> {user.submissions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Pagination */}
        <motion.div
          className="flex items-center justify-between mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary text-primary-foreground rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              2
            </button>
            <button className="px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              Next
            </button>
          </div>
        </motion.div>
      </main>
    </div>
    </AdminGuard>
  );
}
