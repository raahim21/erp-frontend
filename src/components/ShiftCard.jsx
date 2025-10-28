import React, { useContext } from "react";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

const ShiftCard = ({ shift }) => {
  const { darkMode } = useContext(DarkModeContext);

  const getAttendanceStatusBadge = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "absent":
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className={`p-4 border-b ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}`}>
        <h3 className="font-bold text-lg">
          Shift on {new Date(shift.date).toLocaleDateString()}
        </h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Required Positions</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {shift.requiredPositions?.map((pos, index) => (
              <li key={index}>
                {pos.count} x {pos.jobPosition}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Assigned Employees</h4>
          {shift.assignedEmployees?.length > 0 ? (
            <div className="space-y-2">
              {shift.assignedEmployees.map((emp, index) => (
                <div key={emp.user?._id || index} className={`p-2 rounded-md flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div>
                        <p className="font-medium text-sm">{emp.user?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{emp.user?.jobPosition}</p>
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">{emp.startTime} - {emp.endTime}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getAttendanceStatusBadge(emp.status)}`}>
                        {emp.status}
                    </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No employees assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;