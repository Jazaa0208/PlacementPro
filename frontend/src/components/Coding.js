// Coding.js - Enhanced with Real-time Progress Tracking
import React, { useState, useEffect } from "react";
import {
  FaCode, FaRocket, FaTrophy, FaFire, FaStar, FaBook,
  FaPlay, FaPaperPlane, FaPlayCircle, FaLock, FaCheckCircle,
  FaList, FaUsers, FaComments, FaClock, FaMemory,
  FaExclamationTriangle, FaChevronRight, FaChevronDown,
  FaSearch, FaFilter, FaSort, FaLightbulb, FaGraduationCap,
  FaUserFriends, FaChartLine, FaAward, FaTimes, FaCog,
  FaBuilding, FaRupeeSign, FaCalendarAlt, FaCheck
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Coding = () => {
  const location = useLocation();

  const [roadmap, setRoadmap] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Enhanced states
  const [language, setLanguage] = useState("python");
  const [testCases, setTestCases] = useState([]);
  const [activeTab, setActiveTab] = useState("problem");
  const [timeTaken, setTimeTaken] = useState(null);
  const [memoryUsed, setMemoryUsed] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [compilationError, setCompilationError] = useState("");
  const [runtimeError, setRuntimeError] = useState("");
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [validation, setValidation] = useState(null);
  const [userProgress, setUserProgress] = useState({
    problems_solved: 0,
    total_problems: 0,
    accuracy: 0,
    global_rank: 0,
    companies_target: 0,
    total_companies: 0,
    current_streak: 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    easy_progress: 0,
    medium_progress: 0,
    hard_progress: 0,
    total_easy: 0,
    total_medium: 0,
    total_hard: 0
  });
  const [companies, setCompanies] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanies, setShowCompanies] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: "All",
    topic: "All",
    search: "",
    sortBy: "id"
  });

  // Language options without demand tags
  const languages = [
    { value: "python", label: "Python", icon: "🐍", extension: "py" },
    { value: "javascript", label: "JavaScript", icon: "🟨", extension: "js" },
    { value: "java", label: "Java", icon: "☕", extension: "java" },
    { value: "cpp", label: "C++", icon: "⚡", extension: "cpp" },
    { value: "c", label: "C", icon: "🔧", extension: "c" }
  ];

  // ----------------------- API CALLS -----------------------
  const API_BASE = "http://localhost:5000/api/coding";

  const fetchProblems = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE}/problems?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setProblems(data.problems);
        setFilteredProblems(data.problems);
        return data.filters;
      }
    } catch (err) {
      console.error("Error fetching problems:", err);
      setError("Failed to load problems");
    }
  };

  const fetchProblemDetail = async (problemId) => {
    try {
      const response = await fetch(`${API_BASE}/problems/${problemId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedProblem(data.problem);
        fetchHints(problemId);
        fetchTemplate(problemId, language);
      }
    } catch (err) {
      console.error("Error fetching problem details:", err);
    }
  };

  const fetchTemplate = async (problemId, lang) => {
    try {
      const response = await fetch(`${API_BASE}/template/${problemId}/${lang}`);
      const data = await response.json();
      
      if (data.success) {
        setCode(data.template);
      }
    } catch (err) {
      console.error("Error fetching template:", err);
    }
  };

  const fetchHints = async (problemId) => {
    try {
      const response = await fetch(`${API_BASE}/hints/${problemId}`);
      const data = await response.json();
      
      if (data.success) {
        setHints(data.hints);
      }
    } catch (err) {
      console.error("Error fetching hints:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/progress`);
      const data = await response.json();
      
      if (data.success) {
        setUserProgress(data.progress);
        
        // Update progress percentage
        if (data.progress.problems_solved && data.progress.total_problems) {
          const calculatedProgress = Math.round(
            (data.progress.problems_solved / data.progress.total_problems) * 100
          );
          setProgress(calculatedProgress);
        }
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const fetchSubmissions = async (problemId = null) => {
    try {
      const query = problemId ? `?problem_id=${problemId}` : '';
      const response = await fetch(`${API_BASE}/submissions${query}`);
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/companies`);
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchCompanyDetails = async (companyName) => {
    try {
      const response = await fetch(`${API_BASE}/company/${companyName}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedCompany(data.company);
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  // ----------------------- INITIALIZATION -----------------------
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const availableFilters = await fetchProblems();
        await fetchProgress();
        await fetchSubmissions();
        await fetchCompanies();
        
        if (problems.length > 0 && !selectedProblem) {
          await fetchProblemDetail(problems[0].id);
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load coding data.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  // Filter problems when filters change
  useEffect(() => {
    const filterProblems = () => {
      let filtered = [...problems];
      
      if (filters.difficulty !== "All") {
        filtered = filtered.filter(p => p.difficulty === filters.difficulty);
      }
      
      if (filters.topic !== "All") {
        filtered = filtered.filter(p => p.topics.includes(filters.topic));
      }
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      // Sort problems
      switch (filters.sortBy) {
        case "difficulty":
          const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
          filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
          break;
        case "acceptance":
          filtered.sort((a, b) => {
            const aAcc = parseFloat(a.acceptance);
            const bAcc = parseFloat(b.acceptance);
            return bAcc - aAcc;
          });
          break;
        default:
          filtered.sort((a, b) => a.id - b.id);
      }
      
      setFilteredProblems(filtered);
    };
    
    filterProblems();
  }, [filters, problems]);

  // Update progress when userProgress changes
  useEffect(() => {
    if (userProgress.problems_solved && userProgress.total_problems) {
      const calculatedProgress = Math.round(
        (userProgress.problems_solved / userProgress.total_problems) * 100
      );
      setProgress(calculatedProgress);
    }
  }, [userProgress]);

  // ----------------------- ENHANCED HANDLERS -----------------------
  const handleRunCode = async () => {
    if (!selectedProblem) return;
    
    setIsLoading(true);
    resetOutputs();
    
    try {
      const response = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problem_id: selectedProblem.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOutput(data.output);
        setConsoleOutput(data.console_output);
        setTimeTaken(data.execution_time);
        setMemoryUsed(data.memory_used);
        setValidation(data.validation);
        
        if (data.error) {
          setRuntimeError(data.error);
        }
        
        // Set complexity based on problem
        if (selectedProblem.timeComplexity && selectedProblem.spaceComplexity) {
          setTimeComplexity(selectedProblem.timeComplexity);
          setSpaceComplexity(selectedProblem.spaceComplexity);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to run code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    
    setIsLoading(true);
    resetOutputs();
    
    try {
      const response = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problem_id: selectedProblem.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScore(data.score);
        setFeedback(data.feedback);
        setTimeTaken(data.execution_time);
        setMemoryUsed(data.memory_used);
        setOutput(data.output);
        setValidation({
          results: data.test_results,
          passed_tests: data.passed_tests,
          total_tests: data.total_tests,
          score: data.score
        });
        
        // Set complexity based on problem
        if (selectedProblem.timeComplexity && selectedProblem.spaceComplexity) {
          setTimeComplexity(selectedProblem.timeComplexity);
          setSpaceComplexity(selectedProblem.spaceComplexity);
        }
        
        // Refresh progress and submissions
        await fetchProgress();
        await fetchSubmissions(selectedProblem.id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to submit code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProblemSelect = async (problem) => {
    setSelectedProblem(problem);
    await fetchProblemDetail(problem.id);
    resetOutputs();
    setShowHints(false);
    fetchSubmissions(problem.id);
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    if (selectedProblem) {
      await fetchTemplate(selectedProblem.id, lang);
    }
    resetOutputs();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCompanySelect = async (companyName) => {
    await fetchCompanyDetails(companyName);
  };

  const resetOutputs = () => {
    setOutput("");
    setFeedback(null);
    setScore(null);
    setCompilationError("");
    setRuntimeError("");
    setConsoleOutput("");
    setTimeComplexity("");
    setSpaceComplexity("");
    setValidation(null);
  };

  // ----------------------- UI HELPERS -----------------------
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 border-green-500/30";
      case "Medium": return "bg-yellow-500/20 border-yellow-500/30";
      case "Hard": return "bg-red-500/20 border-red-500/30";
      default: return "bg-gray-500/20 border-gray-500/30";
    }
  };

  // ----------------------- RENDER -----------------------
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <Sidebar activePath={location.pathname} />

      <div className="ml-72 flex-1 p-8 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-3">
                <FaCode className="text-blue-400 animate-bounce" />
                AI Coding Trainer
              </h1>
              <p className="text-indigo-200 text-xl">Master algorithms, ace your interviews</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCompanies(!showCompanies)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-3"
              >
                <FaBuilding />
                {showCompanies ? "Hide Companies" : "Show Companies"}
              </button>
              <div className="relative">
                <svg width="140" height="140" className="transform -rotate-90">
                  <circle cx="70" cy="70" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: 377,
                      strokeDashoffset: 377 - (377 * progress) / 100,
                      transition: "stroke-dashoffset 0.5s ease",
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{progress}%</div>
                    <div className="text-xs text-indigo-300">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Section */}
        {showCompanies && (
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 mb-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaBuilding className="text-purple-400" />
              Companies Visiting Satara College
            </h3>
            
            {selectedCompany ? (
              <div className="space-y-6">
                {/* Company Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-3xl font-bold text-white">{selectedCompany.name}</h4>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-green-400 font-semibold flex items-center gap-2">
                        <FaRupeeSign />
                        Package: {selectedCompany.package}
                      </span>
                      <span className="text-blue-400 font-semibold flex items-center gap-2">
                        <FaCalendarAlt />
                        {selectedCompany.visit_frequency}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Requirements */}
                <div>
                  <h5 className="text-white font-semibold mb-3">Requirements:</h5>
                  <div className="space-y-2">
                    {selectedCompany.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-300">
                        <FaCheck className="text-green-400" />
                        {req}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problems Asked */}
                <div>
                  <h5 className="text-white font-semibold mb-3">Frequently Asked Problems:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCompany.problems.map((problem, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 cursor-pointer transition-colors"
                        onClick={() => {
                          const prob = problems.find(p => p.title === problem.title);
                          if (prob) handleProblemSelect(prob);
                          setSelectedCompany(null);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{problem.title}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyBg(problem.difficulty)} ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">{problem.acceptance} acceptance</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(companies).map(([key, company]) => (
                  <div
                    key={key}
                    onClick={() => handleCompanySelect(key)}
                    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all hover:border-purple-500/50"
                  >
                    <div className="text-center">
                      <FaBuilding className="text-3xl text-purple-400 mx-auto mb-3" />
                      <h4 className="text-white font-bold text-lg mb-2">{company.name}</h4>
                      <p className="text-green-400 font-semibold text-sm mb-2">{company.package}</p>
                      <p className="text-gray-400 text-xs">{company.visit_frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: FaTrophy, 
              label: "Problems Solved", 
              value: `${userProgress.problems_solved || 0}/${userProgress.total_problems || 15}`,
              color: "from-yellow-400 to-orange-500",
              desc: "Total Progress" 
            },
            { 
              icon: FaChartLine, 
              label: "Accuracy", 
              value: `${userProgress.accuracy || 0}%`,
              color: "from-green-400 to-emerald-500", 
              desc: "Overall Score" 
            },
            { 
              icon: FaAward, 
              label: "Rank", 
              value: `#${userProgress.global_rank || '0'}`,
              color: "from-blue-400 to-indigo-500", 
              desc: "Global Ranking" 
            },
            { 
              icon: FaUserFriends, 
              label: "Companies", 
              value: `${userProgress.companies_target || 0}/${userProgress.total_companies || 8}`,
              color: "from-purple-400 to-pink-500", 
              desc: "Target Companies" 
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-indigo-300 text-xs mt-1">{stat.desc}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Problems & Filters */}
          <div className="xl:col-span-1 space-y-6">
            {/* Filters */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FaFilter className="text-blue-400" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="text-white text-sm mb-2 block">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-4">
                <label className="text-white text-sm mb-2 block">Difficulty</label>
                <select
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <label className="text-white text-sm mb-2 block">Sort By</label>
                <select
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="id">Default</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="acceptance">Acceptance Rate</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-center text-gray-400 text-sm">
                {filteredProblems.length} problems found
              </div>
            </div>

            {/* Problems List */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl max-h-[600px] overflow-hidden flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FaList className="text-blue-400" />
                Problems ({filteredProblems.length})
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredProblems.map((problem, index) => (
                  <div
                    key={problem.id}
                    onClick={() => handleProblemSelect(problem)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedProblem?.id === problem.id
                        ? "bg-blue-500/20 border-2 border-blue-400/50"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                          problem.difficulty === "Easy" ? "bg-green-500" :
                          problem.difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                        }`}>
                          {problem.id}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{problem.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{problem.acceptance} acceptance</span>
                          </div>
                        </div>
                      </div>
                      <FaChevronRight className={`text-gray-400 transition-transform ${
                        selectedProblem?.id === problem.id ? "rotate-90" : ""
                      }`} />
                    </div>
                    
                    {/* Topics */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {problem.topics.slice(0, 2).map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Problem & Editor */}
          <div className="xl:col-span-3 space-y-6">
            {/* Problem Description */}
            {selectedProblem && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedProblem.title}</h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyBg(selectedProblem.difficulty)} ${getDifficultyColor(selectedProblem.difficulty)}`}>
                        {selectedProblem.difficulty}
                      </span>
                      <span className="text-gray-400 text-sm">Acceptance: {selectedProblem.acceptance}</span>
                      <span className="text-gray-400 text-sm">Submissions: {selectedProblem.submissions}</span>
                      <span className="text-blue-400 text-sm">Frequency: {selectedProblem.frequency}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <FaLightbulb />
                    {showHints ? "Hide Hints" : "Show Hints"}
                  </button>
                </div>

                {/* Hints Section */}
                {showHints && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                    <h4 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                      <FaLightbulb className="text-yellow-400" />
                      Step-by-Step Hints
                    </h4>
                    <div className="space-y-2">
                      {hints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span className="text-yellow-200 text-sm">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Problem Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <FaBook className="text-blue-400" />
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{selectedProblem.description}</p>
                  </div>

                  {/* Examples */}
                  {selectedProblem.examples && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Examples</h3>
                      <div className="space-y-3">
                        {selectedProblem.examples.map((example, index) => (
                          <div key={index} className="bg-slate-800/50 rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-400 text-sm font-medium">Input:</span>
                                <pre className="text-green-300 mt-1 font-mono text-sm">{example.input}</pre>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm font-medium">Output:</span>
                                <pre className="text-green-300 mt-1 font-mono text-sm">{example.output}</pre>
                              </div>
                            </div>
                            {example.explanation && (
                              <div className="mt-3">
                                <span className="text-gray-400 text-sm font-medium">Explanation:</span>
                                <p className="text-gray-300 text-sm mt-1">{example.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {selectedProblem.constraints && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Constraints</h3>
                      <ul className="text-gray-300 space-y-1">
                        {selectedProblem.constraints.map((constraint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="font-mono text-sm">{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Companies */}
                  {selectedProblem.companies && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProblem.companies.map((company, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code Editor Section */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
              {/* Language Selector */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Code Editor</h3>
                  <div className="flex gap-2 flex-wrap">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => handleLanguageChange(lang.value)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                          language === lang.value
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        <span className="mr-2">{lang.icon}</span>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm bg-slate-800/50 px-3 py-1 rounded-lg">
                  solution.{languages.find(l => l.value === language)?.extension}
                </div>
              </div>

              {/* Code Editor */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 mb-6">
                <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-slate-400 text-sm">solution.{languages.find(l => l.value === language)?.extension}</span>
                  </div>
                  <div className="text-slate-400 text-sm">
                    Language: {languages.find(l => l.value === language)?.label}
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-80 bg-slate-900 text-white p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                  spellCheck="false"
                  placeholder={`Write your ${language} solution here...`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleRunCode}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <FaPlay />
                  {isLoading ? "Running..." : "Run Code"}
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <FaPaperPlane />
                  {isLoading ? "Submitting..." : "Submit Solution"}
                </button>
              </div>

              {/* Enhanced Output Section */}
              {(output || compilationError || runtimeError || consoleOutput) && (
                <div className="space-y-4">
                  {/* Console Output */}
                  {(consoleOutput || compilationError || runtimeError) && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold flex items-center gap-2">
                          <FaPlayCircle className="text-green-400" />
                          Console Output
                        </h4>
                        <button
                          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                          className="text-gray-400 hover:text-white"
                        >
                          {isConsoleOpen ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      </div>
                      
                      {isConsoleOpen && (
                        <div className="space-y-4">
                          {compilationError && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExclamationTriangle className="text-red-400" />
                                <span className="text-red-400 font-semibold">Compilation Error</span>
                              </div>
                              <pre className="text-red-300 font-mono text-sm whitespace-pre-wrap">{compilationError}</pre>
                            </div>
                          )}
                          
                          {runtimeError && (
                            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FaExclamationTriangle className="text-orange-400" />
                                <span className="text-orange-400 font-semibold">Runtime Error</span>
                              </div>
                              <pre className="text-orange-300 font-mono text-sm whitespace-pre-wrap">{runtimeError}</pre>
                            </div>
                          )}
                          
                          {consoleOutput && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <pre className="text-green-300 font-mono text-sm whitespace-pre-wrap">{consoleOutput}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test Results */}
                  {output && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-green-400" />
                        Test Results
                      </h4>
                      
                      {/* Show detailed test results */}
                      {validation?.results && (
                        <div className="mb-4">
                          <div className="grid grid-cols-1 gap-3">
                            {validation.results.map((result, index) => (
                              <div key={index} className={`p-4 rounded-xl border ${
                                result.passed 
                                  ? 'bg-green-500/10 border-green-500/30' 
                                  : 'bg-red-500/10 border-red-500/30'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    {result.passed ? (
                                      <FaCheck className="text-green-400" />
                                    ) : (
                                      <FaTimes className="text-red-400" />
                                    )}
                                    <span className="text-white font-medium">
                                      Test Case {index + 1}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    result.passed 
                                      ? 'bg-green-500/20 text-green-300' 
                                      : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    {result.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                
                                {!result.passed && (
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-gray-400">Expected: </span>
                                      <span className="text-green-300 font-mono">{result.expected}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Got: </span>
                                      <span className="text-red-300 font-mono">{result.actual}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <div className={`text-2xl font-bold ${
                          validation?.passed_tests === validation?.total_tests 
                            ? 'text-green-400' 
                            : 'text-yellow-400'
                        }`}>
                          {validation?.passed_tests || 0}/{validation?.total_tests || 0} Tests Passed
                        </div>
                        {validation?.score !== undefined && (
                          <div className="text-gray-400 mt-1">
                            Score: {validation.score}%
                          </div>
                        )}
                      </div>
                      
                      {/* Performance Metrics */}
                      {(timeTaken || memoryUsed) && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <FaClock className="text-blue-300" />
                              <div className="text-blue-300 text-sm font-semibold">Time</div>
                            </div>
                            <div className="text-white font-bold text-xl">{timeTaken}ms</div>
                          </div>
                          <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <FaMemory className="text-green-300" />
                              <div className="text-green-300 text-sm font-semibold">Memory</div>
                            </div>
                            <div className="text-white font-bold text-xl">{memoryUsed}MB</div>
                          </div>
                          <div className="bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <FaChartLine className="text-purple-300" />
                              <div className="text-purple-300 text-sm font-semibold">Complexity</div>
                            </div>
                            <div className="text-white font-bold text-sm">
                              {timeComplexity} / {spaceComplexity}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Feedback */}
                  {score !== null && (
                    <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
                      score >= 80 
                        ? "bg-green-500/20 border-green-500/50" 
                        : score >= 60
                        ? "bg-yellow-500/20 border-yellow-500/50"
                        : "bg-red-500/20 border-red-500/50"
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold text-xl flex items-center gap-2">
                          <FaTrophy className={
                            score >= 80 ? "text-yellow-400" : 
                            score >= 60 ? "text-yellow-300" : "text-red-400"
                          } />
                          Score: {score}/100
                        </h4>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          score >= 80 
                            ? "bg-green-500/30 text-green-200" 
                            : score >= 60
                            ? "bg-yellow-500/30 text-yellow-200"
                            : "bg-red-500/30 text-red-200"
                        }`}>
                          {score >= 80 ? "Interview Ready" : 
                           score >= 60 ? "Needs Practice" : "Poor Performance"}
                        </div>
                      </div>
                      <pre className="text-white text-sm whitespace-pre-wrap leading-relaxed">{feedback}</pre>
                    </div>
                  )}z
                </div>
              )}
            </div>

            {/* Submissions History */}
            {submissions.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <FaList className="text-blue-400" />
                  Submission History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-left">Date</th>
                        <th className="pb-3 text-left">Language</th>
                        <th className="pb-3 text-left">Status</th>
                        <th className="pb-3 text-left">Time</th>
                        <th className="pb-3 text-left">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-gray-800/50">
                          <td className="py-3">{submission.date}</td>
                          <td className="py-3">{submission.language}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              submission.status === "Accepted" 
                                ? "bg-green-500/20 text-green-300" 
                                : "bg-red-500/20 text-red-300"
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-3">{submission.time}</td>
                          <td className="py-3 font-semibold">{submission.score}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Twinkle Animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Coding;