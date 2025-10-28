import React, { useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config.js";
import {
  setSearchTerm,
  setActiveFilter,
  setPage,
  fetchUsers,
} from "../Slices/UserSlice";
import { useSelector, useDispatch } from "react-redux";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import FilterBox from "./FilterBox";
import Spinner from "./Spinner";
import Pagination from "./pagination.jsx";

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ActionButton = ({ to, onClick, 'aria-label': ariaLabel, title, children, className }) => {
  const commonProps = {
    'aria-label': ariaLabel,
    title,
    className: `p-2 rounded-full transition-colors ${className}`,
  };

  if (to) {
    return <Link to={to} {...commonProps}>{children}</Link>;
  }
  return <button onClick={onClick} {...commonProps}>{children}</button>;
};

const UserCard = ({ user, handleDelete, darkMode }) => (
  <div className={`p-4 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl ${darkMode ? "bg-gray-700 border border-gray-600" : "bg-white"}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`font-bold text-lg ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{user.username}</p>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.jobPosition || "No position specified"}</p>
      </div>
      <p className={`font-semibold text-xl capitalize ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
        {user.role}
      </p>
    </div>
    <div className="flex items-center justify-end gap-2 mt-4">
      <ActionButton to={`/user/${user._id}`} aria-label="View user details" title="View Details" className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"><ViewIcon /></ActionButton>
      <ActionButton to={`/user/edit/${user._id}`} aria-label="Edit user" title="Edit User" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon /></ActionButton>
      <ActionButton onClick={() => handleDelete(user._id)} aria-label={`Delete user ${user.username}`} title="Delete User" className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-600"><DeleteIcon /></ActionButton>
    </div>
  </div>
);

const UserTableRow = ({ user, handleDelete, darkMode }) => (
  <tr className={`transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
    <td className="p-4 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">{user.username}</td>
    <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400 capitalize">{user.role}</td>
    <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{user.jobPosition || "N/A"}</td>
    <td className="p-4 flex gap-2 items-center">
      <ActionButton to={`/user/${user._id}`} aria-label="View user details" title="View Details" className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"><ViewIcon /></ActionButton>
      <ActionButton to={`/user/edit/${user._id}`} aria-label="Edit user" title="Edit User" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon /></ActionButton>
      <ActionButton onClick={() => handleDelete(user._id)} aria-label={`Delete user ${user.username}`} title="Delete User" className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-600"><DeleteIcon /></ActionButton>
    </td>
  </tr>
);

const UserList = () => {
  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    users,
    loading,
    error,
    searchTerm,
    activeFilter,
    totalPages,
    currentPage,
  } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, searchTerm, activeFilter }));
  }, [dispatch, currentPage, searchTerm, activeFilter]);

  const handleFilter = (filters) => {
    dispatch(setActiveFilter(filters));
    dispatch(setPage(1));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete user");
        return;
      }

      toast.success("User deleted successfully");
      dispatch(fetchUsers({ page: currentPage, searchTerm, activeFilter }));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error");
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Users
        </h2>
        <Link to="/user/new" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
          Create User
        </Link>
      </header>

      <div className="mb-6">
        <label htmlFor="search-users" className="sr-only">Search by username...</label>
        <input
          id="search-users"
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          className={`border p-3 rounded-lg w-full text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 placeholder-gray-500"}`}
        />
      </div>

      <FilterBox
        onFilter={handleFilter}
        sliceName="users"
        setActiveFilter={setActiveFilter}
        loading={loading}
        showUserBar={false}
        showTypeFilter={false}
        showStatusFilter={false}
        showCategoryFilter={false}
        showQuantityFilter={false}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <p className={`text-lg ${darkMode ? "text-red-400" : "text-red-600"}`}>Error: {error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No users found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:hidden">
            {users.map((user) => <UserCard key={user._id} user={user} handleDelete={handleDelete} darkMode={darkMode} />)}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-lg border dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">Username</th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">Role</th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">Job Position</th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className={darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}>
                {users.map((user) => <UserTableRow key={user._id} user={user} handleDelete={handleDelete} darkMode={darkMode} />)}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <Pagination loading={loading} currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => dispatch(setPage(page))} />
      )}
    </div>
  );
};

export default UserList;