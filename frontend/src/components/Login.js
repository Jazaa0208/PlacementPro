import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { FaEnvelope, FaLock, FaRocket } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passRef = useRef(null);

  // clear any stored data + reset DOM values
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    if (emailRef.current) emailRef.current.value = "";
    if (passRef.current) passRef.current.value = "";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate(response.data.user.has_taken_baseline ? "/dashboard" : "/baseline");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden p-4">
      {/* Star background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
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

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
                <FaRocket className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Welcome Back!</h1>
              <p className="text-indigo-200 text-sm">Sign in to continue your journey</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 rounded-xl text-center font-semibold bg-red-500/20 border border-red-400/30 text-red-200 animate-shake">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              autoComplete={"nope-" + Math.random().toString(36).slice(2)}
              className="space-y-5"
            >
              {/* hidden dummy inputs */}
              <input type="text" name="fakeusernameremembered" style={{ display: "none" }} />
              <input type="password" name="fakepasswordremembered" style={{ display: "none" }} />

              {/* Email */}
              <div className="group">
                <label className="block text-indigo-200 text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                    <FaEnvelope />
                  </div>
                  <input
                    ref={emailRef}
                    type="email"
                    name={"e_" + Math.random().toString(36).slice(2)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    autoComplete="off"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-indigo-200 text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                    <FaLock />
                  </div>
                  <input
                    ref={passRef}
                    type="password"
                    name={"p_" + Math.random().toString(36).slice(2)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    readOnly
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    Login
                    <FaRocket className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-indigo-200 text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* tagline */}
        <div className="text-center mt-6 animate-fade-in">
          <p className="text-indigo-300 text-sm font-medium">🚀 Your dream placement awaits</p>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%,100% { opacity:0.2; transform:scale(1);}
          50% { opacity:1; transform:scale(1.3);}
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(30px);}
          to { opacity:1; transform:translateY(0);}
        }
        @keyframes bounce-slow {
          0%,100%{transform:translateY(0);}
          50%{transform:translateY(-10px);}
        }
        @keyframes shake {
          0%,100%{transform:translateX(0);}
          25%{transform:translateX(-5px);}
          75%{transform:translateX(5px);}
        }
        .animate-twinkle{animation:twinkle 3s ease-in-out infinite;}
        .animate-slide-up{animation:slide-up 0.6s ease-out forwards;}
        .animate-bounce-slow{animation:bounce-slow 2s ease-in-out infinite;}
        .animate-shake{animation:shake 0.4s ease-in-out;}
      `}</style>
    </div>
  );
};

export default Login;