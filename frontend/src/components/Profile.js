// Profile.js - User Profile Page with Real Database Integration
import React, { useState, useRef, useEffect } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin,
  FaGithub, FaEdit, FaCheck, FaTimes, FaCamera, FaTrophy,
  FaFileAlt, FaBriefcase, FaGraduationCap, FaCode, FaStar,
  FaCalendarAlt, FaChartBar, FaRocket, FaShieldAlt, FaBell,
  FaSignOutAlt, FaTrash, FaEye, FaEyeSlash, FaLock,
  FaCheckCircle, FaSpinner, FaUpload, FaCog, FaGlobe,
  FaAward, FaFire, FaMedal, FaChevronRight
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AvatarCircle = ({ name, avatar, size = "xl" }) => {
  const sizeMap = {
    xl: "w-28 h-28 text-4xl",
    lg: "w-16 h-16 text-xl",
    md: "w-10 h-10 text-sm"
  };
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  if (avatar) return <img src={avatar} alt={name} className={`${sizeMap[size]} rounded-full object-cover ring-4 ring-indigo-500/30`} />;
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white ring-4 ring-indigo-500/30`}>
      {initials}
    </div>
  );
};

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    resumeUpdates: true,
    atsAlerts: true,
    testReminders: true,
    weeklyReport: false,
    placementNews: true,
  });
  const fileInputRef = useRef(null);

  // Fetch user data from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          setUser(data);
        } else {
          console.error('Failed to fetch profile:', data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const updateUser = (field, value) => setUser(prev => ({ ...prev, [field]: value }));

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          college: user.college,
          branch: user.branch,
          year: user.year,
          linkedin: user.linkedin,
          github: user.github,
          bio: user.bio,
          avatar: user.avatar
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaveSuccess(true);
        if (data.user) {
          setUser(data.user);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  // SIMPLIFIED IMAGE UPLOAD - No compression, just direct conversion
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 1MB to avoid database issues)
    if (file.size > 1 * 1024 * 1024) {
      alert('File size should be less than 1MB. Please choose a smaller image.');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // Convert to base64 directly without compression
      const reader = new FileReader();
      
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      
      const base64String = await base64Promise;
      
      // Update local state with the base64 image
      updateUser("avatar", base64String);
      
      // Save to backend
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...user,
          avatar: base64String
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaveSuccess(true);
        if (data.user) {
          setUser(data.user);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to upload avatar');
        // Revert local state if save fails
        updateUser("avatar", user.avatar);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to process image. Please try another image.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwdError("");
    if (!pwdForm.current) return setPwdError("Current password is required.");
    if (pwdForm.newPwd.length < 8) return setPwdError("New password must be at least 8 characters.");
    if (pwdForm.newPwd !== pwdForm.confirm) return setPwdError("Passwords do not match.");
    
    setSaveLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current: pwdForm.current,
          newPwd: pwdForm.newPwd,
          confirm: pwdForm.confirm
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPwdSuccess(true);
        setPwdForm({ current: "", newPwd: "", confirm: "" });
        setTimeout(() => setPwdSuccess(false), 3000);
      } else {
        setPwdError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPwdError('Failed to change password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 items-center justify-center">
        <div className="text-white text-xl">Failed to load profile</div>
      </div>
    );
  }

  const username = user.username || user.email?.split('@')[0] || 'user';

  const statsData = [
    { label: "Problems Solved", value: user.stats?.problems_solved || 0, icon: FaCode, color: "from-indigo-500 to-purple-600" },
    { label: "Avg Score", value: `${user.stats?.avg_score || 0}%`, icon: FaChartBar, color: "from-green-500 to-emerald-600" },
    { label: "Companies Applied", value: user.stats?.companies_applied || 0, icon: FaBriefcase, color: "from-amber-500 to-orange-600" },
    { label: "Day Streak", value: user.stats?.current_streak || 0, icon: FaFire, color: "from-red-500 to-rose-600" },
  ];

  const badgesData = [
    { icon: FaTrophy, label: "Top Coder", earned: (user.stats?.avg_score || 0) > 70 },
    { icon: FaMedal, label: "Problem Solver", earned: (user.stats?.problems_solved || 0) > 10 },
    { icon: FaStar, label: "Consistent", earned: (user.stats?.current_streak || 0) > 5 },
  ];

  const inputCls = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500 transition-colors";
  const labelCls = "text-gray-300 text-sm font-medium mb-1 block";

  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }} />
        ))}
      </div>

      <Sidebar activePath={location.pathname} />

      <div className="ml-72 flex-1 p-8 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <AvatarCircle name={user.name} avatar={user.avatar} size="xl" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={saveLoading}
                >
                  <FaCamera className="text-white text-xl" />
                </button>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={saveLoading}
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{user.name}</h1>
                <p className="text-indigo-300 font-semibold">@{username}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><FaGraduationCap className="text-indigo-400" />{user.college || "Not set"}</span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-purple-400" />Joined {joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("edit")}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500/20 to-rose-600/20 hover:from-red-500/30 hover:to-rose-600/30 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          <div className="mt-5 bg-white/5 rounded-2xl px-5 py-4 border border-white/10">
            <p className="text-gray-300 text-sm leading-relaxed">{user.bio || "No bio added yet"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-fit">
          {[
            { id: "overview", label: "Overview", icon: FaUser },
            { id: "edit", label: "Edit Profile", icon: FaEdit },
            { id: "security", label: "Security", icon: FaShieldAlt },
            { id: "notifications", label: "Notifications", icon: FaBell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? "bg-indigo-500/30 border border-indigo-400/30 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={activeTab === id ? "text-indigo-300" : ""} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
              {statsData.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-gray-400 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FaUser className="text-indigo-400" /> Contact Info</h3>
                <div className="space-y-2 text-sm">
                  {[
                    [FaEnvelope, "Email", user.email],
                    [FaPhone, "Phone", user.phone || "Not set"],
                    [FaMapMarkerAlt, "Location", user.location || "Not set"],
                    [FaLinkedin, "LinkedIn", user.linkedin || "Not set"],
                    [FaGithub, "GitHub", user.github || "Not set"],
                    [FaGraduationCap, "Branch", user.branch || "Not set"],
                    [FaCalendarAlt, "Year", user.year || "Not set"],
                  ].map(([Icon, label, val]) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-white/5">
                      <Icon className="text-indigo-400 text-xs flex-shrink-0" />
                      <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
                      <span className="text-white truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FaTrophy className="text-yellow-400" /> Badges</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {badgesData.map(({ icon: Icon, label, earned }) => (
                      <div key={label} className={`border rounded-xl p-3 flex flex-col items-center gap-2 text-center transition-all ${earned ? "bg-yellow-400/10 border-yellow-400/20" : "bg-white/3 border-white/10 opacity-40"}`}>
                        <Icon className={`text-2xl ${earned ? "text-yellow-400" : "text-gray-600"}`} />
                        <p className={`text-xs font-semibold ${earned ? "text-white" : "text-gray-500"}`}>{label}</p>
                        {!earned && <span className="text-gray-600 text-xs">Locked</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === "edit" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-5 sticky top-8">
                <div className="relative group">
                  <AvatarCircle name={user.name} avatar={user.avatar} size="xl" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={saveLoading}
                  >
                    <FaCamera className="text-white text-2xl" />
                    <span className="text-white text-xs font-semibold">Change</span>
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{user.name}</p>
                  <p className="text-indigo-300 text-sm">@{username}</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  disabled={saveLoading}
                >
                  {saveLoading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                  {saveLoading ? "Uploading..." : "Upload Photo"}
                </button>
                {saveSuccess && (
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <FaCheckCircle /> Photo updated!
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><FaUser className="text-indigo-400" /> Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["name", "Full Name", "Your full name", FaUser],
                    ["email", "Email Address", "you@email.com", FaEnvelope],
                    ["phone", "Phone Number", "+91 ...", FaPhone],
                    ["location", "Location", "City, State", FaMapMarkerAlt],
                    ["college", "College", "College name", FaGraduationCap],
                    ["branch", "Branch", "Computer Engineering", FaCode],
                    ["year", "Year", "Final Year (2025)", FaCalendarAlt],
                  ].map(([field, label, placeholder, Icon]) => (
                    <div key={field}>
                      <label className={labelCls}><Icon className="inline mr-1.5 text-indigo-400" />{label}</label>
                      <input
                        className={inputCls}
                        placeholder={placeholder}
                        value={user[field] || ""}
                        onChange={e => updateUser(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><FaGlobe className="text-indigo-400" /> Social Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["linkedin", "LinkedIn URL", "linkedin.com/in/...", FaLinkedin],
                    ["github", "GitHub URL", "github.com/...", FaGithub],
                  ].map(([field, label, placeholder, Icon]) => (
                    <div key={field}>
                      <label className={labelCls}><Icon className="inline mr-1.5 text-indigo-400" />{label}</label>
                      <input
                        className={inputCls}
                        placeholder={placeholder}
                        value={user[field] || ""}
                        onChange={e => updateUser(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><FaEdit className="text-indigo-400" /> Bio</h3>
                <label className={labelCls}>About You</label>
                <textarea
                  className={`${inputCls} h-28 resize-none`}
                  placeholder="Write a short bio about yourself..."
                  value={user.bio || ""}
                  onChange={e => updateUser("bio", e.target.value)}
                />
                <p className="text-gray-500 text-xs mt-2">{user.bio?.length || 0}/300 characters</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-2.5 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {saveLoading ? <FaSpinner className="animate-spin" /> : saveSuccess ? <FaCheck /> : <FaCheck />}
                  {saveLoading ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
              {saveSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-green-300 text-sm">
                  <FaCheckCircle /> Profile updated successfully!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><FaLock className="text-indigo-400" /> Change Password</h3>
              <div className="space-y-4">
                {[
                  ["current", "Current Password", showCurrentPwd, setShowCurrentPwd],
                  ["newPwd", "New Password", showNewPwd, setShowNewPwd],
                  ["confirm", "Confirm New Password", showConfirmPwd, setShowConfirmPwd],
                ].map(([field, label, show, setShow]) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={pwdForm[field]}
                        onChange={e => setPwdForm(prev => ({ ...prev, [field]: e.target.value }))}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {show ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwdError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
                    <FaTimes /> {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-green-300 text-sm">
                    <FaCheckCircle /> Password changed successfully!
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-200 space-y-1">
                  <p className="font-bold text-blue-300">Password Requirements:</p>
                  <p>• At least 8 characters long</p>
                  <p>• Mix of letters, numbers & symbols recommended</p>
                  <p>• Don't reuse your last 3 passwords</p>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={saveLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saveLoading ? <FaSpinner className="animate-spin" /> : <FaShieldAlt />}
                  {saveLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><FaCog className="text-indigo-400" /> Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold transition-all group">
                    <span className="flex items-center gap-3"><FaFileAlt className="text-indigo-400" /> Export My Data</span>
                    <FaChevronRight className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold transition-all group">
                    <span className="flex items-center gap-3"><FaSignOutAlt className="text-orange-400" /> Sign Out All Devices</span>
                    <FaChevronRight className="text-gray-500 group-hover:text-orange-400 transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-semibold transition-all group">
                    <span className="flex items-center gap-3"><FaTrash /> Delete Account</span>
                    <FaChevronRight className="text-red-600 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><FaBell className="text-indigo-400" /> Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  ["resumeUpdates", "Resume Updates", "Get notified when your resume is downloaded"],
                  ["atsAlerts", "ATS Score Alerts", "Alerts when ATS score drops"],
                  ["testReminders", "Mock Test Reminders", "Daily reminders to practice"],
                  ["weeklyReport", "Weekly Report", "Summary of your activity"],
                  ["placementNews", "Placement News", "Latest placement updates"],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between gap-4 bg-white/5 rounded-xl px-5 py-4 border border-white/10">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 flex-shrink-0 ${notifSettings[key] ? "bg-indigo-500" : "bg-gray-700"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${notifSettings[key] ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
};

export default Profile;