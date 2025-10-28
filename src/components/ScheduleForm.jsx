// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import { API_BASE_URL } from "../../config";
// import {
//   fetchSchedule,
//   createSchedule,
//   updateSchedule,
//   updateFormData,
//   resetFormData,
//   addShift,
//   removeShift,
//   updateShift,
//   addRequiredPosition,
//   removeRequiredPosition,
//   updateRequiredPosition,
//   assignEmployeeToShift,
//   unassignEmployeeFromShift,
//   updateEmployeeInShift,
// } from "../Slices/ScheduleSlice";

// // --- SVG Icon Components ---
// const FiPlus = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
// const FiTrash2 = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// const ScheduleForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { formData, loading, error } = useSelector((state) => state.schedule);
//   const [users, setUsers] = useState([]);
//   const [isUsersLoading, setIsUsersLoading] = useState(true);
//   const [jobPositions, setJobPositions] = useState([]);

//   useEffect(() => {
//     const fetchAllUsers = async () => {
//         setIsUsersLoading(true);
//         try {
//             const response = await fetch(`${API_BASE_URL}/api/auth/users/list`, { credentials: 'include' });

//             if (response.ok) {
//                 const data = await response.json();
//                 setUsers(data || []);
//             } else {
//                 console.error("Failed to fetch users");
//                 setUsers([]);
//             }
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             setUsers([]);
//         } finally {
//             setIsUsersLoading(false);
//         }
//     };

//     fetchAllUsers();

//     if (id) {
//       dispatch(fetchSchedule(id));
//     } else {
//       dispatch(resetFormData());
//     }
//   }, [id, dispatch]);

//   useEffect(() => {
//     if (users.length > 0) {
//       const positions = [...new Set(users.map(u => u.jobPosition).filter(Boolean))];
//       setJobPositions(positions);
//     }
//   }, [users]);

//   const handleChange = (e) => {
//     dispatch(updateFormData({ field: e.target.name, value: e.target.value }));
//   };

//   const handleShiftChange = (shiftIndex, field, value) => {
//     dispatch(updateShift({ shiftIndex, field, value }));
//   };

//   const handleRequiredPositionChange = (shiftIndex, posIndex, field, value) => {
//     dispatch(updateRequiredPosition({ shiftIndex, posIndex, field, value }));
//   };

//   const handleEmployeeTimeChange = (shiftIndex, empIndex, field, value) => {
//     dispatch(updateEmployeeInShift({ shiftIndex, empIndex, field, value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const scheduleData = JSON.parse(JSON.stringify(formData));
    
//     scheduleData.shifts?.forEach(shift => {
//       shift.assignedEmployees?.forEach(emp => {
//         emp.status = emp.status || 'absent';
//         emp.enterIn = emp.enterIn || '';
//         emp.exitOut = emp.exitOut || '';
//       });
//     });

//     if (id) {
//       dispatch(updateSchedule({ id, ...scheduleData })).then((result) => {
//         if (updateSchedule.fulfilled.match(result)) {
//           navigate(`/hr/schedules/${id}`);
//         }
//       });
//     } else {
//       dispatch(createSchedule(scheduleData)).then((result) => {
//         if (createSchedule.fulfilled.match(result)) {
//           navigate("/hr/schedules");
//         }
//       });
//     }
//   };
  
//   const userOptions = users.map((user) => ({
//     value: user._id,
//     label: `${user.username} (${user.jobPosition || 'N/A'})`,
//     user,
//   }));

//   const isDarkMode = document.documentElement.classList.contains('dark');

//   const selectStyles = {
//     control: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#374151' : 'white', borderColor: isDarkMode ? '#4b5563' : '#d1d5db', minHeight: '42px', boxShadow: 'none', '&:hover': { borderColor: isDarkMode ? '#6b7280' : '#a5b4fc' } }),
//     menu: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#374151' : 'white', zIndex: 20 }),
//     option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? (isDarkMode ? '#4b5563' : '#eef2ff') : 'transparent', color: isDarkMode ? '#e5e7eb' : '#111827', ':active': { backgroundColor: '#4338ca' }}),
//     singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#e5e7eb' : '#111827' }),
//     input: (provided) => ({ ...provided, color: isDarkMode ? '#e5e7eb' : '#111827' })
//   };
  
//   const formInputClass = "block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white px-3 py-2";

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
//       <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
//         <header className="mb-8">
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{id ? "Edit Schedule" : "Create New Schedule"}</h1>
//             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage schedule details, shifts, and employee assignments.</p>
//         </header>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Schedule Details Card */}
//           <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Schedule Details</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
//                 <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`${formInputClass} mt-1`} placeholder="e.g., Q3 Holiday Coverage" />
//               </div>
//               <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
//                 <select name="status" id="status" value={formData.status} onChange={handleChange} className={`${formInputClass} mt-1`}>
//                   <option value="draft">Draft</option>
//                   <option value="published">Published</option>
//                   <option value="archived">Archived</option>
//                 </select>
//               </div>
//               <div>
//                 <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
//                 <input type="date" name="startDate" id="startDate" value={(formData.startDate || "").split('T')[0]} onChange={handleChange} required className={`${formInputClass} mt-1`} />
//               </div>
//               <div>
//                 <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
//                 <input type="date" name="endDate" id="endDate" value={(formData.endDate || "").split('T')[0]} onChange={handleChange} required className={`${formInputClass} mt-1`} />
//               </div>
//               <div className="md:col-span-2">
//                 <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
//                 <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} className={`${formInputClass} mt-1`} placeholder="Add any relevant notes for this schedule..."></textarea>
//               </div>
//             </div>
//           </div>

//           {/* Shifts Section Card */}
//           <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
//             <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
//               <h2 className="text-xl font-semibold">Shifts</h2>
//               <button type="button" onClick={() => dispatch(addShift())} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"><FiPlus /> Add Shift</button>
//             </div>
//             <div className="space-y-6">
//               {formData.shifts.map((shift, shiftIndex) => (
//                 <div key={shift._id || shiftIndex} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
//                   <div className="flex justify-between items-center mb-4">
//                     <input type="date" value={(shift.date || "").split('T')[0]} onChange={(e) => handleShiftChange(shiftIndex, 'date', e.target.value)} required className={`${formInputClass} w-auto`} />
//                     <button type="button" onClick={() => dispatch(removeShift(shiftIndex))} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full"><FiTrash2 size="1.2em" /></button>
//                   </div>
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
//                     <div className="space-y-3">
//                         <h4 className="font-medium text-gray-600 dark:text-gray-300">Required Positions</h4>
//                         {shift.requiredPositions.map((pos, posIndex) => (
//                             <div key={posIndex} className="flex items-center gap-2">
//                                 <select value={pos.jobPosition} onChange={(e) => handleRequiredPositionChange(shiftIndex, posIndex, 'jobPosition', e.target.value)} className={`${formInputClass}`}>
//                                     <option value="">Select Position...</option>
//                                     {jobPositions.map(jp => <option key={jp} value={jp}>{jp}</option>)}
//                                 </select>
//                                 <input type="number" value={pos.count} min="1" onChange={(e) => handleRequiredPositionChange(shiftIndex, posIndex, 'count', parseInt(e.target.value, 10) || 1)} className={`${formInputClass} w-24`} />
//                                 <button type="button" onClick={() => dispatch(removeRequiredPosition({shiftIndex, posIndex}))} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors"><FiTrash2 /></button>
//                             </div>
//                         ))}
//                         <button type="button" onClick={() => dispatch(addRequiredPosition({shiftIndex}))} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 pt-1"><FiPlus /> Add Position</button>
//                     </div>
//                     <div className="space-y-3">
//                         <h4 className="font-medium text-gray-600 dark:text-gray-300">Assigned Employees</h4>
//                         <Select
//                             options={userOptions.filter(opt => !shift.assignedEmployees.some(ae => ae.user._id === opt.value))}
//                             onChange={(selected) => dispatch(assignEmployeeToShift({ shiftIndex, employee: selected.user }))}
//                             placeholder="Add employee to shift..."
//                             isLoading={isUsersLoading}
//                             styles={selectStyles}
//                             className="text-sm"
//                         />
//                         <div className="space-y-3">
//                             {shift.assignedEmployees.map((emp, empIndex) => (
//                                 <div key={emp.user._id} className="px-4 py-3 bg-white dark:bg-gray-700/60 rounded-lg flex flex-wrap items-center justify-between gap-4 border dark:border-gray-200 dark:border-gray-600/50">
//                                     <span className="font-medium text-gray-800 dark:text-gray-200">{emp.user.username}</span>
//                                     <div className="flex items-center gap-2 flex-wrap">
//                                         <input type="time" value={emp.startTime} onChange={(e) => handleEmployeeTimeChange(shiftIndex, empIndex, 'startTime', e.target.value)} required className={`${formInputClass} w-36`} />
//                                         <span className="text-gray-500 dark:text-gray-400">-</span>
//                                         <input type="time" value={emp.endTime} onChange={(e) => handleEmployeeTimeChange(shiftIndex, empIndex, 'endTime', e.target.value)} required className={`${formInputClass} w-36`} />
//                                         <button type="button" onClick={() => dispatch(unassignEmployeeFromShift({shiftIndex, empIndex}))} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors"><FiTrash2 /></button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               {formData.shifts.length === 0 && (
//                 <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
//                   <p className="font-medium">No shifts added yet.</p>
//                   <p className="text-sm mt-1">Click "Add Shift" to get started.</p>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {error && <div className="text-red-600 dark:text-red-400 text-sm p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 pt-4">
//             <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
//             <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
//               {loading ? "Saving..." : (id ? "Update Schedule" : "Create Schedule")}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ScheduleForm;


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { API_BASE_URL } from "../../config";
import {
  fetchSchedule,
  createSchedule,
  updateSchedule,
  updateFormData,
  resetFormData,
  addShift,
  removeShift,
  updateShift,
  addRequiredPosition,
  removeRequiredPosition,
  updateRequiredPosition,
  assignEmployeeToShift,
  unassignEmployeeFromShift,
  updateEmployeeInShift,
} from "../Slices/ScheduleSlice";

// --- SVG Icon Components ---
const FiPlus = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FiTrash2 = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const FiClock = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const FiUsers = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const FiBriefcase = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

const ScheduleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { formData, loading, error } = useSelector((state) => state.schedule);
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [jobPositions, setJobPositions] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsUsersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/users/list`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUsers(data || []);
        } else {
          console.error("Failed to fetch users");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchAllUsers();

    if (id) {
      dispatch(fetchSchedule(id));
    } else {
      dispatch(resetFormData());
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (users.length > 0) {
      const positions = [...new Set(users.map(u => u.jobPosition).filter(Boolean))];
      setJobPositions(positions);
    }
  }, [users]);

  const handleChange = (e) => {
    dispatch(updateFormData({ field: e.target.name, value: e.target.value }));
  };

  const handleShiftChange = (shiftIndex, field, value) => {
    dispatch(updateShift({ shiftIndex, field, value }));
  };

  const handleRequiredPositionChange = (shiftIndex, posIndex, field, value) => {
    dispatch(updateRequiredPosition({ shiftIndex, posIndex, field, value }));
  };

  const handleEmployeeTimeChange = (shiftIndex, empIndex, field, value) => {
    dispatch(updateEmployeeInShift({ shiftIndex, empIndex, field, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduleData = JSON.parse(JSON.stringify(formData));
    
    scheduleData.shifts?.forEach(shift => {
      shift.assignedEmployees?.forEach(emp => {
        emp.status = emp.status || 'absent';
        emp.enterIn = emp.enterIn || '';
        emp.exitOut = emp.exitOut || '';
      });
    });

    if (id) {
      dispatch(updateSchedule({ id, ...scheduleData })).then((result) => {
        if (updateSchedule.fulfilled.match(result)) {
          navigate(`/hr/schedules/${id}`);
        }
      });
    } else {
      dispatch(createSchedule(scheduleData)).then((result) => {
        if (createSchedule.fulfilled.match(result)) {
          navigate("/hr/schedules");
        }
      });
    }
  };
  
  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.username} (${user.jobPosition || 'N/A'})`,
    user,
  }));

  const isDarkMode = document.documentElement.classList.contains('dark');

  const selectStyles = {
    control: (provided) => ({ 
      ...provided, 
      backgroundColor: isDarkMode ? '#1f2937' : 'white', 
      borderColor: isDarkMode ? '#4b5563' : '#d1d5db', 
      minHeight: '42px', 
      boxShadow: 'none', 
      '&:hover': { borderColor: isDarkMode ? '#6b7280' : '#a5b4fc' },
      borderRadius: '0.375rem',
    }),
    menu: (provided) => ({ 
      ...provided, 
      backgroundColor: isDarkMode ? '#1f2937' : 'white', 
      zIndex: 20,
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    option: (provided, state) => ({ 
      ...provided, 
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? (isDarkMode ? '#374151' : '#eef2ff') : 'transparent', 
      color: state.isSelected ? 'white' : isDarkMode ? '#d1d5db' : '#111827', 
      ':active': { backgroundColor: '#4338ca' },
      padding: '0.5rem 1rem',
    }),
    singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#e5e7eb' : '#111827' }),
    input: (provided) => ({ ...provided, color: isDarkMode ? '#e5e7eb' : '#111827' }),
    placeholder: (provided) => ({ ...provided, color: isDarkMode ? '#9ca3af' : '#6b7280' }),
  };
  
  const formInputClass = "block w-full rounded-md border-0 py-2 px-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:leading-6 shadow-sm";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{id ? "Edit Schedule" : "Create New Schedule"}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage schedule details, shifts, required positions, and employee assignments below.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Schedule Details Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock className="text-indigo-600 dark:text-indigo-400" />
                Schedule Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={formInputClass} placeholder="e.g., Q3 Holiday Coverage" />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" id="status" value={formData.status} onChange={handleChange} className={formInputClass}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input type="date" name="startDate" id="startDate" value={(formData.startDate || "").split('T')[0]} onChange={handleChange} required className={formInputClass} />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" name="endDate" id="endDate" value={(formData.endDate || "").split('T')[0]} onChange={handleChange} required className={formInputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} className={formInputClass} placeholder="Add any relevant notes for this schedule..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Shifts Section Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiClock className="text-indigo-600 dark:text-indigo-400" />
                  Shifts
                </h2>
                <button type="button" onClick={() => dispatch(addShift())} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  <FiPlus />
                  Add Shift
                </button>
              </div>
              <div className="space-y-6">
                {formData.shifts.map((shift, shiftIndex) => (
                  <div key={shift._id || shiftIndex} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shift Date</label>
                        <input type="date" value={(shift.date || "").split('T')[0]} onChange={(e) => handleShiftChange(shiftIndex, 'date', e.target.value)} required className={`${formInputClass} w-48`} />
                      </div>
                      <button type="button" onClick={() => dispatch(removeShift(shiftIndex))} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <FiTrash2 size="1.25em" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <FiBriefcase className="text-indigo-600 dark:text-indigo-400" />
                          Required Positions
                        </h4>
                        {shift.requiredPositions.map((pos, posIndex) => (
                          <div key={posIndex} className="flex items-center gap-3">
                            <select value={pos.jobPosition} onChange={(e) => handleRequiredPositionChange(shiftIndex, posIndex, 'jobPosition', e.target.value)} className={formInputClass}>
                              <option value="">Select Position</option>
                              {jobPositions.map(jp => <option key={jp} value={jp}>{jp}</option>)}
                            </select>
                            <input type="number" value={pos.count} min="1" onChange={(e) => handleRequiredPositionChange(shiftIndex, posIndex, 'count', parseInt(e.target.value, 10) || 1)} className={`${formInputClass} w-20 text-center`} />
                            <button type="button" onClick={() => dispatch(removeRequiredPosition({shiftIndex, posIndex}))} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <FiTrash2 size="1.1em" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => dispatch(addRequiredPosition({shiftIndex}))} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1">
                          <FiPlus size="1.1em" />
                          Add Position
                        </button>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <FiUsers className="text-indigo-600 dark:text-indigo-400" />
                          Assigned Employees
                        </h4>
                        <Select
                          options={userOptions.filter(opt => !shift.assignedEmployees.some(ae => ae.user._id === opt.value))}
                          onChange={(selected) => dispatch(assignEmployeeToShift({ shiftIndex, employee: selected.user }))}
                          placeholder="Search and add employee..."
                          isLoading={isUsersLoading}
                          styles={selectStyles}
                          className="text-sm"
                        />
                        <div className="space-y-3">
                          {shift.assignedEmployees.map((emp, empIndex) => (
                            <div key={emp.user._id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-between gap-4 border border-gray-200 dark:border-gray-600">
                              <span className="font-medium text-gray-900 dark:text-white flex-1">{emp.user.username} <span className="text-gray-500 dark:text-gray-400 text-sm">({emp.user.jobPosition || 'N/A'})</span></span>
                              <div className="flex items-center gap-2">
                                <input type="time" value={emp.startTime} onChange={(e) => handleEmployeeTimeChange(shiftIndex, empIndex, 'startTime', e.target.value)} required className={`${formInputClass} w-32`} />
                                <span className="text-gray-500 dark:text-gray-400">to</span>
                                <input type="time" value={emp.endTime} onChange={(e) => handleEmployeeTimeChange(shiftIndex, empIndex, 'endTime', e.target.value)} required className={`${formInputClass} w-32`} />
                                <button type="button" onClick={() => dispatch(unassignEmployeeFromShift({shiftIndex, empIndex}))} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                  <FiTrash2 size="1.1em" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {formData.shifts.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <FiClock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="font-medium mt-4">No shifts added yet</p>
                    <p className="text-sm mt-1">Click "Add Shift" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="text-red-600 dark:text-red-400 text-sm p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-sm">{typeof error === 'object' ? JSON.stringify(error) : error}</div>}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {loading ? "Saving..." : (id ? "Update Schedule" : "Create Schedule")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;