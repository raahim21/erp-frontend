import React, { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  setPage,
  setSearchTerm,
} from "../Slices/CustomerSlice.jsx";
import Spinner from "../components/Spinner.jsx";
import Pagination from "../components/Pagination.jsx";
import useDebounce from "../../utils/useDebounce.js";

// --- Icon Components ---

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ViewIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CustomerList = () => {
  const dispatch = useDispatch();
  const {
    customers,
    searchResults,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    error,
  } = useSelector((state) => state.customers);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const memoizedUser = useMemo(() => user, [user?.userId]);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!memoizedUser || !memoizedUser.userId) return;
    dispatch(
      fetchCustomers({
        page: currentPage,
        search: debouncedSearchTerm,
        user: memoizedUser,
      })
    );
  }, [debouncedSearchTerm, currentPage, memoizedUser, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this customer?")) {
      try {
        await dispatch(deleteCustomer({ id, user: memoizedUser })).unwrap();
      } catch (error) {
        // Toast handles error notification
      }
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const displayedCustomers = debouncedSearchTerm.trim() ? searchResults : customers;

  if (error) {
    return (
      <div className={`text-center mt-4 p-4 ${darkMode ? "text-red-400" : "text-red-600"}`}>
        {error}
        <button
          onClick={() =>
            dispatch(
              fetchCustomers({
                page: currentPage,
                search: debouncedSearchTerm,
                user: memoizedUser,
              })
            )
          }
          className={`ml-4 px-4 py-2 rounded font-semibold transition-colors ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-lg shadow-lg ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`}
    >
      <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Customers
        </h2>
        {(isAdmin || isManager) && (
          <Link
            to="/ims/customers/new"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm ${
              darkMode
                ? "bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
                : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            <PlusIcon />
            Add Customer
          </Link>
        )}
      </header>

      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
        </span>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          className={`border p-2 pl-10 rounded-md w-full text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
          }`}
          aria-label="Search customers"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : displayedCustomers.length === 0 ? (
        <div className="text-center py-10">
          <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            No customers found.
          </p>
          {(isAdmin || isManager) && (
            <p className={`mt-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Try adjusting your search or add a new customer.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {displayedCustomers.map((customer) => (
              <div key={customer._id} className={`p-4 rounded-lg shadow-md transition-shadow hover:shadow-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-bold text-lg ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                      {customer.name}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {customer.company || "N/A"}
                    </p>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} space-y-2 text-sm`}>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}><strong>Email:</strong> {customer.email || "N/A"}</p>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}><strong>Phone:</strong> {customer.phone || "N/A"}</p>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}><strong>Tax Number:</strong> {customer.taxNumber || "N/A"}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to={`/ims/customers/${customer._id}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                    <ViewIcon /> View
                  </Link>
                  {(isAdmin || isManager) && (
                    <>
                      <Link to={`/ims/customers/edit/${customer._id}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-200 text-blue-800 hover:bg-blue-300"}`}>
                        <EditIcon /> Edit
                      </Link>
                      <button onClick={() => handleDelete(customer._id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"}`}>
                        <DeleteIcon /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`min-w-full text-sm ${darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}`}>
              <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th scope="col" className="p-3 text-left font-semibold">Name</th>
                  <th scope="col" className="p-3 text-left font-semibold">Company</th>
                  <th scope="col" className="p-3 text-left font-semibold">Email</th>
                  <th scope="col" className="p-3 text-left font-semibold">Phone</th>
                  <th scope="col" className="p-3 text-left font-semibold">Tax Number</th>
                  {(isAdmin || isManager) && <th scope="col" className="p-3 text-left font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}>
                {displayedCustomers.map((customer) => (
                  <tr key={customer._id} className={`${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                    <td className={`p-3 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{customer.name}</td>
                    <td className={`p-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{customer.company || "N/A"}</td>
                    <td className={`p-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{customer.email || "N/A"}</td>
                    <td className={`p-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{customer.phone || "N/A"}</td>
                    <td className={`p-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{customer.taxNumber || "N/A"}</td>
                    {(isAdmin || isManager) && (
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link to={`/ims/customers/${customer._id}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`} aria-label={`View ${customer.name}`}>
                            <ViewIcon /> View
                          </Link>
                          <Link to={`/ims/customers/edit/${customer._id}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-200 text-blue-800 hover:bg-blue-300"}`} aria-label={`Edit ${customer.name}`}>
                            <EditIcon /> Edit
                          </Link>
                          <button onClick={() => handleDelete(customer._id)} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"}`} aria-label={`Delete ${customer.name}`}>
                            <DeleteIcon /> Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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

export default CustomerList;
