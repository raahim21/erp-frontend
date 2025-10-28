

// import React, { useEffect, useState, useContext } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { fetchSchedules, deleteSchedule, setSearchTerm, setCurrentPage } from '../Slices/ScheduleSlice.jsx';
// import Spinner from '../components/Spinner.jsx';
// import { DarkModeContext } from '../context/DarkmodeContext.jsx';
// import { FiPlus, FiEye, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

// const ScheduleList = () => {
//     const dispatch = useDispatch();
//     const { schedules, loading, totalPages, currentPage, searchTerm } = useSelector(state => state.schedule);
//     const { darkMode } = useContext(DarkModeContext);
//     const [statusFilter, setStatusFilter] = useState('');

//     useEffect(() => {
//         dispatch(fetchSchedules({ page: currentPage, filters: { search: searchTerm, status: statusFilter } }));
//     }, [dispatch, currentPage, searchTerm, statusFilter]);

//     const handleSearch = (e) => {
//         dispatch(setSearchTerm(e.target.value));
//     };

//     const handlePageChange = (page) => {
//         dispatch(setCurrentPage(page));
//     };
    
//     const handleDelete = (id) => {
//         if (window.confirm('Are you sure you want to delete this schedule?')) {
//             dispatch(deleteSchedule(id));
//         }
//     };

//     return (
//         <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
//             <div className={`rounded-xl shadow-2xl p-6 sm:p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
//                     <h1 className="text-2xl sm:text-3xl font-bold">Schedules</h1>
//                     <Link to="/hr/schedules/new" className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
//                         <FiPlus className="mr-2" /> Create Schedule
//                     </Link>
//                 </div>
                
//                 <div className="flex flex-col sm:flex-row gap-4 mb-6">
//                     <div className="relative flex-grow">
//                         <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                         <input 
//                             type="text"
//                             placeholder="Search schedules by name..."
//                             value={searchTerm}
//                             onChange={handleSearch}
//                             className={`w-full pl-10 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100' : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
//                         />
//                     </div>
//                     <select 
//                         value={statusFilter} 
//                         onChange={e => setStatusFilter(e.target.value)}
//                         className={`py-2.5 px-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
//                     >
//                         <option value="">All Statuses</option>
//                         <option value="draft">Draft</option>
//                         <option value="published">Published</option>
//                         <option value="archived">Archived</option>
//                     </select>
//                 </div>

//                 {loading ? <div className="flex justify-center items-center h-32"><Spinner /></div> : (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                             <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                                 <tr>
//                                     <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
//                                     <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Dates</th>
//                                     <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Status</th>
//                                     <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                                 {schedules.map(schedule => (
//                                     <tr key={schedule._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
//                                         <td className="px-4 py-4 whitespace-nowrap">
//                                             <div className="font-medium text-sm">{schedule.name}</div>
//                                             <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
//                                                 {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
//                                             </div>
//                                             <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden mt-1">
//                                                 <span className={`px-2 py-1 rounded-full text-xs ${
//                                                     schedule.status === 'published' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 
//                                                     schedule.status === 'draft' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 
//                                                     'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
//                                                 }`}>
//                                                     {schedule.status}
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
//                                             {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
//                                         </td>
//                                         <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
//                                             <span className={`px-2 py-1 rounded-full text-xs ${
//                                                 schedule.status === 'published' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 
//                                                 schedule.status === 'draft' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 
//                                                 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
//                                             }`}>
//                                                 {schedule.status}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//                                             <div className="flex items-center gap-3">
//                                                 <Link to={`/hr/schedules/${schedule._id}`} title="View" className="text-blue-500 hover:text-blue-700">
//                                                     <FiEye />
//                                                 </Link>
//                                                 <Link to={`/hr/schedules/edit/${schedule._id}`} title="Edit" className="text-green-500 hover:text-green-700">
//                                                     <FiEdit />
//                                                 </Link>
//                                                 <button onClick={() => handleDelete(schedule._id)} title="Delete" className="text-red-500 hover:text-red-700">
//                                                     <FiTrash2 />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         {schedules.length === 0 && (
//                             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                                 No schedules found.
//                             </div>
//                         )}
//                     </div>
//                 )}
                
//                 {/* Pagination */}
//                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
//                     <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
//                     >
//                         Previous
//                     </button>
//                     <span className="text-sm">Page {currentPage} of {totalPages}</span>
//                     <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ScheduleList;


import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSchedules, deleteSchedule, setSearchTerm, setCurrentPage } from '../Slices/ScheduleSlice.jsx';
import Spinner from '../components/Spinner.jsx';
import { DarkModeContext } from '../context/DarkmodeContext.jsx';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const ScheduleList = () => {
    const dispatch = useDispatch();
    const { schedules, loading, totalPages, currentPage, searchTerm } = useSelector(state => state.schedule);
    const { darkMode } = useContext(DarkModeContext);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        dispatch(fetchSchedules({ page: currentPage, filters: { search: searchTerm, status: statusFilter } }));
    }, [dispatch, currentPage, searchTerm, statusFilter]);

    const handleSearch = (e) => {
        dispatch(setSearchTerm(e.target.value));
    };

    const handlePageChange = (page) => {
        dispatch(setCurrentPage(page));
    };
    
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            dispatch(deleteSchedule(id));
        }
    };

    return (
        <div className={`p-2 sm:p-4 md:p-6 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`max-w-7xl mx-auto rounded-xl shadow-2xl p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Schedules</h1>
                    <Link to="/hr/schedules/new" className="w-full sm:w-auto bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base">
                        <FiPlus className="mr-1 sm:mr-2" /> Create Schedule
                    </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                        <input 
                            type="text"
                            placeholder="Search schedules by name..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className={`w-full pl-7 sm:pl-10 py-2 sm:py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100' : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                    </div>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {loading ? <div className="flex justify-center items-center h-24 sm:h-32"><Spinner /></div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Dates</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Status</th>
                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {schedules.map(schedule => (
                                    <tr key={schedule._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                            <div className="font-medium text-sm">{schedule.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                                                {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden mt-1">
                                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                                                    schedule.status === 'published' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 
                                                    schedule.status === 'draft' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 
                                                    'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {schedule.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                                                schedule.status === 'published' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 
                                                schedule.status === 'draft' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 
                                                'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {schedule.status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Link to={`/hr/schedules/${schedule._id}`} title="View" className="text-blue-500 hover:text-blue-700">
                                                    <FiEye className="text-base sm:text-lg" />
                                                </Link>
                                                <Link to={`/hr/schedules/edit/${schedule._id}`} title="Edit" className="text-green-500 hover:text-green-700">
                                                    <FiEdit className="text-base sm:text-lg" />
                                                </Link>
                                                <button onClick={() => handleDelete(schedule._id)} title="Delete" className="text-red-500 hover:text-red-700">
                                                    <FiTrash2 className="text-base sm:text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {schedules.length === 0 && (
                            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                No schedules found.
                            </div>
                        )}
                    </div>
                )}
                
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3 sm:gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto text-sm sm:text-base"
                    >
                        Previous
                    </button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-gray-200 dark:bg-gray-600 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto text-sm sm:text-base"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleList;