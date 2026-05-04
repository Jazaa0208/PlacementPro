import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMe } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("No token found in localStorage");
        setIsAuth(false);
        return;
      }
      try {
        const response = await fetchMe();
        console.log("Response from /me:", {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          has_taken_baseline: response.data.has_taken_baseline,
        });
        localStorage.setItem("user", JSON.stringify(response.data));
        setIsAuth(true);
      } catch (err) {
        console.error("Error in /me request:", err.response?.data?.error || err.message);
        setError(err.response?.data?.error || "Failed to verify session. Please log in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <div className="p-10 text-center text-indigo-500">
        {error ? (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        ) : (
          "Verifying session..."
        )}
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;