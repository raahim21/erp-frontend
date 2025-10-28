import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeaveRequest } from "../Slices/LeaveSlice";

// SVG Icons for fields
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const LeaveRequestForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.leave);
  const [formData, setFormData] = useState({
    leaveType: "Vacation",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createLeaveRequest(formData)).then((result) => {
      if (createLeaveRequest.fulfilled.match(result)) {
        setFormData({
          leaveType: "Vacation",
          startDate: "",
          endDate: "",
          reason: "",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 transform transition-all">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">
        Submit Leave Request
      </h2>

      {error && (
        <div className="p-4 mb-6 text-center bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leave Type
          </label>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-8">
            <ChevronDownIcon />
          </div>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="w-full pl-10 p-3 border rounded-lg appearance-none transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          >
            <option>Vacation</option>
            <option>Sick Leave</option>
            <option>Personal</option>
            <option>Unpaid</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-8">
              <CalendarIcon />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 border rounded-lg transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="relative">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none top-8">
              <CalendarIcon />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 border rounded-lg transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason
          </label>
          <div className="absolute left-3 top-10 flex items-start pointer-events-none">
            <DocumentTextIcon />
          </div>
          <textarea
            id="reason"
            name="reason"
            rows="4"
            value={formData.reason}
            onChange={handleChange}
            required
            placeholder="Provide details about your leave request..."
            className="w-full pl-10 p-3 border rounded-lg transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default LeaveRequestForm;