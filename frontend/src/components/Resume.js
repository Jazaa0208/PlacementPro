// Resume.js - Template Selection, Editor & ATS Score Checker
import React, { useState, useRef } from "react";
import {
  FaFileAlt, FaDownload, FaEdit, FaRocket,
  FaUser, FaBriefcase, FaGraduationCap,
  FaCode, FaPlus, FaTrash, FaEye, FaMagic,
  FaCheck, FaTimes, FaChevronRight, FaLightbulb, FaSpinner,
  FaAward, FaProjectDiagram
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// ─────────────────────────── TEMPLATES ───────────────────────────
const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Pro",
    desc: "Clean two-column layout, ideal for tech roles",
    accent: "#6366f1",
    preview: "bg-gradient-to-br from-indigo-500 to-purple-600",
    tag: "Most Popular",
    tagColor: "from-yellow-400 to-orange-500"
  },
  {
    id: "minimal",
    name: "Minimal Elite",
    desc: "Single-column, crisp and ATS-friendly",
    accent: "#10b981",
    preview: "bg-gradient-to-br from-emerald-500 to-teal-600",
    tag: "ATS Optimized",
    tagColor: "from-green-400 to-emerald-500"
  },
  {
    id: "bold",
    name: "Bold Impact",
    desc: "Dark header, strong presence for leadership roles",
    accent: "#f59e0b",
    preview: "bg-gradient-to-br from-amber-500 to-orange-600",
    tag: "Leadership",
    tagColor: "from-orange-400 to-red-500"
  },
  {
    id: "creative",
    name: "Creative Edge",
    desc: "Sidebar accent, perfect for design & product roles",
    accent: "#ec4899",
    preview: "bg-gradient-to-br from-pink-500 to-rose-600",
    tag: "Creative",
    tagColor: "from-pink-400 to-purple-500"
  }
];

// ─────────────────────────── DEFAULT DATA ───────────────────────────
const defaultData = {
  name: "Your Full Name",
  title: "Software Engineer",
  email: "you@email.com",
  phone: "+91 98765 43210",
  location: "Pune, Maharashtra",
  linkedin: "linkedin.com/in/yourprofile",
  github: "github.com/yourusername",
  summary: "Passionate software engineer with 2+ years of experience building scalable web applications. Proficient in React, Node.js, and Python with a strong foundation in data structures and algorithms.",
  experience: [
    {
      id: 1,
      role: "Software Engineer Intern",
      company: "TechCorp India",
      duration: "Jun 2024 – Aug 2024",
      points: [
        "Built RESTful APIs using Node.js serving 10k+ daily active users",
        "Reduced page load time by 40% through React code optimization",
        "Collaborated with cross-functional teams in an Agile environment"
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: "B.E. Computer Engineering",
      institute: "Satara College of Engineering",
      year: "2021 – 2025",
      cgpa: "8.4 CGPA"
    }
  ],
  skills: {
    languages: ["Python", "JavaScript", "Java", "C++"],
    frameworks: ["React", "Node.js", "Flask", "Express"],
    tools: ["Git", "Docker", "AWS", "MongoDB"],
    soft: ["Problem Solving", "Team Leadership", "Communication"]
  },
  projects: [
    {
      id: 1,
      name: "PlacementPro",
      tech: "React, Flask, PostgreSQL",
      desc: "AI-powered placement preparation platform with coding practice, aptitude tests, and resume builder",
      link: "github.com/user/placementpro"
    }
  ],
  achievements: [
    "Ranked top 5% in national coding contest (2024)",
    "Published research paper on ML-based ATS systems",
    "Won Smart India Hackathon 2023 – Regional Finalist"
  ],
  certifications: [
    "AWS Certified Developer – Associate",
    "Google Data Analytics Certificate"
  ]
};

// ─────────────────────────── RESUME RENDERERS ───────────────────────────
const ModernResume = ({ data }) => (
  <div id="resume-preview" className="bg-white text-gray-900 w-full font-sans" style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "1123px" }}>
    <div className="bg-indigo-600 text-white px-8 py-6">
      <h1 className="text-3xl font-black tracking-tight">{data.name}</h1>
      <p className="text-indigo-200 text-lg mt-1">{data.title}</p>
      <div className="flex flex-wrap gap-4 mt-3 text-sm text-indigo-100">
        <span>✉ {data.email}</span>
        <span>📞 {data.phone}</span>
        <span>📍 {data.location}</span>
        <span>🔗 {data.linkedin}</span>
        <span>💻 {data.github}</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-0">
      <div className="col-span-1 bg-indigo-50 px-5 py-6 space-y-5 border-r border-indigo-100">
        <Section title="Skills" color="indigo">
          {Object.entries(data.skills).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">{cat}</p>
              <div className="flex flex-wrap gap-1">
                {items.map((s, i) => <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{s}</span>)}
              </div>
            </div>
          ))}
        </Section>
        <Section title="Certifications" color="indigo">
          {data.certifications.map((c, i) => <p key={i} className="text-xs text-gray-600 mb-1">• {c}</p>)}
        </Section>
        <Section title="Achievements" color="indigo">
          {data.achievements.map((a, i) => <p key={i} className="text-xs text-gray-600 mb-1">• {a}</p>)}
        </Section>
      </div>
      <div className="col-span-2 px-6 py-6 space-y-5">
        <Section title="Summary" color="indigo"><p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p></Section>
        <Section title="Experience" color="indigo">
          {data.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between"><p className="font-bold text-sm">{e.role}</p><span className="text-xs text-gray-500">{e.duration}</span></div>
              <p className="text-xs text-indigo-600 font-semibold mb-1">{e.company}</p>
              {e.points.map((p, i) => <p key={i} className="text-xs text-gray-600">• {p}</p>)}
            </div>
          ))}
        </Section>
        <Section title="Projects" color="indigo">
          {data.projects.map((p) => (
            <div key={p.id} className="mb-3">
              <div className="flex justify-between"><p className="font-bold text-sm">{p.name}</p><span className="text-xs text-indigo-500">{p.tech}</span></div>
              <p className="text-xs text-gray-600">{p.desc}</p>
            </div>
          ))}
        </Section>
        <Section title="Education" color="indigo">
          {data.education.map((e) => (
            <div key={e.id} className="flex justify-between items-start">
              <div><p className="font-bold text-sm">{e.degree}</p><p className="text-xs text-gray-500">{e.institute}</p></div>
              <div className="text-right"><p className="text-xs text-gray-500">{e.year}</p><p className="text-xs text-indigo-600">{e.cgpa}</p></div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  </div>
);

const MinimalResume = ({ data }) => (
  <div id="resume-preview" className="bg-white text-gray-900 px-10 py-8 w-full" style={{ fontFamily: "Georgia, serif", minHeight: "1123px" }}>
    <div className="border-b-2 border-gray-900 pb-4 mb-6">
      <h1 className="text-3xl font-black tracking-tight">{data.name}</h1>
      <p className="text-emerald-600 font-semibold text-lg">{data.title}</p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>{data.email}</span><span>|</span><span>{data.phone}</span><span>|</span><span>{data.location}</span><span>|</span><span>{data.linkedin}</span>
      </div>
    </div>
    <MinSection title="Professional Summary"><p className="text-sm text-gray-600">{data.summary}</p></MinSection>
    <MinSection title="Experience">
      {data.experience.map((e) => (
        <div key={e.id} className="mb-3">
          <div className="flex justify-between"><p className="font-bold text-sm">{e.role} — {e.company}</p><span className="text-xs text-gray-500">{e.duration}</span></div>
          {e.points.map((p, i) => <p key={i} className="text-xs text-gray-600 ml-3">• {p}</p>)}
        </div>
      ))}
    </MinSection>
    <MinSection title="Education">
      {data.education.map((e) => (
        <div key={e.id} className="flex justify-between"><div><p className="font-bold text-sm">{e.degree}</p><p className="text-xs text-gray-500">{e.institute}</p></div><div className="text-right text-xs text-gray-500"><p>{e.year}</p><p>{e.cgpa}</p></div></div>
      ))}
    </MinSection>
    <MinSection title="Technical Skills">
      {Object.entries(data.skills).map(([cat, items]) => (
        <p key={cat} className="text-xs text-gray-700 mb-1"><span className="font-bold capitalize">{cat}:</span> {items.join(", ")}</p>
      ))}
    </MinSection>
    <MinSection title="Projects">
      {data.projects.map((p) => (
        <div key={p.id} className="mb-2"><p className="font-bold text-sm">{p.name} <span className="text-xs text-emerald-600 font-normal">({p.tech})</span></p><p className="text-xs text-gray-600">{p.desc}</p></div>
      ))}
    </MinSection>
    <MinSection title="Achievements & Certifications">
      {[...data.achievements, ...data.certifications].map((a, i) => <p key={i} className="text-xs text-gray-600">• {a}</p>)}
    </MinSection>
  </div>
);

const BoldResume = ({ data }) => (
  <div id="resume-preview" className="bg-white text-gray-900 w-full" style={{ fontFamily: "'Arial Black', sans-serif", minHeight: "1123px" }}>
    <div className="bg-gray-900 text-white px-8 py-7">
      <h1 className="text-4xl font-black uppercase tracking-widest">{data.name}</h1>
      <p className="text-amber-400 text-lg font-bold mt-1 tracking-wide">{data.title}</p>
      <div className="flex flex-wrap gap-5 mt-3 text-xs text-gray-300">
        <span>{data.email}</span><span>{data.phone}</span><span>{data.location}</span><span>{data.linkedin}</span>
      </div>
    </div>
    <div className="px-8 py-6 space-y-5">
      <BoldSection title="Profile" accent="amber"><p className="text-sm text-gray-600">{data.summary}</p></BoldSection>
      <BoldSection title="Experience" accent="amber">
        {data.experience.map((e) => (
          <div key={e.id} className="mb-3 pl-3 border-l-2 border-amber-400">
            <div className="flex justify-between"><p className="font-black text-sm uppercase">{e.role}</p><span className="text-xs text-gray-500">{e.duration}</span></div>
            <p className="text-xs text-amber-600 font-bold">{e.company}</p>
            {e.points.map((p, i) => <p key={i} className="text-xs text-gray-600">• {p}</p>)}
          </div>
        ))}
      </BoldSection>
      <div className="grid grid-cols-2 gap-6">
        <BoldSection title="Education" accent="amber">
          {data.education.map((e) => (
            <div key={e.id}><p className="font-black text-sm">{e.degree}</p><p className="text-xs text-gray-500">{e.institute} | {e.year} | {e.cgpa}</p></div>
          ))}
        </BoldSection>
        <BoldSection title="Skills" accent="amber">
          {Object.entries(data.skills).slice(0, 2).map(([cat, items]) => (
            <div key={cat} className="mb-2"><p className="text-xs font-black uppercase text-amber-600">{cat}</p><p className="text-xs text-gray-600">{items.join(" · ")}</p></div>
          ))}
        </BoldSection>
      </div>
      <BoldSection title="Projects" accent="amber">
        {data.projects.map((p) => (
          <div key={p.id} className="mb-2"><p className="font-black text-sm">{p.name} <span className="text-amber-500 text-xs font-normal">| {p.tech}</span></p><p className="text-xs text-gray-600">{p.desc}</p></div>
        ))}
      </BoldSection>
      <BoldSection title="Achievements" accent="amber">
        {data.achievements.map((a, i) => <p key={i} className="text-xs text-gray-600 font-bold">▸ {a}</p>)}
      </BoldSection>
    </div>
  </div>
);

const CreativeResume = ({ data }) => (
  <div id="resume-preview" className="bg-white text-gray-900 w-full flex" style={{ fontFamily: "'Trebuchet MS', sans-serif", minHeight: "1123px" }}>
    <div className="w-1/3 bg-pink-600 text-white px-5 py-7 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black leading-tight">{data.name}</h1>
        <p className="text-pink-100 text-sm mt-1">{data.title}</p>
      </div>
      <div className="space-y-1 text-xs text-pink-100">
        <p>✉ {data.email}</p><p>📞 {data.phone}</p><p>📍 {data.location}</p><p>🔗 {data.linkedin}</p><p>💻 {data.github}</p>
      </div>
      <CreativeSideSection title="Skills">
        {Object.entries(data.skills).map(([cat, items]) => (
          <div key={cat} className="mb-2"><p className="text-xs font-bold uppercase text-pink-200">{cat}</p>
            {items.map((s, i) => <div key={i} className="flex items-center gap-1 text-xs text-pink-50"><span>•</span>{s}</div>)}
          </div>
        ))}
      </CreativeSideSection>
      <CreativeSideSection title="Education">
        {data.education.map((e) => (<div key={e.id}><p className="text-xs font-bold">{e.degree}</p><p className="text-xs text-pink-200">{e.institute}</p><p className="text-xs text-pink-300">{e.year} | {e.cgpa}</p></div>))}
      </CreativeSideSection>
      <CreativeSideSection title="Certifications">
        {data.certifications.map((c, i) => <p key={i} className="text-xs text-pink-100">• {c}</p>)}
      </CreativeSideSection>
    </div>
    <div className="w-2/3 px-6 py-7 space-y-5">
      <div className="border-b-2 border-pink-100 pb-3"><p className="text-sm text-gray-600">{data.summary}</p></div>
      <CreativeMainSection title="Experience">
        {data.experience.map((e) => (
          <div key={e.id} className="mb-3"><div className="flex justify-between"><p className="font-bold text-sm">{e.role}</p><span className="text-xs text-gray-400">{e.duration}</span></div><p className="text-xs text-pink-600 font-semibold">{e.company}</p>{e.points.map((p, i) => <p key={i} className="text-xs text-gray-600">• {p}</p>)}</div>
        ))}
      </CreativeMainSection>
      <CreativeMainSection title="Projects">
        {data.projects.map((p) => (
          <div key={p.id} className="mb-3"><p className="font-bold text-sm">{p.name} <span className="text-pink-500 text-xs">({p.tech})</span></p><p className="text-xs text-gray-600">{p.desc}</p></div>
        ))}
      </CreativeMainSection>
      <CreativeMainSection title="Achievements">
        {data.achievements.map((a, i) => <p key={i} className="text-xs text-gray-600">★ {a}</p>)}
      </CreativeMainSection>
    </div>
  </div>
);

// ─────────────────────────── SECTION HELPERS ───────────────────────────
const Section = ({ title, color, children }) => (
  <div><h3 className={`text-xs font-black uppercase tracking-widest text-${color}-600 border-b border-${color}-200 pb-1 mb-2`}>{title}</h3>{children}</div>
);
const MinSection = ({ title, children }) => (
  <div className="mb-4"><h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-900 pb-1 mb-2">{title}</h3>{children}</div>
);
const BoldSection = ({ title, accent, children }) => (
  <div><h3 className={`text-sm font-black uppercase tracking-widest text-${accent}-500 mb-2 flex items-center gap-2`}><span className={`w-4 h-0.5 bg-${accent}-400 inline-block`}></span>{title}</h3>{children}</div>
);
const CreativeSideSection = ({ title, children }) => (
  <div><h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-pink-400 pb-1 mb-2">{title}</h3>{children}</div>
);
const CreativeMainSection = ({ title, children }) => (
  <div><h3 className="text-sm font-black uppercase tracking-widest text-pink-600 border-b border-pink-200 pb-1 mb-2">{title}</h3>{children}</div>
);

// ─────────────────────────── ATS SCORE WIDGET ───────────────────────────
const ATSScore = ({ score, breakdown, suggestions, jobRole }) => {
  const color = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good – Needs Polish" : "Needs Improvement";
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-8">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="transform -rotate-90 w-36 h-36">
            <circle cx="72" cy="72" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
            <circle
              cx="72" cy="72" r="54"
              stroke={score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171"}
              strokeWidth="10" fill="none" strokeLinecap="round"
              style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (circumference * score) / 100, transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{score}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>
        <div>
          <p className={`text-xl font-black ${color === "green" ? "text-green-400" : color === "yellow" ? "text-yellow-400" : "text-red-400"}`}>{label}</p>
          {jobRole && <p className="text-gray-400 text-sm mt-1">Optimized for: <span className="text-indigo-300 font-semibold">{jobRole}</span></p>}
          <p className="text-gray-400 text-xs mt-2">ATS compatibility based on keywords, format & content quality</p>
        </div>
      </div>
      {breakdown && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="bg-white/5 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-white font-bold">{val}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${val >= 80 ? "bg-green-400" : val >= 60 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {suggestions?.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <h4 className="text-yellow-300 font-bold mb-3 flex items-center gap-2"><FaLightbulb /> Suggestions to Improve</h4>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-100">
                <span className="text-yellow-400 mt-0.5">•</span>{s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────── PRINT STYLES (injected once) ───────────────────────────
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #resume-print-area, #resume-print-area * { visibility: visible !important; }
    #resume-print-area {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
    }
    @page { size: A4; margin: 0; }
  }
`;

// ─────────────────────────── MAIN COMPONENT ───────────────────────────
const Resume = () => {
  const location = useLocation();
  const [step, setStep] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(defaultData);
  const [activeSection, setActiveSection] = useState("personal");
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [showAtsPanel, setShowAtsPanel] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printStyleInjected, setPrintStyleInjected] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://web-production-54456.up.railway.app/api";

  // ─── Inject print styles once ───
  const injectPrintStyles = () => {
    if (printStyleInjected) return;
    const style = document.createElement("style");
    style.id = "resume-print-styles";
    style.innerHTML = PRINT_STYLES;
    document.head.appendChild(style);
    setPrintStyleInjected(true);
  };

  // ─── FIX 1: Correct token key — matches your auth system ───
  const getAuthToken = () => {
    // Try all common key names your app might use
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      ""
    );
  };

  // ─── ATS via Backend API ───
  const checkATS = async () => {
    setAtsLoading(true);
    setAtsError(null);
    setAtsResult(null);

    try {
      const token = getAuthToken();

      if (!token) {
        setAtsError("Session expired. Please log in again.");
        setAtsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          jobRole,
          jobDesc
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAtsResult(data);
    } catch (err) {
      setAtsError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setAtsLoading(false);
    }
  };

  // ─── FIX 2: TRUE PDF download via browser print dialog ───
  const handleDownload = () => {
    setDownloadLoading(true);
    injectPrintStyles();

    // Give the style time to inject, then open print dialog
    setTimeout(() => {
      window.print();
      setDownloadLoading(false);
    }, 300);
  };

  // ─── Field updaters ───
  const updateField = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));
  const updateSkills = (cat, value) => setResumeData(prev => ({
    ...prev,
    skills: { ...prev.skills, [cat]: value.split(",").map(s => s.trim()).filter(Boolean) }
  }));
  const updateExpField = (id, field, value) => setResumeData(prev => ({
    ...prev,
    experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
  }));
  const updateExpPoint = (id, idx, value) => setResumeData(prev => ({
    ...prev,
    experience: prev.experience.map(e => e.id === id ? { ...e, points: e.points.map((p, i) => i === idx ? value : p) } : e)
  }));
  const addExpPoint = (id) => setResumeData(prev => ({
    ...prev,
    experience: prev.experience.map(e => e.id === id ? { ...e, points: [...e.points, ""] } : e)
  }));
  const removeExpPoint = (id, idx) => setResumeData(prev => ({
    ...prev,
    experience: prev.experience.map(e => e.id === id ? { ...e, points: e.points.filter((_, i) => i !== idx) } : e)
  }));
  const addExperience = () => setResumeData(prev => ({
    ...prev,
    experience: [...prev.experience, { id: Date.now(), role: "", company: "", duration: "", points: [""] }]
  }));
  const removeExperience = (id) => setResumeData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  const updateEduField = (id, field, value) => setResumeData(prev => ({
    ...prev,
    education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
  }));
  const addEducation = () => setResumeData(prev => ({
    ...prev,
    education: [...prev.education, { id: Date.now(), degree: "", institute: "", year: "", cgpa: "" }]
  }));
  const removeEducation = (id) => setResumeData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  const updateProjectField = (id, field, value) => setResumeData(prev => ({
    ...prev,
    projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
  }));
  const addProject = () => setResumeData(prev => ({
    ...prev,
    projects: [...prev.projects, { id: Date.now(), name: "", tech: "", desc: "", link: "" }]
  }));
  const removeProject = (id) => setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const renderResume = () => {
    switch (selectedTemplate?.id) {
      case "minimal": return <MinimalResume data={resumeData} />;
      case "bold":    return <BoldResume    data={resumeData} />;
      case "creative":return <CreativeResume data={resumeData} />;
      default:        return <ModernResume  data={resumeData} />;
    }
  };

  // ─────────────── STEP: TEMPLATE SELECTION ───────────────
  if (step === "template") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
        <StarField />
        <Sidebar activePath={location.pathname} />
        <div className="ml-72 flex-1 p-8 relative z-10">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
            <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-3">
              <FaFileAlt className="text-orange-400" /> Resume Builder
            </h1>
            <p className="text-indigo-200 text-xl">Choose a template, fill your details, download & check ATS score</p>
          </div>
          <StepBar current={1} />
          <h2 className="text-2xl font-bold text-white mb-6 mt-8">Select Your Template</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => { setSelectedTemplate(tpl); setStep("edit"); }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:scale-105 hover:border-indigo-400/50 transition-all duration-300 group"
              >
                <div className={`${tpl.preview} h-44 flex items-center justify-center relative`}>
                  <FaFileAlt className="text-white text-5xl opacity-60 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-3 right-3">
                    <span className={`bg-gradient-to-r ${tpl.tagColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>{tpl.tag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg">{tpl.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{tpl.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-indigo-300 text-sm font-semibold group-hover:text-indigo-200">
                    Use Template <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <TwinkleStyle />
      </div>
    );
  }

  // ─────────────── STEP: EDIT ───────────────
  if (step === "edit") {
    const sections = [
      { id: "personal",   label: "Personal",   icon: FaUser },
      { id: "summary",    label: "Summary",    icon: FaFileAlt },
      { id: "experience", label: "Experience", icon: FaBriefcase },
      { id: "education",  label: "Education",  icon: FaGraduationCap },
      { id: "skills",     label: "Skills",     icon: FaCode },
      { id: "projects",   label: "Projects",   icon: FaProjectDiagram },
      { id: "extras",     label: "Extras",     icon: FaAward },
    ];
    const inputCls = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500 transition-colors";
    const labelCls = "text-gray-300 text-sm font-medium mb-1 block";

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
        <StarField count={30} />
        <Sidebar activePath={location.pathname} />
        <div className="ml-72 flex-1 p-8 relative z-10">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 mb-6 shadow-2xl flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <FaEdit className="text-orange-400" /> Edit Your Resume
              </h1>
              <p className="text-indigo-200 mt-1">Template: <span className="font-bold text-white">{selectedTemplate?.name}</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("template")} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold transition-all text-sm">← Back</button>
              <button onClick={() => setStep("preview")} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2">
                <FaEye /> Preview
              </button>
            </div>
          </div>
          <StepBar current={2} />
          <div className="grid grid-cols-4 gap-6 mt-6">
            {/* Section Nav */}
            <div className="col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-8">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 font-bold">Sections</p>
                <div className="space-y-1">
                  {sections.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === id ? "bg-indigo-500/30 border border-indigo-400/30 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                      <Icon className={activeSection === id ? "text-indigo-300" : ""} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

                {activeSection === "personal" && (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><FaUser className="text-indigo-400" /> Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[["name","Full Name","Your Name"],["title","Job Title","e.g. Software Engineer"],["email","Email","you@email.com"],["phone","Phone","+91 ..."],["location","Location","City, State"],["linkedin","LinkedIn","linkedin.com/in/..."],["github","GitHub","github.com/..."]].map(([field, label, placeholder]) => (
                        <div key={field}>
                          <label className={labelCls}>{label}</label>
                          <input className={inputCls} placeholder={placeholder} value={resumeData[field]} onChange={e => updateField(field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "summary" && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><FaFileAlt className="text-indigo-400" /> Professional Summary</h3>
                    <label className={labelCls}>Summary (2-4 sentences)</label>
                    <textarea className={`${inputCls} h-32 resize-none`} value={resumeData.summary} onChange={e => updateField("summary", e.target.value)} placeholder="Write a powerful summary..." />
                    <p className="text-gray-500 text-xs mt-2">💡 Tip: Include your years of experience, key skills, and what makes you unique.</p>
                  </div>
                )}

                {activeSection === "experience" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xl flex items-center gap-2"><FaBriefcase className="text-indigo-400" /> Experience</h3>
                      <button onClick={addExperience} className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"><FaPlus /> Add</button>
                    </div>
                    <div className="space-y-6">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
                          <div className="flex justify-between mb-3">
                            <p className="text-white font-semibold">{exp.role || "New Role"}</p>
                            {resumeData.experience.length > 1 && <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {[["role","Job Title"],["company","Company"],["duration","Duration e.g. Jun 2024 – Aug 2024"]].map(([f, l]) => (
                              <div key={f} className={f === "duration" ? "col-span-2" : ""}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} value={exp[f]} onChange={e => updateExpField(exp.id, f, e.target.value)} />
                              </div>
                            ))}
                          </div>
                          <label className={labelCls}>Bullet Points</label>
                          {exp.points.map((pt, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input className={inputCls} value={pt} onChange={e => updateExpPoint(exp.id, i, e.target.value)} placeholder={`Bullet ${i + 1}: Start with action verb...`} />
                              {exp.points.length > 1 && <button onClick={() => removeExpPoint(exp.id, i)} className="text-red-400 hover:text-red-300 flex-shrink-0"><FaTimes /></button>}
                            </div>
                          ))}
                          <button onClick={() => addExpPoint(exp.id)} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1"><FaPlus /> Add bullet</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "education" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xl flex items-center gap-2"><FaGraduationCap className="text-indigo-400" /> Education</h3>
                      <button onClick={addEducation} className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"><FaPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
                          <div className="flex justify-between mb-3">
                            <p className="text-white font-semibold">{edu.degree || "New Degree"}</p>
                            {resumeData.education.length > 1 && <button onClick={() => removeEducation(edu.id)} className="text-red-400"><FaTrash /></button>}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[["degree","Degree"],["institute","Institute"],["year","Year Range"],["cgpa","CGPA/Percentage"]].map(([f, l]) => (
                              <div key={f}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} value={edu[f]} onChange={e => updateEduField(edu.id, f, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "skills" && (
                  <div>
                    <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><FaCode className="text-indigo-400" /> Skills</h3>
                    <p className="text-gray-400 text-sm mb-5">Separate each skill with a comma</p>
                    <div className="space-y-4">
                      {Object.entries(resumeData.skills).map(([cat, items]) => (
                        <div key={cat}>
                          <label className={`${labelCls} capitalize`}>{cat}</label>
                          <input className={inputCls} value={items.join(", ")} onChange={e => updateSkills(cat, e.target.value)} placeholder="e.g. Python, JavaScript, ..." />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "projects" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xl flex items-center gap-2"><FaProjectDiagram className="text-indigo-400" /> Projects</h3>
                      <button onClick={addProject} className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all"><FaPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
                          <div className="flex justify-between mb-3">
                            <p className="text-white font-semibold">{proj.name || "New Project"}</p>
                            {resumeData.projects.length > 1 && <button onClick={() => removeProject(proj.id)} className="text-red-400"><FaTrash /></button>}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[["name","Project Name"],["tech","Technologies Used"],["link","Link (optional)"]].map(([f, l]) => (
                              <div key={f}>
                                <label className={labelCls}>{l}</label>
                                <input className={inputCls} value={proj[f]} onChange={e => updateProjectField(proj.id, f, e.target.value)} />
                              </div>
                            ))}
                            <div className="col-span-2">
                              <label className={labelCls}>Description</label>
                              <textarea className={`${inputCls} h-20 resize-none`} value={proj.desc} onChange={e => updateProjectField(proj.id, "desc", e.target.value)} placeholder="Describe what you built and its impact..." />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "extras" && (
                  <div className="space-y-6">
                    <h3 className="text-white font-bold text-xl flex items-center gap-2"><FaAward className="text-indigo-400" /> Extras</h3>
                    <div>
                      <label className={labelCls}>Achievements (one per line)</label>
                      <textarea className={`${inputCls} h-28 resize-none`}
                        value={resumeData.achievements.join("\n")}
                        onChange={e => updateField("achievements", e.target.value.split("\n").filter(Boolean))}
                        placeholder="Enter each achievement on a new line..." />
                    </div>
                    <div>
                      <label className={labelCls}>Certifications (one per line)</label>
                      <textarea className={`${inputCls} h-24 resize-none`}
                        value={resumeData.certifications.join("\n")}
                        onChange={e => updateField("certifications", e.target.value.split("\n").filter(Boolean))}
                        placeholder="Enter each certification on a new line..." />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
        <TwinkleStyle />
      </div>
    );
  }

  // ─────────────── STEP: PREVIEW ───────────────
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
      <StarField count={30} />
      <Sidebar activePath={location.pathname} />
      <div className="ml-72 flex-1 p-8 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 mb-6 shadow-2xl flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3"><FaEye className="text-orange-400" /> Preview & Download</h1>
            <p className="text-indigo-200 mt-1">Template: <span className="font-bold text-white">{selectedTemplate?.name}</span></p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setStep("edit")} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold transition-all text-sm">← Edit</button>
            <button onClick={() => setShowAtsPanel(!showAtsPanel)} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2">
              <FaMagic /> {showAtsPanel ? "Hide ATS" : "Check ATS Score"}
            </button>
            {/* FIX 2: Print-to-PDF button */}
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {downloadLoading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              {downloadLoading ? "Opening..." : "Download PDF"}
            </button>
          </div>
        </div>

        <StepBar current={3} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-6">
          {/* Resume Preview — wrapped with print-area id */}
          <div className="xl:col-span-2">
            <div id="resume-print-area" className="bg-white rounded-2xl shadow-2xl overflow-auto" style={{ maxHeight: "900px" }}>
              {renderResume()}
            </div>
            {/* Helpful note */}
            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <FaLightbulb className="text-blue-300 mt-0.5 flex-shrink-0" />
              <p className="text-blue-200 text-xs leading-relaxed">
                <strong>PDF tip:</strong> When the print dialog opens → change <em>Destination</em> to <strong>"Save as PDF"</strong> → set <em>Margins</em> to <strong>None</strong> → disable <em>Headers and footers</em> → click Save.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><FaRocket className="text-indigo-400" /> Quick Stats</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Template",          selectedTemplate?.name],
                  ["Name",              resumeData.name],
                  ["Experience Entries",resumeData.experience.length],
                  ["Projects",          resumeData.projects.length],
                  ["Skills Total",      Object.values(resumeData.skills).flat().length],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="text-white font-semibold">{v}</span></div>
                ))}
              </div>
            </div>

            {/* ATS Panel */}
            {showAtsPanel && (
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg"><FaMagic className="text-purple-400" /> ATS Score Checker</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-1 block">Target Job Role</label>
                    <input
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500"
                      placeholder="e.g. Software Engineer, Data Analyst"
                      value={jobRole}
                      onChange={e => setJobRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-1 block">Job Description <span className="text-gray-500">(optional)</span></label>
                    <textarea
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 h-20 resize-none"
                      placeholder="Paste job description for more accurate results..."
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={checkATS}
                  disabled={atsLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {atsLoading ? <><FaSpinner className="animate-spin" /> Analyzing...</> : <><FaMagic /> Analyze with AI</>}
                </button>
                {atsError && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                    <FaTimes className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{atsError}</p>
                  </div>
                )}
                {atsResult && (
                  <div className="mt-5">
                    <ATSScore score={atsResult.score} breakdown={atsResult.breakdown} suggestions={atsResult.suggestions} jobRole={jobRole} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <TwinkleStyle />
    </div>
  );
};

// ─────────────────────────── SMALL SHARED HELPERS ───────────────────────────
const StarField = ({ count = 40 }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="absolute w-1 h-1 bg-white rounded-full"
        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 + 0.2, animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s` }} />
    ))}
  </div>
);

const TwinkleStyle = () => (
  <style>{`@keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
);

const StepBar = ({ current }) => {
  const steps = [["1", "Choose Template"], ["2", "Edit Details"], ["3", "Preview & Download"]];
  return (
    <div className="flex items-center gap-4">
      {steps.map(([num, label], idx) => {
        const n = idx + 1;
        const active = n === current;
        const done = n < current;
        return (
          <React.Fragment key={num}>
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold ${active ? "bg-indigo-500/30 border border-indigo-400/50 text-white" : "bg-white/5 border border-white/10 text-gray-500"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${active ? "bg-indigo-500 text-white" : done ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}`}>
                {done ? <FaCheck /> : num}
              </div>
              {label}
            </div>
            {idx < 2 && <FaChevronRight className="text-gray-600" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Resume;