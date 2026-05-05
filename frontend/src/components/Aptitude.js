// src/components/Aptitude.js

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaRocket, FaTrophy, FaFire, FaBook,
  FaVideo, FaDumbbell, FaClipboardCheck, FaCheckCircle,
  FaPlayCircle, FaLock, FaExternalLinkAlt, FaSync, FaRedo
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import Sidebar from "./Sidebar";

// === CONSTANTS (MATCH BACKEND) ===
const EXPECTED_PRACTICE_QUESTION_COUNT = 15;
const EXPECTED_TEST_QUESTION_COUNT = 10;
const MIN_PASS_SCORE = 8;

const Aptitude = () => {
  const location = useLocation();

  // ----- STATE -----
  const [roadmap, setRoadmap] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [testAnswers, setTestAnswers] = useState({});
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState("");
  const [testScore, setTestScore] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("roadmap");

  // Unlock logic (previous topic must be completed)
  const isUnlocked = (index) =>
    index === 0 || progress[roadmap[index - 1]]?.completed;

  const getTopicStatus = (topic) => {
    if (progress[topic]?.completed) return "completed";
    return isUnlocked(roadmap.indexOf(topic)) ? "active" : "locked";
  };

  const overallProgress = useMemo(() => {
    const completed = Object.values(progress).filter((p) => p.completed).length;
    return roadmap.length
      ? Math.round((completed / roadmap.length) * 100)
      : 0;
  }, [progress, roadmap]);

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (overallProgress / 100) * circumference;

  // Load roadmap
  const fetchRoadmap = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await API.get("/aptitude/roadmap");
      setRoadmap(res.data.topics);
      setProgress(res.data.progress);
    } catch (err) {
      setError("Failed to load roadmap. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  // Selecting topic
  const selectTopic = async (topic, index) => {
    if (!isUnlocked(index)) return;

    setSelectedTopic(topic);
    setCurrentView("video");
    setError("");

    const topicProgress = progress[topic] || {};
    setTestScore(topicProgress.test_score || null);

    setIsLoading(true);

    try {
      const res = await API.get(`/aptitude/topic/${topic}/video`);
      setVideoUrl(res.data.video_url || "");

      if (topicProgress.completed) {
        setCurrentView("score");
      } else if (topicProgress.completed_practice) {
        await fetchTestQuestions(topic);
        setCurrentView("test");
      }
    } catch (err) {
      setError("Failed to load topic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start Practice
  const startPractice = async () => {
    setCurrentView("practice");
    setIsLoading(true);
    setError("");

    try {
      const res = await API.get(`/aptitude/topic/${selectedTopic}/practice`);
      setPracticeQuestions(res.data.questions);
      setCurrentQuestionIndex(0);
      setPracticeAnswers({});
      setShowSolution(false);
    } catch (err) {
      // ✅ FIX: Show friendly error with retry option, go back to video view
      const msg = err?.response?.data?.error || "Failed to load practice questions. Please try again.";
      setError(msg);
      setCurrentView("video");
    } finally {
      setIsLoading(false);
    }
  };

  // Practice logic
  const handlePracticeSubmit = (selected) => {
    const q = practiceQuestions[currentQuestionIndex];
    if (practiceAnswers[currentQuestionIndex]) return;

    setPracticeAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selected,
    }));

    if (selected === q.correct_answer) {
      if (currentQuestionIndex === practiceQuestions.length - 1) {
        completePractice();
      } else {
        setCurrentQuestionIndex((i) => i + 1);
        setShowSolution(false);
      }
    } else {
      setSolution(q.solution || "No solution available.");
      setShowSolution(true);
    }
  };

  const completePractice = async () => {
    setIsLoading(true);
    setError("");
    try {
      await API.post(`/aptitude/topic/${selectedTopic}/complete-practice`, {});

      setProgress((prev) => ({
        ...prev,
        [selectedTopic]: { ...prev[selectedTopic], completed_practice: true },
      }));

      await fetchTestQuestions(selectedTopic);
      setCurrentView("test");
    } catch (err) {
      setError("Failed to complete practice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Test questions
  const fetchTestQuestions = async (topic) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await API.get(`/aptitude/topic/${topic}/test`);
      setTestQuestions(res.data.questions);
      setTestAnswers({});
      setCurrentQuestionIndex(0);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load test questions. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Test
  const handleTestSubmit = async () => {
    if (Object.keys(testAnswers).length !== testQuestions.length) {
      alert("Please answer all questions.");
      return;
    }

    setIsLoading(true);
    setError("");

    const answers = Object.entries(testAnswers).map(([i, sel]) => ({
      question_index: +i,
      selected: sel,
    }));

    try {
      const res = await API.post(
        `/aptitude/topic/${selectedTopic}/submit-test`,
        {
          answers,
          questions: testQuestions,
        }
      );

      setTestScore(res.data.score);

      if (res.data.passed) {
        alert("Passed! Next topic unlocked.");
        await fetchRoadmap();
        setCurrentView("roadmap");
      } else {
        setCurrentView("score");
      }
    } catch (err) {
      setError("Failed to submit test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // UI Helpers
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-400 text-2xl" />;
      case "active":
        return <FaFire className="text-orange-400 text-2xl animate-pulse" />;
      default:
        return <FaLock className="text-gray-400 text-2xl" />;
    }
  };

  const getOptionClasses = (optionChar) => {
    const isSelected = practiceAnswers[currentQuestionIndex] === optionChar;
    const isCorrect = practiceQuestions[currentQuestionIndex]?.correct_answer === optionChar;

    if (!showSolution) {
      return isSelected
        ? "bg-indigo-600 text-white border-indigo-500"
        : "bg-white/5 text-indigo-200";
    }

    if (isSelected && !isCorrect) return "bg-red-600 text-white line-through";
    if (isCorrect) return "bg-green-600 text-white";
    return "bg-white/5 text-indigo-200 opacity-50";
  };

  const getTestOptionClasses = (optionChar, qIndex) => {
    const isSelected = testAnswers[qIndex] === optionChar;
    return isSelected
      ? "bg-blue-600 text-white"
      : "bg-white/5 text-indigo-200";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative">

      {/* Sidebar */}
      <Sidebar activePath={location.pathname} />

      <div className="ml-72 flex-1 p-8">

        {/* HEADER */}
        <div className="bg-white/10 rounded-3xl p-8 mb-8 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black text-white flex items-center gap-3">
              <FaRocket className="text-yellow-400" /> Aptitude Mastery
            </h1>

            {/* Progress Ring */}
            <div className="relative">
              <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                <circle
                  cx="70" cy="70" r="60"
                  stroke="url(#g)" strokeWidth="12" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="g">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{overallProgress}%</div>
                  <div className="text-xs text-indigo-300">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIX: Error banner with dismiss + retry button */}
        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 border border-red-500/50 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <FaSync /> {error}
            </span>
            <div className="flex gap-2">
              {currentView === "video" && (
                <button
                  onClick={startPractice}
                  className="px-4 py-1 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setError("")}
                className="px-4 py-1 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* ROADMAP VIEW */}
        {currentView === "roadmap" && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <h2 className="text-3xl text-white font-bold flex items-center gap-3 mb-6">
              <FaBook /> Learning Roadmap
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {roadmap.map((topic, i) => {
                const status = getTopicStatus(topic);
                const unlocked = isUnlocked(i);

                return (
                  <div
                    key={topic}
                    onClick={() => unlocked && selectTopic(topic, i)}
                    className={`p-6 rounded-2xl border-2 backdrop-blur-xl transition-all 
                      ${unlocked ? "cursor-pointer hover:scale-105" : "opacity-40 cursor-not-allowed"} 
                      ${status === "completed"
                        ? "bg-green-700/20 border-green-400/50"
                        : status === "active"
                        ? "bg-orange-700/20 border-orange-400/50"
                        : "bg-gray-700/20 border-gray-500/50"}`}
                  >
                    <div className="flex justify-between mb-4">
                      {getStatusIcon(status)}
                      {status === "active" && (
                        <FaPlayCircle className="text-orange-400 animate-pulse" />
                      )}
                    </div>

                    <h3 className="text-white font-bold text-lg">{topic}</h3>

                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs 
                      ${status === "completed"
                        ? "bg-green-500/30 text-green-200"
                        : status === "active"
                        ? "bg-orange-500/30 text-orange-200"
                        : "bg-gray-500/30 text-gray-300"}`}
                    >
                      {status === "completed" ? "Done" : status === "active" ? "Start" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIDEO VIEW */}
        {currentView === "video" && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <h2 className="text-3xl font-bold text-white flex gap-3 mb-6">
              <FaVideo className="text-red-400" /> Topic: {selectedTopic}
            </h2>

            {videoUrl ? (
              <div className="text-center py-8 border border-indigo-500/50 rounded-xl bg-white/5 mb-6">
                <p className="text-indigo-200 mb-4 text-xl">Step 1: Learn Concepts</p>
                <button
                  onClick={() => window.open(videoUrl, "_blank")}
                  className="px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition flex items-center gap-2 mx-auto"
                >
                  <FaExternalLinkAlt /> Watch on YouTube
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-400">Loading video...</p>
            )}

            <div className="text-center">
              <p className="text-indigo-200 mb-4 text-xl">Step 2: Start Practice</p>
              <button
                onClick={startPractice}
                disabled={!videoUrl || isLoading}
                className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
              >
                <FaDumbbell className="inline mr-2" /> Start Practice ({EXPECTED_PRACTICE_QUESTION_COUNT} Qs)
              </button>
            </div>
          </div>
        )}

        {/* PRACTICE VIEW */}
        {currentView === "practice" && practiceQuestions.length > 0 && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <h2 className="text-3xl font-bold text-white flex gap-3 mb-6">
              <FaDumbbell className="text-pink-400" /> Practice: {selectedTopic}
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="text-indigo-200 text-sm mb-2">
                Question {currentQuestionIndex + 1} of {practiceQuestions.length}
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / practiceQuestions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question */}
            {practiceQuestions[currentQuestionIndex] && (
              <div className="bg-white/5 p-6 rounded-xl border border-white/20">
                <p className="text-white text-xl mb-4">
                  {currentQuestionIndex + 1}.{" "}
                  {practiceQuestions[currentQuestionIndex].question_text}
                </p>

                <div className="space-y-3">
                  {practiceQuestions[currentQuestionIndex].options.map((opt, idx) => {
                    const char = opt.charAt(0);
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePracticeSubmit(char)}
                        disabled={showSolution || !!practiceAnswers[currentQuestionIndex]}
                        className={`w-full text-left p-4 rounded-lg border-2 ${getOptionClasses(char)}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solution */}
            {showSolution && (
              <div className="mt-6 bg-red-800/30 border border-red-500/50 p-5 rounded-xl">
                <h3 className="text-xl text-red-300 flex gap-2 mb-3">
                  <FaClipboardCheck /> Solution
                </h3>
                <p className="text-red-100 whitespace-pre-wrap">{solution}</p>
                <button
                  onClick={() => {
                    if (currentQuestionIndex < practiceQuestions.length - 1) {
                      setCurrentQuestionIndex((i) => i + 1);
                    } else {
                      completePractice();
                    }
                    setShowSolution(false);
                  }}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full"
                >
                  {currentQuestionIndex < practiceQuestions.length - 1
                    ? "Next Question"
                    : "Finish Practice"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TEST VIEW */}
        {currentView === "test" && testQuestions.length > 0 && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <h2 className="text-3xl font-bold text-white flex gap-3 mb-6">
              <FaTrophy className="text-yellow-400" /> Test: {selectedTopic}
            </h2>

            <div className="space-y-8">
              {testQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white/5 p-6 rounded-xl border border-white/20">
                  <p className="text-white text-xl mb-4">
                    {qIndex + 1}. {q.question_text}
                  </p>

                  <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                      const char = opt.charAt(0);
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            setTestAnswers((prev) => ({ ...prev, [qIndex]: char }))
                          }
                          className={`w-full text-left p-4 border-2 rounded-lg ${getTestOptionClasses(char, qIndex)}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleTestSubmit}
                disabled={Object.keys(testAnswers).length !== testQuestions.length || isLoading}
                className="px-8 py-3 bg-yellow-500 text-white font-bold rounded-full hover:scale-105 transition disabled:opacity-50"
              >
                <FaClipboardCheck className="inline mr-2" />
                Submit Test ({Object.keys(testAnswers).length}/{testQuestions.length})
              </button>
            </div>
          </div>
        )}

        {/* SCORE VIEW */}
        {currentView === "score" && testScore !== null && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30 text-center">
            <h2 className="text-4xl font-bold text-white flex justify-center gap-3 mb-4">
              {testScore >= MIN_PASS_SCORE ? (
                <FaTrophy className="text-yellow-400" />
              ) : (
                <FaRedo className="text-red-400" />
              )}
              Results for {selectedTopic}
            </h2>

            <p className="text-indigo-200 text-2xl mb-6">
              Score:{" "}
              <span className="text-5xl font-black text-white">
                {testScore}/{testQuestions.length || EXPECTED_TEST_QUESTION_COUNT}
              </span>
            </p>

            <p className={`text-3xl font-bold mb-8 ${testScore >= MIN_PASS_SCORE ? "text-green-400" : "text-red-400"}`}>
              {testScore >= MIN_PASS_SCORE
                ? "Great job! Topic mastered."
                : "Don't worry — try again!"}
            </p>

            <div className="flex justify-center gap-4">
              {testScore < MIN_PASS_SCORE && (
                <button
                  onClick={() => fetchTestQuestions(selectedTopic)}
                  className="px-8 py-3 bg-yellow-600 text-white rounded-full font-bold hover:scale-105 transition"
                >
                  <FaRedo className="inline mr-2" /> Retry Test
                </button>
              )}
              <button
                onClick={() => setCurrentView("roadmap")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:scale-105 transition"
              >
                Back to Roadmap
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Aptitude;
