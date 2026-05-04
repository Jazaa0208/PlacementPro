// src/components/SoftSkills.js

import React, { useState, useMemo, useEffect } from "react";
import {
  FaBrain, FaTheaterMasks, FaStar, FaLock, FaCheckCircle,
  FaArrowRight, FaRedo, FaTrophy, FaComments, FaHandshake,
  FaLightbulb, FaFire, FaBolt, FaUserTie, FaChartLine, FaHeart,
  FaTimes, FaLevelUpAlt
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// ─── SKILL CATEGORIES ───────────────────────────────────────────────────────
const SKILLS = [
  {
    id: "communication",
    label: "Communication",
    icon: FaComments,
    color: "from-cyan-500 to-blue-600",
    border: "border-cyan-400/40",
    bg: "bg-cyan-500/10",
    description: "Master clarity, tone, and active listening",
    xpReward: 150,
  },
  {
    id: "interview",
    label: "Interview Presence",
    icon: FaUserTie,
    color: "from-violet-500 to-purple-700",
    border: "border-violet-400/40",
    bg: "bg-violet-500/10",
    description: "Own the room with confidence and structure",
    xpReward: 200,
  },
  {
    id: "teamwork",
    label: "Teamwork",
    icon: FaHandshake,
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-400/40",
    bg: "bg-emerald-500/10",
    description: "Navigate collaboration and conflict resolution",
    xpReward: 150,
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: FaChartLine,
    color: "from-orange-500 to-amber-600",
    border: "border-orange-400/40",
    bg: "bg-orange-500/10",
    description: "Inspire, delegate, and lead under pressure",
    xpReward: 200,
  },
  {
    id: "empathy",
    label: "Emotional Intelligence",
    icon: FaHeart,
    color: "from-rose-500 to-pink-600",
    border: "border-rose-400/40",
    bg: "bg-rose-500/10",
    description: "Read the room, manage emotions, build trust",
    xpReward: 175,
  },
  {
    id: "critical",
    label: "Critical Thinking",
    icon: FaLightbulb,
    color: "from-yellow-400 to-orange-500",
    border: "border-yellow-400/40",
    bg: "bg-yellow-500/10",
    description: "Solve ambiguous problems with structured reasoning",
    xpReward: 175,
  },
];

// ─── SCENARIO BANK (Complete with all scenarios) ────────────────────────────
const SCENARIOS = {
  communication: [
    {
      id: "comm_1",
      title: "The Vague Email",
      difficulty: "Beginner",
      setup: "Your manager sends you an email: 'Fix the thing we discussed. ASAP.' You have no idea what 'the thing' is. Your team is watching how you handle this.",
      avatar: "👨‍💼",
      avatarName: "Manager Sharma",
      rounds: [
        {
          prompt: "Manager Sharma expects an immediate response. What do you do?",
          choices: [
            { text: "Reply: 'On it!' and figure it out later.", score: 1, feedback: "Risky! You're agreeing without understanding. This causes errors and erodes trust.", tag: "❌ Avoidance" },
            { text: "Reply: 'Could you clarify which issue you're referring to? I want to prioritize correctly.'", score: 5, feedback: "Excellent! Asking for clarity shows ownership and professionalism.", tag: "✅ Assertive Clarity" },
            { text: "Ignore the email and wait for them to follow up.", score: 0, feedback: "This signals disengagement. Never leave a manager's message unread.", tag: "❌ Passive" },
            { text: "Forward it to your teammate and ask them to handle it.", score: 2, feedback: "Delegating ambiguity doesn't resolve it. Clarify first.", tag: "⚠️ Deflection" },
          ],
        },
        {
          prompt: "Manager clarifies it's the onboarding bug. You know a fix exists but it's untested. Deadline is 2 hours. What do you say?",
          choices: [
            { text: "'It'll be done in 2 hours.' (deploy the untested fix)", score: 1, feedback: "Over-promising destroys credibility.", tag: "❌ False Promise" },
            { text: "'I have a potential fix. I need 30 minutes to test it safely before deploying. Is that okay?'", score: 5, feedback: "Perfect. You're honest about constraints and propose a solution.", tag: "✅ Transparent + Solution-Oriented" },
            { text: "'This can't be done in 2 hours. It's too risky.'", score: 2, feedback: "You're not wrong, but saying 'can't' without alternatives makes you seem like a blocker.", tag: "⚠️ Negative Framing" },
            { text: "Say nothing and just deploy whatever you have.", score: 0, feedback: "Silent action without communication is a red flag.", tag: "❌ No Communication" },
          ],
        },
      ],
    },
  ],
  interview: [
    {
      id: "int_1",
      title: "Tell Me About Yourself",
      difficulty: "Beginner",
      setup: "You're in a campus placement interview at a top tech company. The interviewer leans back and says: 'So... tell me about yourself.' The room is silent.",
      avatar: "👩‍💻",
      avatarName: "Interviewer Priya",
      rounds: [
        {
          prompt: "How do you open your response?",
          choices: [
            { text: "Start with your school name, marks, and hometown in detail.", score: 1, feedback: "This is forgettable. Interviewers remember stories and impact.", tag: "❌ Resume Recitation" },
            { text: "Start with: 'I'm someone who loves solving problems that sit at the intersection of tech and people...'", score: 5, feedback: "Strong opener! You led with identity and passion.", tag: "✅ Identity-Led Hook" },
            { text: "Ask: 'What specifically would you like to know?'", score: 2, feedback: "Shows awareness but feels evasive.", tag: "⚠️ Deflection" },
            { text: "Say: 'I'm a final year CSE student.' and pause.", score: 1, feedback: "Too thin. You've given them nothing to grab onto.", tag: "❌ Underprepared" },
          ],
        },
        {
          prompt: "Interviewer asks: 'What's your biggest weakness?' You feel nervous.",
          choices: [
            { text: "'I work too hard. I'm a perfectionist.'", score: 0, feedback: "Overused and distrusted answer.", tag: "❌ Cliché" },
            { text: "'I used to struggle with public speaking, but I joined my college's debate club and now I actively take sessions to practice.'", score: 5, feedback: "Authentic, specific, and shows growth mindset.", tag: "✅ Growth Story" },
            { text: "'I don't have any major weaknesses right now.'", score: 0, feedback: "Reads as dishonest or unaware.", tag: "❌ No Self-Awareness" },
            { text: "'Sometimes I over-explain things to make sure the other person understands everything thoroughly.'", score: 4, feedback: "Not bad! Could be stronger with a specific example.", tag: "✅ Decent + Improvable" },
          ],
        },
      ],
    },
  ],
  teamwork: [
    {
      id: "team_1",
      title: "The Credit Thief",
      difficulty: "Intermediate",
      setup: "During a team presentation, your colleague Rohan presents YOUR idea as his own to the project lead. You're sitting right there.",
      avatar: "🧑‍🤝‍🧑",
      avatarName: "Colleague Rohan",
      rounds: [
        {
          prompt: "In the moment, what do you do?",
          choices: [
            { text: "Say nothing. You'll bring it up after the meeting.", score: 3, feedback: "Avoiding public confrontation is smart, but staying silent lets the false narrative solidify.", tag: "⚠️ Passive" },
            { text: "Interject: 'Building on what Rohan mentioned, I originally proposed this approach last week...'", score: 5, feedback: "Perfect. You reclaimed ownership professionally.", tag: "✅ Assertive Reclaim" },
            { text: "Call Rohan out directly: 'That was actually my idea.'", score: 2, feedback: "Direct but risky. Can create tension.", tag: "⚠️ Confrontational" },
            { text: "Send the project lead a message immediately during the meeting.", score: 3, feedback: "Shows quick thinking, but feels sneaky.", tag: "⚠️ Indirect" },
          ],
        },
        {
          prompt: "After the meeting, how do you handle it with Rohan?",
          choices: [
            { text: "Ghost Rohan and escalate directly to the manager.", score: 1, feedback: "Escalating without direct conversation is seen as political.", tag: "❌ Skip Due Process" },
            { text: "Say: 'Hey, I noticed you presented my idea without crediting me. I'd appreciate if we avoid that going forward.'", score: 5, feedback: "Clean, direct, non-aggressive. Mature conflict resolution.", tag: "✅ Constructive Direct" },
            { text: "Bring it up loudly in the next team meeting.", score: 0, feedback: "Public humiliation damages team culture.", tag: "❌ Escalate Publicly" },
            { text: "Laugh it off and decide it doesn't matter.", score: 1, feedback: "Suppressing it lets the pattern continue.", tag: "❌ Self-Dismissal" },
          ],
        },
      ],
    },
  ],
  leadership: [
    {
      id: "lead_1",
      title: "The Deadline Crisis",
      difficulty: "Intermediate",
      setup: "You're leading a 4-person college project. It's 10 PM, submission at 9 AM. Two teammates are done. One teammate has gone silent.",
      avatar: "👥",
      avatarName: "Teammate Ananya",
      rounds: [
        {
          prompt: "What's your first move as the team leader?",
          choices: [
            { text: "Submit without Ananya's part. Her problem.", score: 0, feedback: "Leaders don't abandon teammates.", tag: "❌ Abandonment" },
            { text: "Call Ananya directly and ask calmly: 'Hey, are you okay? What's going on?'", score: 5, feedback: "Excellent. You lead with empathy.", tag: "✅ Empathy First" },
            { text: "Complain to the professor that Ananya didn't contribute.", score: 1, feedback: "Premature escalation.", tag: "❌ Escalate Too Fast" },
            { text: "Do Ananya's part yourself silently.", score: 3, feedback: "Gets it done, but enables bad behavior.", tag: "⚠️ Martyr Move" },
          ],
        },
        {
          prompt: "Ananya is having a panic attack. She has 40% done. It's 11 PM. What's your plan?",
          choices: [
            { text: "Tell her to relax and just push through.", score: 1, feedback: "Invalidating someone damages trust.", tag: "❌ Dismissive" },
            { text: "Divide her remaining work between the team, reassure her, and get it done together.", score: 5, feedback: "This is real leadership.", tag: "✅ Adaptive Leadership" },
            { text: "Ask her to send what she has and you'll complete the rest.", score: 4, feedback: "Good compromise.", tag: "✅ Functional" },
            { text: "Tell her it's fine and ask for an extension you don't have.", score: 1, feedback: "False reassurance.", tag: "❌ False Promise" },
          ],
        },
      ],
    },
  ],
  empathy: [
    {
      id: "emp_1",
      title: "The Struggling Teammate",
      difficulty: "Beginner",
      setup: "Your close friend and teammate Dev has been quiet in meetings lately, missing deadlines, and seems disengaged.",
      avatar: "😔",
      avatarName: "Friend Dev",
      rounds: [
        {
          prompt: "How do you approach Dev?",
          choices: [
            { text: "Ask him directly in a group chat: 'Are you OK?'", score: 1, feedback: "Public setting makes this awkward.", tag: "❌ Wrong Context" },
            { text: "Privately say: 'Hey, I've noticed you seem a bit low lately. I'm here if you need anything.'", score: 5, feedback: "Empathy done right.", tag: "✅ Safe Space" },
            { text: "Tell the manager before talking to him.", score: 0, feedback: "Skips human connection.", tag: "❌ Betray First" },
            { text: "Don't say anything. It's not your business.", score: 1, feedback: "Showing you noticed costs nothing.", tag: "⚠️ Disengaged" },
          ],
        },
        {
          prompt: "Dev opens up about a difficult family situation. He asks you not to tell anyone.",
          choices: [
            { text: "Tell him everything is fine and the team doesn't need to know.", score: 3, feedback: "Respects his wish but doesn't help practically.", tag: "⚠️ Incomplete" },
            { text: "Say: 'Thank you for trusting me. Can I mention to the team that you're dealing with something personal - without details?'", score: 5, feedback: "Masterful. Honored trust AND proposed solution.", tag: "✅ Trust + Action" },
            { text: "Tell the team anyway because they deserve to know.", score: 0, feedback: "You just broke his trust.", tag: "❌ Betrayal" },
            { text: "Tell him to report it to HR.", score: 2, feedback: "Feels clinical for a personal matter.", tag: "⚠️ Premature" },
          ],
        },
      ],
    },
  ],
  critical: [
    {
      id: "crit_1",
      title: "The Sudden Pivot",
      difficulty: "Advanced",
      setup: "You're 3 weeks into a 4-week project. The client suddenly wants to change the core feature.",
      avatar: "🤔",
      avatarName: "Client",
      rounds: [
        {
          prompt: "Your immediate reaction to the pivot request?",
          choices: [
            { text: "Agree immediately to keep the client happy.", score: 1, feedback: "Saying yes without analysis sets your team up for failure.", tag: "❌ Reactive Yes" },
            { text: "Say: 'We need to assess the impact. Can I get back to you in 2 hours?'", score: 5, feedback: "Excellent. You bought time to think.", tag: "✅ Structured Response" },
            { text: "Refuse immediately: 'We're too far in to change anything.'", score: 1, feedback: "Hard no without analysis is just as bad.", tag: "❌ Rigid Refusal" },
            { text: "Ask your team to vote on it.", score: 3, feedback: "Involves team but outsources leadership.", tag: "⚠️ Delegation Without Leadership" },
          ],
        },
        {
          prompt: "After analysis, the pivot is possible but requires dropping one feature.",
          choices: [
            { text: "Drop the feature with least dev time.", score: 3, feedback: "Time invested ≠ user value.", tag: "⚠️ Efficiency Framing" },
            { text: "Drop feature with lowest user engagement and explain why to client.", score: 5, feedback: "Data-driven decision with transparency.", tag: "✅ Evidence-Based" },
            { text: "Let the client decide which feature to drop.", score: 2, feedback: "Clients hire you for expertise.", tag: "⚠️ Expertise Abdication" },
            { text: "Don't drop anything. Work nights to fit everything.", score: 1, feedback: "Unsustainable heroics.", tag: "❌ No Trade-Off Thinking" },
          ],
        },
      ],
    },
  ],
};

const RANKS = [
  { min: 0, label: "Rookie", color: "text-gray-400", icon: "🌱" },
  { min: 100, label: "Communicator", color: "text-blue-400", icon: "🗣️" },
  { min: 300, label: "Influencer", color: "text-cyan-400", icon: "⭐" },
  { min: 600, label: "Negotiator", color: "text-purple-400", icon: "🤝" },
  { min: 1000, label: "Leader", color: "text-amber-400", icon: "👑" },
  { min: 1500, label: "Visionary", color: "text-pink-400", icon: "🔮" },
];

const getRank = (xp) => [...RANKS].reverse().find((r) => xp >= r.min) || RANKS[0];

export default function SoftSkills() {
  const location = useLocation();

  // Load saved progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem("softSkillsProgress");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return { xp: data.xp || 0, completed: data.completed || {} };
      } catch (e) {
        return { xp: 0, completed: {} };
      }
    }
    return { xp: 0, completed: {} };
  };

  const [view, setView] = useState("hub");
  const [activeSkill, setActiveSkill] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [round, setRound] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [xp, setXp] = useState(() => loadProgress().xp);
  const [completedScenarios, setCompletedScenarios] = useState(() => loadProgress().completed);
  const [pulseSkill, setPulseSkill] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("softSkillsProgress", JSON.stringify({
      xp: xp,
      completed: completedScenarios
    }));
  }, [xp, completedScenarios]);

  const rank = getRank(xp);
  const nextRank = RANKS[RANKS.findIndex((r) => r.label === rank.label) + 1];
  const xpToNext = nextRank ? nextRank.min - xp : null;
  const completedCount = Object.keys(completedScenarios).length;
  const totalScenarios = Object.values(SCENARIOS).flat().length;

  const scenarioList = useMemo(() => (activeSkill ? SCENARIOS[activeSkill.id] || [] : []), [activeSkill]);

  const openSkill = (skill) => {
    setPulseSkill(skill.id);
    setTimeout(() => {
      setActiveSkill(skill);
      setView("skill");
      setPulseSkill(null);
    }, 200);
  };

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setRound(0);
    setRoundScores([]);
    setChosen(null);
    setRevealed(false);
    setView("scenario");
  };

  const handleChoice = (choice) => {
    if (revealed) return;
    setChosen(choice);
    setRevealed(true);
    setRoundScores((prev) => [...prev, choice.score]);
  };

  const nextRound = () => {
    const totalRounds = activeScenario.rounds.length;
    if (round + 1 < totalRounds) {
      setRound((r) => r + 1);
      setChosen(null);
      setRevealed(false);
    } else {
      const totalScore = [...roundScores, chosen?.score || 0].reduce((a, b) => a + b, 0);
      const maxScore = activeScenario.rounds.length * 5;
      const earned = Math.round((totalScore / maxScore) * (activeSkill.xpReward || 150));
      
      setLastEarnedXP(earned);
      setXp((prev) => {
        const newXP = prev + earned;
        const oldRank = getRank(prev);
        const newRank = getRank(newXP);
        if (oldRank.label !== newRank.label) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }
        return newXP;
      });
      
      setCompletedScenarios((prev) => ({
        ...prev,
        [activeScenario.id]: { score: totalScore, maxScore, earned, timestamp: Date.now() }
      }));
      setView("debrief");
    }
  };

  const resetScenario = () => {
    startScenario(activeScenario);
  };

  const currentRound = activeScenario?.rounds[round];
  const allRoundScores = view === "debrief" ? roundScores : [...roundScores, chosen?.score || 0];
  const debriefTotal = allRoundScores.reduce((a, b) => a + b, 0);
  const debriefMax = activeScenario ? activeScenario.rounds.length * 5 : 1;
  const debriefPercent = Math.round((debriefTotal / debriefMax) * 100);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative">
      <Sidebar activePath={location.pathname} />

      <div className="ml-72 flex-1 p-8">
        {/* Level Up Notification */}
        {showLevelUp && (
          <div className="fixed top-24 right-8 z-50 animate-bounce bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-2xl border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <FaLevelUpAlt className="text-3xl text-white" />
              <div>
                <div className="text-white font-bold text-lg">Level Up!</div>
                <div className="text-yellow-100">You're now a {rank.label} {rank.icon}</div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 rounded-3xl p-8 mb-8 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-white flex items-center gap-3 mb-1">
              <FaTheaterMasks className="text-pink-400" /> Soft Skills Arena
            </h1>
            <p className="text-indigo-300 text-lg mt-1">
              Learn by living the scenario — not by reading about it
            </p>
          </div>

          {/* XP Block */}
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-2">
              <FaBolt className="text-yellow-400 text-xl" />
              <span className="text-3xl font-black text-white">{xp} XP</span>
            </div>
            <div className={`text-lg font-bold ${rank.color} flex items-center gap-2`}>
              <span>{rank.icon}</span> {rank.label}
            </div>
            {xpToNext && xpToNext > 0 && (
              <>
                <div className="text-indigo-400 text-sm mt-1">
                  {xpToNext} XP to {nextRank.label}
                </div>
                <div className="w-48 bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-yellow-400 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${((xp - (nextRank.min - xpToNext)) / xpToNext) * 100}%`
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: FaFire, label: "Scenarios Completed", value: `${completedCount}/${totalScenarios}`, color: "text-orange-400" },
            { icon: FaStar, label: "Skills Available", value: SKILLS.length, color: "text-yellow-400" },
            { icon: FaTrophy, label: "Current Rank", value: rank.label, color: rank.color, iconEmoji: rank.icon },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-2xl border border-indigo-500/30 p-5 flex items-center gap-4">
              <stat.icon className={`text-3xl ${stat.color}`} />
              <div>
                <div className="text-white font-bold text-xl">{stat.value}</div>
                <div className="text-indigo-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View: Hub - Skill Cards */}
        {view === "hub" && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <FaBrain className="text-pink-400" /> Choose Your Skill Arena
            </h2>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                const scenariosForSkill = SCENARIOS[skill.id] || [];
                const doneForSkill = scenariosForSkill.filter((s) => completedScenarios[s.id]).length;
                const isMastered = doneForSkill === scenariosForSkill.length && scenariosForSkill.length > 0;

                return (
                  <div
                    key={skill.id}
                    onClick={() => openSkill(skill)}
                    className={`relative cursor-pointer rounded-2xl border-2 ${skill.border} ${skill.bg} p-6 
                      hover:scale-105 transition-all duration-200 overflow-hidden group
                      ${pulseSkill === skill.id ? "scale-95 opacity-80" : ""}
                      ${isMastered ? "ring-2 ring-green-400/50" : ""}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${skill.color} shadow-lg`}>
                        <Icon className="text-white text-2xl" />
                      </div>
                      {isMastered && <FaCheckCircle className="text-green-400 text-xl" />}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{skill.label}</h3>
                    <p className="text-indigo-300 text-sm mb-4">{skill.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-400">{doneForSkill}/{scenariosForSkill.length} scenarios</span>
                      <span className="text-xs text-yellow-400 font-bold">+{skill.xpReward} XP</span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3">
                      <div className={`bg-gradient-to-r ${skill.color} h-1.5 rounded-full transition-all`} style={{ width: scenariosForSkill.length ? `${(doneForSkill / scenariosForSkill.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View: Skill - Scenario List */}
        {view === "skill" && activeSkill && (
          <div className="bg-white/10 rounded-3xl p-8 border border-indigo-500/30">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setView("hub")} className="px-4 py-2 rounded-xl bg-white/10 text-indigo-300 hover:bg-white/20 text-sm transition flex items-center gap-2">
                <FaTimes /> Back to Arena
              </button>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${activeSkill.color}`}>
                <activeSkill.icon className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{activeSkill.label}</h2>
                <p className="text-indigo-300 text-sm">{activeSkill.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              {scenarioList.length === 0 && (
                <div className="text-center py-16 text-indigo-400">
                  <FaLock className="text-4xl mx-auto mb-3 opacity-40" />
                  <p>More scenarios coming soon...</p>
                </div>
              )}
              {scenarioList.map((scenario) => {
                const done = completedScenarios[scenario.id];
                return (
                  <div key={scenario.id} onClick={() => startScenario(scenario)} className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.01] ${done ? "bg-green-700/10 border-green-400/30" : "bg-white/5 border-indigo-500/30 hover:border-indigo-400/60"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{scenario.avatar || "🎭"}</span>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-white font-bold text-lg">{scenario.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${scenario.difficulty === "Beginner" ? "bg-green-500/30 text-green-300" : scenario.difficulty === "Intermediate" ? "bg-yellow-500/30 text-yellow-300" : "bg-red-500/30 text-red-300"}`}>{scenario.difficulty}</span>
                            {done && <span className="text-xs px-2 py-1 rounded-full bg-green-500/30 text-green-300">✓ Completed</span>}
                          </div>
                          <p className="text-indigo-300 text-sm mt-1 max-w-xl">{scenario.setup.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {done ? (
                          <div>
                            <div className="text-green-400 font-bold text-lg">{done.score}/{done.maxScore}</div>
                            <div className="text-xs text-green-300">+{done.earned} XP</div>
                          </div>
                        ) : (
                          <div className="text-yellow-400 font-bold text-sm">+{activeSkill.xpReward} XP</div>
                        )}
                        <FaArrowRight className="text-indigo-400 mt-2 ml-auto" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View: Scenario - Interactive Roleplay */}
        {view === "scenario" && activeScenario && currentRound && (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-3xl p-6 border border-indigo-500/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{activeScenario.avatar}</span>
                <div>
                  <span className="text-xs text-indigo-400 uppercase tracking-widest">Scenario</span>
                  <h2 className="text-2xl font-bold text-white">{activeScenario.title}</h2>
                </div>
                <div className="ml-auto flex items-center gap-2 text-indigo-300 text-sm">Round {round + 1} of {activeScenario.rounds.length}</div>
              </div>
              <div className="flex gap-2 mt-3">
                {activeScenario.rounds.map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < round ? "bg-green-500" : i === round ? "bg-indigo-400 animate-pulse" : "bg-gray-600"}`} />
                ))}
              </div>
            </div>

            <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-2xl p-6 flex gap-4">
              <span className="text-4xl mt-1">{activeScenario.avatar}</span>
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2 block">{activeScenario.avatarName} · The Situation</span>
                <p className="text-indigo-100 text-lg leading-relaxed">{round === 0 ? activeScenario.setup : currentRound.prompt}</p>
              </div>
            </div>

            {round > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-white font-semibold text-lg">🤔 {currentRound.prompt}</p>
              </div>
            )}

            <div className="grid gap-3">
              {currentRound.choices.map((choice, idx) => {
                const isChosen = chosen === choice;
                const isRevealed = revealed;
                let cls = "w-full text-left p-5 rounded-2xl border-2 transition-all ";
                if (!isRevealed) {
                  cls += "bg-white/5 border-indigo-500/30 hover:border-indigo-400 hover:bg-white/10 cursor-pointer";
                } else if (isChosen) {
                  cls += choice.score >= 4 ? "bg-green-600/20 border-green-400" : choice.score >= 3 ? "bg-yellow-600/20 border-yellow-400" : "bg-red-600/20 border-red-400";
                } else {
                  cls += "bg-white/5 border-white/10 opacity-40";
                }
                return (
                  <button key={idx} onClick={() => handleChoice(choice)} disabled={isRevealed} className={cls}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-black text-indigo-400 min-w-[2rem]">{String.fromCharCode(65 + idx)}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{choice.text}</p>
                        {isChosen && isRevealed && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${choice.score >= 4 ? "bg-green-500/30 text-green-300" : choice.score >= 3 ? "bg-yellow-500/30 text-yellow-300" : "bg-red-500/30 text-red-300"}`}>{choice.tag}</span>
                            <p className="text-indigo-200 text-sm leading-relaxed">{choice.feedback}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-indigo-400">Score:</span>
                              {[1, 2, 3, 4, 5].map((s) => <div key={s} className={`w-3 h-3 rounded-full ${s <= choice.score ? "bg-yellow-400" : "bg-gray-600"}`} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="text-center">
                <button onClick={nextRound} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition shadow-lg">
                  {round + 1 < activeScenario.rounds.length ? "Next Situation →" : "See Results →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* View: Debrief */}
        {view === "debrief" && activeScenario && (
          <div className="bg-white/10 rounded-3xl p-10 border border-indigo-500/30 text-center">
            <div className="text-6xl mb-4">{debriefPercent >= 80 ? "🏆" : debriefPercent >= 50 ? "👍" : "💡"}</div>
            <h2 className="text-4xl font-black text-white mb-2">{debriefPercent >= 80 ? "Masterfully Handled!" : debriefPercent >= 50 ? "Solid Effort!" : "Room to Grow!"}</h2>
            <p className="text-indigo-300 text-xl mb-2">{activeScenario.title}</p>
            <div className="flex items-center justify-center gap-6 my-8">
              <div>
                <div className="text-5xl font-black text-white">{debriefTotal}/{debriefMax}</div>
                <div className="text-indigo-400 text-sm">Total Score</div>
              </div>
              <div className="w-px h-12 bg-indigo-500/40" />
              <div>
                <div className="text-5xl font-black text-yellow-400">+{lastEarnedXP}</div>
                <div className="text-indigo-400 text-sm">XP Earned</div>
              </div>
              <div className="w-px h-12 bg-indigo-500/40" />
              <div>
                <div className={`text-3xl font-black ${rank.color} flex items-center gap-2 justify-center`}><span>{rank.icon}</span> {rank.label}</div>
                <div className="text-indigo-400 text-sm">Current Rank</div>
              </div>
            </div>
            <div className="max-w-sm mx-auto mb-8">
              <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                <div className={`h-3 rounded-full transition-all duration-1000 ${debriefPercent >= 80 ? "bg-gradient-to-r from-green-400 to-emerald-500" : debriefPercent >= 50 ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} style={{ width: `${debriefPercent}%` }} />
              </div>
              <div className="text-indigo-300 text-sm mt-1">{debriefPercent}% optimal response</div>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={resetScenario} className="px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition flex items-center gap-2"><FaRedo /> Replay</button>
              <button onClick={() => setView("skill")} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:scale-105 transition flex items-center gap-2">More Scenarios <FaArrowRight /></button>
              <button onClick={() => setView("hub")} className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold hover:scale-105 transition">Back to Arena</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}