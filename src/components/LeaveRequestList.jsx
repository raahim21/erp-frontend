import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaveRequests, updateLeaveRequestStatus } from "../Slices/LeaveSlice";

const LeaveRequestList = () => {
    const dispatch = useDispatch();
    const { requests, loading } = useSelector((state) => state.leave);

    useEffect(() => {
        dispatch(fetchLeaveRequests());
    }, [dispatch]);

    const handleStatusUpdate = (id, status) => {
        dispatch(updateLeaveRequestStatus({ id, status }));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "Denied":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case "Pending":
            default:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        }
    };
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Leave Requests</h1>
            {loading && <p>Loading requests...</p>}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {requests.length > 0 ? requests.map((request) => (
                            <tr key={request._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{request.user?.username || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{request.leaveType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300 max-w-xs">{request.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {request.status === "Pending" && (
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleStatusUpdate(request._id, 'Approved')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">Approve</button>
                                            <button onClick={() => handleStatusUpdate(request._id, 'Denied')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Deny</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                          <tr>
                            <td colSpan="6" className="text-center py-4">No leave requests found.</td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveRequestList;
