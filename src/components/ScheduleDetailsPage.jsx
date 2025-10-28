import React, { useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchedule } from "../Slices/ScheduleSlice.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import ShiftCard from "./ShiftCard.jsx";

// --- SVG Icon Components ---
const FiArrowLeft = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const FiEdit = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const ScheduleDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { darkMode } = useContext(DarkModeContext);
  const { formData: schedule, loading, error } = useSelector((state) => state.schedule);

  useEffect(() => {
    dispatch(fetchSchedule(id));
  }, [dispatch, id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "draft":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold">{schedule.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                </p>
            </div>
            <span className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(schedule.status)}`}>
                {schedule.status}
            </span>
        </div>
        
        {schedule.notes && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Notes:</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{schedule.notes}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
            <Link
                to="/hr/schedules"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
                <FiArrowLeft />
                Back to List
            </Link>
            <Link
                to={`/hr/schedules/edit/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
                <FiEdit />
                Edit Schedule
            </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Shifts</h2>
        <div className="space-y-4">
            {schedule.shifts && schedule.shifts.length > 0 ? (
                schedule.shifts.map((shift, index) => <ShiftCard key={shift._id || index} shift={shift} />)
            ) : (
                <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No shifts found for this schedule.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsPage;