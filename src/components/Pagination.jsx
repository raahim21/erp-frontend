import React, { useContext } from "react";
import { DarkModeContext } from "../context/DarkmodeContext.jsx"; // Import DarkModeContext

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) {
  const { darkMode } = useContext(DarkModeContext); // Access darkMode

  return (
    <div
      className={`flex items-center gap-4 mt-4 mb-8 justify-center ${
        darkMode ? "text-gray-300" : "text-gray-800"
      }`}
    >
      <button
        className={`px-3 py-1 rounded disabled:opacity-50 ${
          darkMode
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        disabled={currentPage <= 1 || loading}
        onClick={() => {
          onPageChange(currentPage - 1);
        }}
      >
        Prev
      </button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className={`px-3 py-1 rounded disabled:opacity-50 ${
          darkMode
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        disabled={currentPage >= totalPages || loading}
        onClick={() => {
          onPageChange(currentPage + 1);
        }}
      >
        Next
      </button>
    </div>
  );
}
