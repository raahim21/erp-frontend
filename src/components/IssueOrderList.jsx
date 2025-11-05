import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIssueOrders,
  deleteIssueOrder,
  setPage,
  setSearchTerm,
  clearError,
  setActiveFilter,
} from "../Slices/IssueOrderSlice.jsx";
import Spinner from "../components/Spinner.jsx";
import Pagination from "../components/Pagination.jsx";
import useDebounce from "../../utils/useDebounce.js";
import FilterBox from "../components/FilterBox.jsx"; // Ensure this path is correct for your project structure

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

const OrderCard = ({ order, isAdminOrManager, handleDelete, darkMode }) => (
  <div className={`p-4 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl ${darkMode ? "bg-gray-700 border border-gray-600" : "bg-white"}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`font-bold text-lg ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{order.clientName}</p>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{new Date(order.issueDate).toLocaleDateString()}</p>
      </div>
      <p className={`font-semibold text-xl ${darkMode ? "text-green-400" : "text-green-600"}`}>
        ${order.totalAmount?.toFixed(2)}
      </p>
    </div>
    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
      <span className="font-medium text-gray-700 dark:text-gray-200">Products: </span>
      {order.products.map(p => p.productId?.name || 'N/A').join(', ')}
    </div>
    <div className="flex items-center justify-end gap-2 mt-4">
      <ActionButton to={`/ims/issue-orders/${order._id}`} aria-label="View order details" title="View Details" className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"><ViewIcon /></ActionButton>
      {isAdminOrManager && (
        <>
          <ActionButton to={`/ims/issue-orders/edit/${order._id}`} aria-label="Edit order" title="Edit Order" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon /></ActionButton>
          <ActionButton onClick={() => handleDelete(order._id, order.clientName)} aria-label={`Delete order for ${order.clientName}`} title="Delete Order" className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-600"><DeleteIcon /></ActionButton>
        </>
      )}
    </div>
  </div>
);

const OrderTableRow = ({ order, isAdminOrManager, handleDelete, darkMode }) => (
  <tr className={`transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
    <td className="p-4 whitespace-nowrap text-gray-800 dark:text-gray-200 font-medium">{order.clientName}</td>
    <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{order.clientPhone || "N/A"}</td>
    <td className="p-4 truncate max-w-xs text-gray-600 dark:text-gray-400">{order.products.map(p => `${p.productId?.name || "N/A"} (x${p.quantity})`).join(", ")}</td>
    <td className="p-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">${order.totalAmount?.toFixed(2)}</td>
    <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{new Date(order.issueDate).toLocaleDateString()}</td>
    {isAdminOrManager && (
      <td className="p-4 flex gap-2 items-center">
        <ActionButton to={`/ims/issue-orders/${order._id}`} aria-label="View order details" title="View Details" className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"><ViewIcon /></ActionButton>
        <ActionButton to={`/ims/issue-orders/edit/${order._id}`} aria-label="Edit order" title="Edit Order" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon /></ActionButton>
        <ActionButton onClick={() => handleDelete(order._id, order.clientName)} aria-label={`Delete order for ${order.clientName}`} title="Delete Order" className="text-red-500 hover:bg-red-100 dark:hover:bg-gray-600"><DeleteIcon /></ActionButton>
      </td>
    )}
  </tr>
);

const IssueOrderList = () => {
  const dispatch = useDispatch();
  const {
    issueOrders,
    searchResults,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    error,
    activeFilter,
  } = useSelector((state) => state.issueOrders);
  const { isAdmin, isManager } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    dispatch(
      fetchIssueOrders({
        page: currentPage,
        search: debouncedSearchTerm,
        ...activeFilter,
      })
    );
  }, [debouncedSearchTerm, currentPage, activeFilter, dispatch]);

  const handleDelete = async (id, clientName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the order for ${clientName}? This will restore stock levels.`
      )
    ) {
      try {
        await dispatch(deleteIssueOrder(id)).unwrap();
      } catch (err) {
        console.error("Failed to delete issue order:", err);
      }
    }
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(
      fetchIssueOrders({
        page: currentPage,
        search: debouncedSearchTerm,
        ...activeFilter,
      })
    );
  };

  const handlePageChange = (page) => dispatch(setPage(page));
  const displayedIssueOrders = debouncedSearchTerm.trim()
    ? searchResults
    : issueOrders;

  if (error && !loading) {
    return (
      <div
        className={`text-center mt-8 p-6 rounded-lg ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <p
          className={`mb-4 text-lg ${
            darkMode ? "text-red-400" : "text-red-600"
          }`}
        >
          Error: {error}
        </p>
        <button
          onClick={handleRetry}
          className="px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-xl shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2
          className={`text-3xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Issue Orders
        </h2>
        {(isAdmin || isManager) && (
          <Link
            to="/ims/issue-orders/new"
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Create Issue Order
          </Link>
        )}
      </header>

      <div className="mb-6">
        <label htmlFor="search-orders" className="sr-only">
          Search by client name or phone...
        </label>
        <input
          id="search-orders"
          type="text"
          placeholder="Search by client name or phone..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          className={`border p-3 rounded-lg w-full text-sm ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 placeholder-gray-500"
          }`}
        />
      </div>

      <FilterBox
        onFilter={() => dispatch(setPage(1))}
        sliceName="issueOrders"
        setActiveFilter={setActiveFilter}
        loading={loading}
        showUserBar={false}
        showTypeFilter={false}
        showStatusFilter={false}
        showCategoryFilter={false}
        showQuantityFilter={false}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : displayedIssueOrders.length === 0 ? (
        <div
          className={`text-center py-12 rounded-lg ${
            darkMode ? "bg-gray-700/50" : "bg-gray-100"
          }`}
        >
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No issue orders found.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:hidden">
            {displayedIssueOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isAdminOrManager={isAdmin || isManager}
                handleDelete={handleDelete}
                darkMode={darkMode}
              />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-lg border dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead
                className={`${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Client Name
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Phone
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Products
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Total
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Date
                  </th>
                  {(isAdmin || isManager) && (
                    <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody
                className={
                  darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"
                }
              >
                {displayedIssueOrders.map((order) => (
                  <OrderTableRow
                    key={order._id}
                    order={order}
                    isAdminOrManager={isAdmin || isManager}
                    handleDelete={handleDelete}
                    darkMode={darkMode}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <Pagination
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default IssueOrderList;