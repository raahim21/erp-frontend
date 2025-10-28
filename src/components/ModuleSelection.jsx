import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

// --- Icon Components ---

const InventoryIcon = ({ className = "w-12 h-12" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4" />
  </svg>
);

const SchedulingIcon = ({ className = "w-12 h-12" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v-2" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);


const ModuleCard = ({ to, icon, title, description, color, darkMode }) => (
  <Link
    to={to}
    className={`group relative flex flex-col p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl ${
      darkMode
        ? `bg-gray-800 border border-gray-700 hover:border-${color}-500`
        : `bg-white border border-gray-200 hover:border-${color}-300`
    }`}
  >
    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-transparent to-transparent group-hover:from-${color}-400 group-hover:to-${color}-500 transition-all duration-300`}></div>
    <div className={`p-3 mb-4 inline-flex items-center justify-center rounded-lg ${darkMode ? `bg-gray-700 text-${color}-400` : `bg-${color}-100 text-${color}-600`}`}>
      {icon}
    </div>
    <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
    <p className={`flex-grow ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{description}</p>
    <div className={`mt-6 flex items-center justify-between font-semibold ${darkMode ? `text-${color}-400` : `text-${color}-600`}`}>
      <span>Go to Module</span>
      <ArrowRightIcon className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </div>
  </Link>
);


const ModuleSelection = () => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="text-center mb-10 sm:mb-12">
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
          Welcome
        </h1>
        <p className={`mt-3 max-w-2xl mx-auto text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Choose a system to manage your operations.
        </p>
      </div>

      <div className="grid grid-cols-1 1100:grid-cols-2 gap-8 max-w-5xl w-full">
        <ModuleCard
          to="/ims/products"
          icon={<InventoryIcon />}
          title="Inventory Management"
          description="Manage products, purchases, and issue orders."
          color="indigo"
          darkMode={darkMode}
        />
        <ModuleCard
          to="/hr/schedules"
          icon={<SchedulingIcon />}
          title="Scheduling System (HR)"
          description="Manage employee shifts and schedules."
          color="teal"
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default ModuleSelection;
