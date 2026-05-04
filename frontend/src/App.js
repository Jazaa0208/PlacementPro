import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Baseline from "./components/Baseline";
import Aptitude from "./components/Aptitude";
import Coding from "./components/Coding";
import Resume from "./components/Resume"; // Add this import
import Profile from "./components/Profile"; // Add this import
import Interviews from "./components/Interviews"; // Add this import
import SoftSkills from "./components/Softskills"; // Add this import
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/globals.css"; // Add global styles import

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen relative">
        {/* Optional: Remove or modify background animation if it conflicts with dashboard */}
        <div className="bg-animation">
          <div className="floating-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
          </div>
        </div>
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route
            path="/baseline"
            element={
              <ProtectedRoute>
                <Baseline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aptitude"
            element={
              <ProtectedRoute>
                <Aptitude />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <Coding />
              </ProtectedRoute>
            }
          />
          {/* Add proper components for these routes */}
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews"
            element={
              <ProtectedRoute>
                <Interviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soft-skills"
            element={
              <ProtectedRoute>
                <SoftSkills />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;