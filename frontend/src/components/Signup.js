import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaRocket,
  FaStar,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post("https://web-production-54456.up.railway.app/api/auth/register", formData);
      if (res.data.message) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "❌ Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: FaRocket, color: "text-yellow-400", delay: "0s", size: "text-3xl" },
    { Icon: FaStar, color: "text-purple-400", delay: "1s", size: "text-2xl" },
    { Icon: FaChartLine, color: "text-blue-400", delay: "2s", size: "text-3xl" },
    { Icon: FaTrophy, color: "text-orange-400", delay: "0.5s", size: "text-2xl" },
    { Icon: FaStar, color: "text-pink-400", delay: "1.5s", size: "text-xl" },
    { Icon: FaRocket, color: "text-cyan-400", delay: "2.5s", size: "text-2xl" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden p-4">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
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

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => {
        const Icon = item.Icon;
        return (
          <div
            key={index}
            className={`absolute ${item.color} ${item.size} animate-float opacity-20`}
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: item.delay,
            }}
          >
            <Icon />
          </div>
        );
      })}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
                <FaRocket className="text-white text-4xl" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">
                Join Us Today!
              </h2>
              <p className="text-indigo-200 text-sm">
                Start your journey to dream placement
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-center font-semibold backdrop-blur-xl animate-slide-down ${
                  message.includes("✅")
                    ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-200"
                    : "bg-red-500/20 border border-red-400/30 text-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div className="group">
                <label className="block text-indigo-200 text-sm font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-purple-400 transition-colors">
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="block text-indigo-200 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-purple-400 transition-colors">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-indigo-200 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-purple-400 transition-colors">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Sign Up
                    <FaRocket className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-indigo-200 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-indigo-300 text-xs text-center mb-3 font-semibold">
                What you'll get:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: FaTrophy, text: "Placements" },
                  { Icon: FaChartLine, text: "Analytics" },
                  { Icon: FaStar, text: "AI Tools" },
                ].map((item, index) => {
                  const Icon = item.Icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      <Icon className="text-purple-400 mx-auto mb-1 text-xl" />
                      <p className="text-indigo-200 text-xs">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Signup;
