import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const API_BASE_URL = "http://127.0.0.1:5000";

const Baseline = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/baseline/questions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = response.data.questions;
      setQuestions(data);
      if (data.length === 0) setError("No questions returned from backend.");
    } catch (err) {
      const details = err.response
        ? `Server error (${err.response.status}): ${err.response.data?.error || 'Unknown'}`
        : "Network error. Backend not reachable.";
      setError(details);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.has_taken_baseline) navigate("/dashboard");
    else fetchQuestions();
  }, [navigate, fetchQuestions]);

  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = questions.map((q, index) => ({
        question_id: index,
        selected: answers[index] || null,
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/baseline/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setScore(response.data.score);
      setSuccessMsg(response.data.message);
      setShowModal(true);

      const user = JSON.parse(localStorage.getItem("user") || "null");
      localStorage.setItem("user", JSON.stringify({
        ...user, has_taken_baseline: true
      }));

      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit answers.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Star Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
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

      <Sidebar />

      {/* Main Content */}
      <div className="ml-72 p-10 relative z-10 w-full">
        <h1 className="text-4xl font-black text-white mb-7 flex items-center gap-3 animate-slide-up">
          🧠 Baseline Aptitude Test
        </h1>

        {loading && (
          <p className="text-center text-indigo-300 text-xl animate-pulse">Loading questions...</p>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 p-6 rounded-2xl text-center mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-2">⚠️ Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchQuestions}
              className="mt-4 bg-red-600 px-6 py-2 rounded-xl text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up">
            {questions.map((q, index) => (
              <div
                key={index}
                className="mb-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <h2 className="text-lg font-semibold text-indigo-200 mb-3">
                  {index + 1}. {q.question_text}
                </h2>
                <div className="space-y-3">
                  {Object.entries(q.options || {}).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all
                        ${answers[index] === key 
                          ? "bg-indigo-600/30 border-indigo-400 shadow-lg scale-[1.02]" 
                          : "bg-white/10 border border-white/20 hover:bg-white/20"}`}
                    >
                      <input
                        type="radio"
                        name={`q${index}`}
                        value={key}
                        checked={answers[index] === key}
                        onChange={() => handleAnswer(index, key)}
                        className="mr-3 h-5 w-5 text-indigo-400"
                      />
                      <span className="text-white font-medium">
                        <span className="font-bold text-indigo-300">{key}.</span> {value}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className={`w-full text-white px-6 py-4 rounded-2xl text-lg font-bold mt-6 transition-all
                ${Object.keys(answers).length === questions.length
                  ? "bg-green-600 hover:bg-green-700 shadow-xl"
                  : "bg-gray-500 cursor-not-allowed"
                }`}
            >
              Submit Test
            </button>
          </div>
        )}

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center">
              <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 Test Submitted!</h2>
              <p className="text-white text-xl mb-3">{successMsg}</p>
              <p className="text-indigo-200 text-lg font-semibold">
                Score: {score} / {questions.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
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
          animation: twinkle 3s infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Baseline;