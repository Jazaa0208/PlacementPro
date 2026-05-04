import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaBook, 
  FaFileAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaCode, 
  FaStar,
  FaComments  // Add this for Soft Skills icon
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHover, setActiveHover] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard", color: "from-blue-400 to-blue-600" },
    { path: "/aptitude", icon: FaBook, label: "Aptitude", color: "from-purple-400 to-purple-600" },
    { path: "/coding", icon: FaCode, label: "Coding", color: "from-green-400 to-green-600" },
    { path: "/soft-skills", icon: FaComments, label: "Soft Skills", color: "from-pink-400 to-rose-600" },  // New module
    { path: "/resume", icon: FaFileAlt, label: "Resume", color: "from-orange-400 to-orange-600" },
    { path: "/profile", icon: FaUser, label: "Profile", color: "from-pink-400 to-pink-600" },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white h-screen p-6 fixed shadow-2xl border-r border-indigo-500/20 z-50">
      {/* Logo Section with Animation */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-20 animate-pulse"></div>
        <h2 className="text-4xl font-black text-center relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          PlacementPro
        </h2>
        <div className="flex items-center justify-center mt-2">
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Menu Items */}
      <ul className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
              <Link
                to={item.path}
                onMouseEnter={() => setActiveHover(item.path)}
                onMouseLeave={() => setActiveHover(null)}
                className={`flex items-center p-4 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color} shadow-lg shadow-indigo-500/50 scale-105 transform` 
                    : "hover:bg-white/10 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {/* Shimmer Effect on Hover or Active */}
                {(isActive || activeHover === item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                
                <div className={`relative z-10 flex items-center w-full ${isActive ? 'animate-bounce-subtle' : ''}`}>
                  <Icon 
                    className={`text-xl mr-4 transition-transform duration-300 ${
                      isActive ? 'animate-pulse' : 'group-hover:scale-110'
                    }`} 
                  />
                  <span className="font-semibold text-lg">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <FaStar className="text-yellow-300 animate-spin-slow" />
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 group"
        >
          <FaSignOutAlt className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-semibold text-lg">Logout</span>
        </button>
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;