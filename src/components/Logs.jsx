import { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../components/pagination.jsx";
import {
  fetchLogs,
  setSearchTerm,
  setPage,
  setActiveFilter,
} from "../Slices/LogsSlice";
import Spinner from "./Spinner";
import FilterBox from "./FilterBox";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

const Logs = () => {
  const dispatch = useDispatch();
  const { logs, activeFilter, searchTerm, currentPage, totalPages, loading } = useSelector((state) => state.logs);
  const { darkMode } = useContext(DarkModeContext);
  const [expanded, setExpanded] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };
  
  const handleFilter = (filter) => {
    dispatch(setPage(1)); // Reset to first page on new filter
    dispatch(fetchLogs({ search: debouncedSearchTerm, page: 1, filter }));
  };

  useEffect(() => {
    dispatch(
      fetchLogs({
        search: debouncedSearchTerm,
        page: currentPage,
        filter: activeFilter,
      })
    );
  }, [dispatch, debouncedSearchTerm, activeFilter, currentPage]);

  return (
    <div className={`max-w-7xl mx-auto mt-8 p-4 sm:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        User Action Logs
      </h1>
      <input
  type="text"
  placeholder="Search log actions..."
  value={searchTerm}
  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
  className={`w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
  }`}
/>

      <FilterBox
        sliceName="logs"
        onFilter={handleFilter}
        setActiveFilter={(filter) => dispatch(setActiveFilter(filter))}
        showTypeFilter={false}
        showStatusFilter={false}
        showQuantityFilter={false}
      />

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : logs.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">No logs found for the selected criteria.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={log._id || index} className={`p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white border'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                        <span className="font-bold text-blue-500 dark:text-blue-400">{log.userId?.username || "System"}</span>: {log.action || "No action specified"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown date"}
                    </p>
                  </div>
                  <button onClick={() => toggleExpand(index)} className="mt-2 sm:mt-0 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-xs font-medium rounded-md">
                    {expanded === index ? "Hide Details" : "View Details"}
                  </button>
              </div>
              {expanded === index && (
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 text-sm rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-xs">{log.details || "No details available."}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

// Simple debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default Logs;
