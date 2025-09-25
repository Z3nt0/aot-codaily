"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy
} from "lucide-react";
import { validateProblemSchema, getEmptyProblemTemplate, getExampleProblemTemplate } from "@/lib/problem-schema";

// Problem interface
interface Problem {
  id: string;
  title: string;
  difficulty: string;
  scheduledDate: string | null;
  publishedAt: string | null;
  isActive: boolean;
  submissions: number;
  acceptanceRate: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProblemsManagement() {
  const { status } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isValidJson, setIsValidJson] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch problems data
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/problems');
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      const data = await response.json();
      setProblems(data.problems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Calendar navigation
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Check if date has a scheduled problem
  const getProblemForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return problems.find(p => p.scheduledDate === dateStr);
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const problem = getProblemForDate(date);
    setSelectedProblem(problem);
    
    // Clear any previous JSON input and errors
    setJsonError(null);
    setIsValidJson(false);
    
    if (problem) {
      // Load existing problem data - fetch full problem details
      fetch(`/api/problems/${problem.id}`)
        .then(response => response.json())
        .then(problemData => {
          // Format the problem data for editing
          const formattedData = {
            title: problemData.title,
            difficulty: problemData.difficulty,
            description: problemData.description,
            input_format: problemData.inputFormat || "",
            output_format: problemData.outputFormat || "",
            constraints: problemData.constraints || "",
            sample_tests: problemData.testCases?.filter((tc: any) => tc.type === 'SAMPLE').map((tc: any) => ({
              input: tc.input,
              output: tc.output
            })) || [],
            hidden_tests: problemData.testCases?.filter((tc: any) => tc.type === 'HIDDEN').map((tc: any) => ({
              input: tc.input,
              output: tc.output
            })) || []
          };
          setJsonInput(JSON.stringify(formattedData, null, 2));
          validateJson(JSON.stringify(formattedData, null, 2));
        })
        .catch(error => {
          console.error('Error fetching problem details:', error);
          // Fallback to basic data
          setJsonInput(JSON.stringify({
            title: problem.title,
            difficulty: problem.difficulty,
            description: "Problem description here...",
            input_format: "Input format description",
            output_format: "Output format description",
            constraints: "Constraints here",
            sample_tests: [
              { input: "sample input", output: "sample output" }
            ],
            hidden_tests: [
              { input: "hidden input", output: "hidden output" }
            ]
          }, null, 2));
        });
    } else {
      // Show empty JSON template
      setJsonInput(`{
  "title": "",
  "difficulty": "Easy",
  "description": "",
  "input_format": "",
  "output_format": "",
  "constraints": "",
  "sample_tests": [
    {
      "input": "",
      "output": ""
    }
  ],
  "hidden_tests": [
    {
      "input": "",
      "output": ""
    }
  ]
}`);
    }
  };

  // Validate JSON schema
  const validateJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateProblemSchema(parsed);
      
      if (validation.isValid) {
        setJsonError(null);
        setIsValidJson(true);
        return null;
      } else {
        const errorMessage = validation.errors.join(', ');
        setJsonError(errorMessage);
        setIsValidJson(false);
        return errorMessage;
      }
    } catch (error) {
      const errorMessage = `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setJsonError(errorMessage);
      setIsValidJson(false);
      return errorMessage;
    }
  };

  // Handle JSON input change
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    validateJson(value);
  };

  // Save problem
  const handleSaveProblem = async () => {
    if (!isValidJson || !selectedDate) return;
    
    try {
      const problemData = JSON.parse(jsonInput);
      console.log('Saving problem with data:', problemData);
      
      // Check if there's already a problem scheduled for this date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existingProblem = problems.find(p => p.scheduledDate === dateStr);
      
      if (existingProblem && !selectedProblem) {
        // If there's an existing problem and we're not editing it, prevent saving
        alert(`A problem is already scheduled for ${selectedDate.toLocaleDateString()}. Please select the existing problem to edit it, or choose a different date.`);
        return;
      }
      
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: problemData.title,
          description: problemData.description,
          difficulty: problemData.difficulty,
          topic: problemData.topic || 'General', // Add default topic
          inputFormat: problemData.input_format,
          outputFormat: problemData.output_format,
          constraints: problemData.constraints,
          scheduledDate: selectedDate.toISOString().split('T')[0],
          testCases: [
            ...(problemData.sample_tests || []).map((test: { input: string; output: string }) => ({
              type: 'SAMPLE',
              input: test.input,
              output: test.output,
              isHidden: false
            })),
            ...(problemData.hidden_tests || []).map((test: { input: string; output: string }) => ({
              type: 'HIDDEN',
              input: test.input,
              output: test.output,
              isHidden: true
            }))
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save problem');
      }

      const savedProblem = await response.json();
      console.log('Problem saved successfully:', savedProblem);

      // Refresh problems list
      await fetchProblems();
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        // Update selected problem if it's for the same date
        if (selectedDate) {
          const dateStr = selectedDate.toISOString().split('T')[0];
          const updatedProblem = problems.find((p: Problem) => p.scheduledDate === dateStr);
          setSelectedProblem(updatedProblem || null);
        }
      }, 100);

      // Don't clear form - keep the problem data visible
      setIsValidJson(false);
      setJsonError(null);

      // Show success message with better UX
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = '✅ Problem saved successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      console.error('Error saving problem:', error);
      alert(`Failed to save problem: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Delete problem
  const handleDeleteProblem = async () => {
    if (!selectedProblem) return;
    
    if (confirm('Are you sure you want to delete this problem?')) {
      try {
        const response = await fetch(`/api/problems/${selectedProblem.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete problem');
        }

        // Refresh problems list
        const fetchProblems = async () => {
          const response = await fetch('/api/problems');
      const data = await response.json();
          setProblems(data.problems);
        };
        await fetchProblems();

        alert('Problem deleted successfully!');
        setSelectedProblem(null);
        setJsonInput("");
      } catch (error) {
        console.error('Error deleting problem:', error);
        alert('Failed to delete problem');
      }
    }
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

  const calendarDays = getCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
                  Problem <span className="text-primary">Management</span> 📚
          </h1>
          <p className="text-muted-foreground">
                  Schedule and manage daily programming problems with calendar view.
          </p>
        </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
            <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === "calendar" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
            </button>
            <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === "list" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    List
            </button>
          </div>
        </div>
            </div>
          </motion.div>

          {viewMode === "calendar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar View */}
              <motion.div
                className="lg:col-span-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchProblems()}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      title="Refresh problems"
                    >
                      <motion.div
                        animate={{ rotate: loading ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        🔄
                      </motion.div>
                    </button>
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Today
                    </button>
                      <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                      <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                </div>
              ))}
        </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const problem = getProblemForDate(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isCurrentMonthDay = isCurrentMonth(date);
                    const isTodayDate = isToday(date);

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        className={`p-3 h-16 rounded-lg transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : problem
                            ? "bg-green-500 text-white hover:bg-green-600 border-2 border-green-600"
                            : isTodayDate
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : isCurrentMonthDay
                            ? "hover:bg-muted/50"
                            : "text-muted-foreground/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                      >
                        <div className="text-sm font-medium">{date.getDate()}</div>
                        {problem && (
                          <div className="text-xs truncate" title={problem.title}>
                            <div className="flex items-center justify-center">
                              <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                              {problem.title}
                            </div>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Calendar Legend */}
                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Has Problem</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </motion.div>

              {/* Problem Editor */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* Warning for existing problem */}
                {selectedDate && getProblemForDate(selectedDate) && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Editing existing problem for {selectedDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {selectedDate ? (
                <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {selectedProblem ? "Edit Problem" : "Create Problem"}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {selectedProblem && (
                          <button
                            onClick={handleDeleteProblem}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                </div>
              </div>

              <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Date: {selectedDate.toLocaleDateString()}
                      </div>
                      {selectedProblem && (
                        <div className="text-sm text-muted-foreground">
                          Current: {selectedProblem.title}
                        </div>
                      )}
              </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-card-foreground">
                          Problem JSON Schema
                        </label>
                        <div className="flex items-center space-x-2">
                <button
                            onClick={() => setJsonInput(getEmptyProblemTemplate())}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                            <FileText className="w-3 h-3" />
                            <span>Empty Template</span>
                </button>
                <button
                            onClick={() => setJsonInput(getExampleProblemTemplate())}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                            <Copy className="w-3 h-3" />
                            <span>Example</span>
                </button>
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          value={jsonInput}
                          onChange={(e) => handleJsonChange(e.target.value)}
                          className="w-full h-96 p-3 border border-border rounded-lg bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter problem JSON..."
                        />
                        {jsonError && (
                          <div className="absolute top-2 right-2 flex items-center space-x-1 text-destructive text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>Invalid</span>
                          </div>
                        )}
                        {isValidJson && !jsonError && (
                          <div className="absolute top-2 right-2 flex items-center space-x-1 text-green-600 text-xs">
                            <CheckCircle className="w-4 h-4" />
                            <span>Valid</span>
                          </div>
                        )}
                      </div>
                      {jsonError && (
                        <div className="mt-2 text-sm text-destructive">
                          {jsonError}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                <button
                        onClick={handleSaveProblem}
                        disabled={!isValidJson}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          isValidJson
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Problem</span>
                </button>
              </div>
            </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a date to create or edit a problem</p>
          </div>
        )}
              </motion.div>
            </div>
          ) : (
            /* List View */
            <motion.div
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-card-foreground">Scheduled Problems</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-card-foreground">Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-card-foreground">Problem</th>
                      <th className="px-6 py-4 text-left font-semibold text-card-foreground">Difficulty</th>
                      <th className="px-6 py-4 text-left font-semibold text-card-foreground">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-card-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Loading problems...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-destructive">
                          {error}
                        </td>
                      </tr>
                    ) : problems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No problems found
                        </td>
                      </tr>
                    ) : (
                      problems.map((problem, index) => (
                        <motion.tr
                          key={problem.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {problem.scheduledDate 
                                  ? new Date(problem.scheduledDate).toLocaleDateString()
                                  : 'Not scheduled'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-card-foreground">{problem.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              problem.difficulty === 'EASY' ? 'text-green-600 bg-green-100' :
                              problem.difficulty === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                              'text-red-600 bg-red-100'
                            }`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              problem.publishedAt ? 'text-green-600 bg-green-100' :
                              problem.scheduledDate ? 'text-blue-600 bg-blue-100' :
                              'text-yellow-600 bg-yellow-100'
                            }`}>
                              {problem.publishedAt ? 'Published' :
                               problem.scheduledDate ? 'Scheduled' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
      </div>
            </motion.div>
          )}
        </main>
    </div>
    </AdminGuard>
  );
}