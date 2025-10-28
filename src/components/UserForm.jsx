import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../config.js";
import Spinner from "./Spinner.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { FiUser, FiLock, FiShield, FiBriefcase, FiDollarSign, FiClock, FiCalendar } from 'react-icons/fi';

const UserForm = () => {
  const { darkMode } = React.useContext(DarkModeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = id !== undefined && id !== "new";
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin",
    jobPosition: "none",
    hourlyRate: 0,
    maxHoursPerWeek: 40,
    availability: [],
  });

  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (isEditMode) {
      const decodedId = decodeURIComponent(id);
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/users/${decodedId}`, {
            credentials: "include",
          });
          if (!res.ok) {
            const data = await res.json();
            toast.error(data.message || "Something went wrong");
            throw new Error(data.message || "Failed to fetch user");
          }
          const data = await res.json();
          setFormData({
            username: data.username || "",
            password: "", // Password is not fetched for security reasons; leave blank
            role: data.role || "admin",
            jobPosition: data.jobPosition || "none",
            hourlyRate: data.hourlyRate || 0,
            maxHoursPerWeek: data.maxHoursPerWeek || 40,
            availability: data.availability || [],
          });
        } catch (error) {
          toast.error(error.message || "Failed to fetch user");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day, isChecked) => {
    setFormData(prev => {
        const newAvailability = isChecked
            ? [...prev.availability, { day, start: '09:00', end: '17:00' }]
            : prev.availability.filter(a => a.day !== day);
        
        newAvailability.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));
        return { ...prev, availability: newAvailability };
    });
  };

  const handleTimeChange = (day, type, value) => {
      setFormData(prev => {
          const newAvailability = prev.availability.map(a =>
              a.day === day ? { ...a, [type]: value } : a
          );
          return { ...prev, availability: newAvailability };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const submitData = {
      ...formData,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      maxHoursPerWeek: parseInt(formData.maxHoursPerWeek) || 40,
    };

    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    const userId = id ? decodeURIComponent(id) : null;
    const url = isEditMode
      ? `${API_BASE_URL}/api/auth/users/${userId}`
      : `${API_BASE_URL}/api/auth/users`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      toast.success(isEditMode ? "User updated!" : "User created!");
      navigate("/users");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`mt-10 max-w-2xl mx-auto p-6 sm:p-8 rounded-xl shadow-2xl ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } transition-colors duration-300`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={darkMode ? "dark" : "light"}
      />
      <h2 className="text-3xl font-bold mb-8 text-center">
        {isEditMode ? "Edit User" : "Create New User"}
      </h2>
      {isLoading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="Enter username"
              />
              <FiUser className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {isEditMode ? "New Password (optional)" : "Password"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
              />
              <FiLock className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors appearance-none`}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
              <FiShield className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Job Position
              </label>
              <input
                type="text"
                name="jobPosition"
                value={formData.jobPosition}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., Cashier"
              />
              <FiBriefcase className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Hourly Rate
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., 15.00"
              />
              <FiDollarSign className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Max Hours Per Week
              </label>
              <input
                type="number"
                name="maxHoursPerWeek"
                value={formData.maxHoursPerWeek}
                onChange={handleChange}
                min="0"
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., 40"
              />
              <FiClock className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 flex items-center space-x-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <FiCalendar size={18} />
              <span>Availability</span>
            </label>
            <div className="space-y-4 mt-2">
                {daysOfWeek.map((day) => {
                    const availabilityData = formData.availability.find(a => a.day === day);
                    const isChecked = !!availabilityData;
                    return (
                        <div key={day} className={`p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleDayToggle(day, e.target.checked)}
                                    className={`w-5 h-5 rounded border focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-500' : 'bg-white border-gray-300 text-blue-600'} transition-colors`}
                                />
                                <span className="font-medium">{day}</span>
                            </label>
                            {isChecked && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 sm:pl-8">
                                    <div>
                                        <label className={`block text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Start Time</label>
                                        <input
                                            type="time"
                                            value={availabilityData.start}
                                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                            required
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>End Time</label>
                                        <input
                                            type="time"
                                            value={availabilityData.end}
                                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                            required
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              darkMode
                ? "bg-blue-700 hover:bg-blue-800 active:bg-blue-900"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isEditMode ? "Update User" : "Create User"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserForm;
