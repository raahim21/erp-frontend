import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import FullPageSpinner from "../components/FullPageSpinner.jsx";
import { fetchWithAuth } from "../../utils/fetchWithAuth.js";
import { API_BASE_URL } from "../../config.js";

// SVG Icons for enhanced visual appeal
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Login = () => {
  const { darkMode } = useContext(DarkModeContext);
  const { fetchUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoginLoading(true);

    try {
      // FIX: Use the fetchWithAuth utility to ensure credentials (cookies) are handled correctly.
      await fetchWithAuth(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      await fetchUser(); // This will fetch and set the user context
      navigate("/dashboard"); // Navigate after successful login and user fetch
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoginLoading(false);
    }
  };

  if (loginLoading || authLoading) return <FullPageSpinner />;

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-md shadow-2xl ${darkMode ? "bg-gray-800/90 backdrop-blur-md border border-gray-700" : "bg-white/90 backdrop-blur-md border border-gray-200"}`}>
        <div className="text-center space-y-2">
          <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>Welcome Back</h1>
          <p className={`text-base ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sign in to access your MyERP dashboard</p>
        </div>

        {error && (
          <div className="p-4 text-center bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className={`block font-medium text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="username">
              Username
            </label>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-8">
              <UserIcon />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full pl-10 p-3 border rounded-lg transition-shadow focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}`}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="relative">
            <label className={`block font-medium text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="password">
              Password
            </label>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-8">
              <LockIcon />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 p-3 border rounded-lg transition-shadow focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}`}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
              <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Remember me</span>
            </label>
            <a href="#" className={`hover:underline ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            disabled={loginLoading}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Don't have an account? <a href="/register" className={`hover:underline ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;