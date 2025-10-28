import React, { useContext, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssueOrderById } from "../Slices/IssueOrderSlice.jsx";
import { toast } from "react-toastify";
import FullPageSpinner from "./FullPageSpinner.jsx";

const IssueOrderView = () => {
  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const { currentIssueOrder: order, loading, error } = useSelector((state) => state.issueOrders);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { id } = useParams();

  const memoizedUser = useMemo(() => user, [user?.userId]);

  useEffect(() => {
    if ((!order || order._id !== id) && memoizedUser?.userId) {
      dispatch(fetchIssueOrderById({ id, user: memoizedUser })).unwrap().catch(err => {
        toast.error(err.message || "Failed to fetch issue order");
      });
    }
  }, [id, dispatch, memoizedUser, order]);

  if (loading) return <FullPageSpinner />;
  if (error) return <div className={`text-center mt-8 p-4 text-lg font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</div>;
  if (!order) return <div className={`text-center mt-8 p-4 text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Issue Order not found.</div>;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Issue Order Details</h1>
           <Link to="/ims/issue-orders" className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>
            &larr; Back to List
          </Link>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
            <div>
              <h2 className="text-xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h2>
              <p className="text-sm text-gray-400">Date: {new Date(order.issueDate).toLocaleDateString()}</p>
            </div>
            {(isAdmin || isManager) && (
              <Link to={`/ims/issue-orders/edit/${order._id}`} className="mt-4 md:mt-0 px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                Edit Order
              </Link>
            )}
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Client Information</h3>
              <p>{order.clientName}</p>
              <p>{order.clientPhone || "No phone provided"}</p>
              {order.customerId?.name && <p className="text-sm text-gray-400">(Customer: {order.customerId.name})</p>}
            </div>
          </div>
          
          {/* Products Table */}
          <div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`text-sm ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <tr>
                    <th className="text-left p-2 font-medium">Product</th>
                    <th className="text-center p-2 font-medium">Quantity</th>
                    <th className="text-right p-2 font-medium">Unit Price</th>
                    <th className="text-right p-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {order.products.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.productId?.name || "Unknown Product"}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">${item.unitPrice?.toFixed(2)}</td>
                      <td className="text-right p-2">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Total */}
          <div className={`flex justify-end mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold">${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IssueOrderView;