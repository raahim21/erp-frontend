import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import { DarkModeContext } from "../context/DarkmodeContext";

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }
        setUser(data);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex items-center justify-center`}>
        <p className="text-indigo-600 text-lg font-medium animate-pulse">
          Loading user... ⏳
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex items-center justify-center`}>
        <p className="text-red-500 text-lg font-medium">Error: {error} 😕</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex items-center justify-center`}>
        <p className="text-gray-600 text-lg font-medium">User not found</p>
      </div>
    );
  }

  const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const filteredAvailability = (user.availability || []).filter(
    (slot) => slot.day && slot.start && slot.end
  );
  const sortedAvailability = filteredAvailability.sort(
    (a, b) => dayOrder[a.day] - dayOrder[b.day]
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} p-8`}>
      <div className={`max-w-3xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-xl shadow-md border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <h1 className={`text-3xl font-extrabold ${darkMode ? "text-indigo-400" : "text-indigo-600"} mb-6 text-center`}>
          {user.username}'s Profile
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Username:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user.username}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-3">
                <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email:</span>
                <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} capitalize`}>{user.role}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Job Position:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user.jobPosition || "Not specified"}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Hourly Rate:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>${user.hourlyRate.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Max Hours/Week:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user.maxHoursPerWeek}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Joined:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>User ID:</span>
              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} font-mono text-sm`}>{user._id}</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}>Availability</h2>
          {sortedAvailability.length > 0 ? (
            <ul className="space-y-2">
              {sortedAvailability.map((slot, index) => (
                <li key={index} className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{slot.day}</span>
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{slot.start} - {slot.end}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Not specified</p>
          )}
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className={`${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} text-white px-6 py-3 rounded-lg shadow-lg focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1`}
          >
            Back to User List
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserView;