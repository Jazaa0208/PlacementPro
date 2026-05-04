import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaCode,
  FaChartLine,
  FaBriefcase,
  FaTrophy,
  FaRocket,
  FaStar,
  FaFire,
} from "react-icons/fa";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({ placements: 0, companies: 0, avgPackage: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  // Stats animation function
  const animateStats = (targetStats) => {
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    let current = { placements: 0, companies: 0, avgPackage: 0 };
    
    const timer = setInterval(() => {
      let done = true;
      setStats((prev) => {
        const updated = { ...prev };
        if (current.placements < targetStats.placements) {
          current.placements += targetStats.placements / steps;
          updated.placements = Math.min(Math.round(current.placements), targetStats.placements);
          done = false;
        }
        if (current.companies < targetStats.companies) {
          current.companies += targetStats.companies / steps;
          updated.companies = Math.min(Math.round(current.companies), targetStats.companies);
          done = false;
        }
        if (current.avgPackage < targetStats.avgPackage) {
          current.avgPackage += targetStats.avgPackage / steps;
          updated.avgPackage = Number(Math.min(current.avgPackage.toFixed(1), targetStats.avgPackage));
          done = false;
        }
        return updated;
      });
      if (done) clearInterval(timer);
    }, interval);
  };

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/dashboard/data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDashboardData(data);
        setUser(data.user);
        
        // Use REAL data from backend for animation
        animateStats({
          placements: data.stats.placements || 0,
          companies: data.stats.companies || 0,
          avgPackage: data.stats.avg_package || 0
        });
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Fallback to demo data if API fails
      setDashboardData({
        user: { name: "Demo User", email: "demo@example.com", has_taken_baseline: true },
        progress: { completed_topics: 3, total_topics: 10, completion_percentage: 30 },
        stats: { problems_solved: 0, current_streak: 0, avg_score: 0, placements: 250, companies: 85, avg_package: 12.5 }
      });
      animateStats({
        placements: 250,
        companies: 85,
        avgPackage: 12.5
      });
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser && !storedUser.has_taken_baseline) {
      navigate("/baseline");
    } else {
      setUser(storedUser);
      fetchDashboardData(); // Fetch real data from backend
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Use dashboardData for progress information
  const statCards = [
    {
      icon: FaTrophy,
      label: "Placements",
      value: stats.placements,
      unit: "+",
      color: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-500/10 border-yellow-400/30",
    },
    {
      icon: FaBriefcase,
      label: "Companies",
      value: stats.companies,
      unit: "+",
      color: "from-blue-400 to-indigo-500",
      bg: "bg-blue-500/10 border-blue-400/30",
    },
    {
      icon: FaChartLine,
      label: "Avg Package",
      value: stats.avgPackage.toFixed(1),
      unit: " LPA",
      color: "from-emerald-400 to-green-500",
      bg: "bg-emerald-500/10 border-emerald-400/30",
    },
  ];

  // Additional stats from dashboardData
  const progressStats = [
    {
      icon: FaStar,
      label: "Problems Solved",
      value: dashboardData?.stats?.problems_solved || 0,
      unit: "",
      color: "from-purple-400 to-pink-500",
      bg: "bg-purple-500/10 border-purple-400/30",
    },
    {
      icon: FaFire,
      label: "Current Streak",
      value: dashboardData?.stats?.current_streak || 0,
      unit: " Days",
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-500/10 border-orange-400/30",
    },
    {
      icon: FaChartLine,
      label: "Avg Score",
      value: dashboardData?.stats?.avg_score || 0,
      unit: "%",
      color: "from-blue-400 to-cyan-500",
      bg: "bg-blue-500/10 border-blue-400/30",
    },
  ];

  const features = [
    {
      icon: FaChartLine,
      title: "Placement Analytics",
      desc: "Deep insights into trends, top recruiters, and success patterns.",
      color: "from-blue-500 to-indigo-600",
      path: "/analytics"
    },
    {
      icon: FaBriefcase,
      title: "Company Portal",
      desc: "Real-time campus drives, eligibility, and deadlines.",
      color: "from-purple-500 to-pink-600",
      path: "/companies"
    },
    {
      icon: FaRocket,
      title: "Skill Development",
      desc: "Personalized aptitude, coding & interview prep paths.",
      color: "from-green-500 to-emerald-600",
      path: "/aptitude"
    },
    {
      icon: FaFileAlt,
      title: "Resume Builder",
      desc: "AI-powered ATS optimization with industry insights.",
      color: "from-orange-500 to-red-600",
      path: "/resume"
    },
    {
      icon: FaFire,
      title: "Mock Interviews",
      desc: "Practice with AI and get instant performance feedback.",
      color: "from-pink-500 to-rose-600",
      path: "/interviews"
    },
    {
      icon: FaStar,
      title: "Performance Tracking",
      desc: "Detailed analytics and personalized recommendations.",
      color: "from-cyan-500 to-blue-600",
      path: "/progress"
    },
  ];

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Shared Sidebar */}
      <Sidebar activePath={location.pathname} />

      {/* Main Content */}
      <div className="ml-72 flex-1 p-8 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-3">
                <FaRocket className="text-yellow-400 animate-bounce" />
                Welcome Back, {user?.name || "User"}!
              </h1>
              <p className="text-indigo-200 text-xl">
                {dashboardData ? 
                  `Your progress: ${dashboardData.progress.completion_percentage}% complete • ${dashboardData.progress.completed_topics}/${dashboardData.progress.total_topics} topics mastered` 
                  : "Your journey to dream placement begins here"
                }
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`animate-slide-up bg-white/10 backdrop-blur-xl ${stat.bg} border rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-white">
                      {stat.value}
                      <span className="text-2xl text-indigo-300">{stat.unit}</span>
                    </p>
                  </div>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {progressStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{ animationDelay: `${index * 0.2}s` }}
                className={`animate-slide-up bg-white/10 backdrop-blur-xl ${stat.bg} border rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-white">
                      {stat.value}
                      <span className="text-xl text-indigo-300">{stat.unit}</span>
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="text-white text-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onClick={() => handleFeatureClick(feature.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="animate-slide-up bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;