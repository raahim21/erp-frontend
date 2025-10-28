import React, { useContext, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchPurchaseById } from "../Slices/PurchaseSlice.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FullPageSpinner from "./FullPageSpinner.jsx";

const PurchaseView = () => {
  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const {
    currentPurchase: purchase,
    loading,
    error,
  } = useSelector((state) => state.purchases);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const memoizedUser = useMemo(() => user, [user?.userId]);

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        if (!memoizedUser || !memoizedUser.userId) {
          throw new Error("User not authenticated");
        }
        await dispatch(fetchPurchaseById({ id, user: memoizedUser })).unwrap();
      } catch (err) {
        console.error("PurchaseView: Error fetching purchase:", err.message);
        toast.error(err.message || "Failed to fetch purchase");
      }
    };
    if (!purchase || purchase._id !== id) {
      loadPurchase();
    }
  }, [id, dispatch, memoizedUser, purchase]);

  if (loading) return <FullPageSpinner />;
  if (error)
    return (
      <div
        className={`text-center mt-8 p-4 text-lg font-medium ${
          darkMode ? "text-red-400" : "text-red-600"
        }`}
      >
        {error}
      </div>
    );
  if (!purchase)
    return (
      <div
        className={`text-center mt-8 p-4 text-lg font-medium ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Purchase not found.
      </div>
    );

  const getParty = () => {
    if (purchase.type === "Vendor") return purchase.vendorId?.name || "N/A";
    if (purchase.type === "Internal") return purchase.department || "N/A";
    if (purchase.type === "Transfer")
      return `${purchase.fromLocation?.name || "N/A"} → ${
        purchase.toLocation?.name || "N/A"
      }`;
    return "N/A";
  };

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } transition-colors duration-300`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={darkMode ? "dark" : "light"}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Purchase Details
          </h1>
          <Link
            to="/ims/purchases"
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Back to Purchases
          </Link>
        </div>

        {/* Purchase Card */}
        <div
          className={`p-3 sm:p-6 rounded-xl shadow-lg border transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="grid gap-4 sm:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Type
                </span>
                <span className="text-base sm:text-lg">{purchase.type || "N/A"}</span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Party
                </span>
                <span className="text-base sm:text-lg">{getParty()}</span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Product
                </span>
                <span className="text-base sm:text-lg">
                  {purchase.productId?.name || "Unknown Product"}
                </span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Quantity
                </span>
                <span className="text-base sm:text-lg">{purchase.quantity || "N/A"}</span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Total Price
                </span>
                <span className="text-base sm:text-lg">
                  ${purchase.totalPrice?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Purchase Date
                </span>
                <span className="text-base sm:text-lg">
                  {purchase.purchaseDate
                    ? new Date(purchase.purchaseDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </span>
              </div>
              <div>
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Status
                </span>
                <span
                  className={`text-base sm:text-lg capitalize ${
                    purchase.status === "Completed"
                      ? darkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : purchase.status === "Pending"
                      ? darkMode
                        ? "text-yellow-400"
                        : "text-yellow-600"
                      : darkMode
                      ? "text-red-400"
                        : "text-red-600"
                  }`}
                >
                  {purchase.status}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span
                  className={`block font-medium text-sm sm:text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  PO Number
                </span>
                <span className="text-base sm:text-lg">{purchase.poNumber || "N/A"}</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <span
                className={`block font-medium mb-2 text-sm sm:text-base ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notes
              </span>
              <p
                className={`text-base sm:text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {purchase.notes || "No notes provided."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {(isAdmin || isManager) && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/ims/purchases/edit/${purchase._id}`}
                className={`px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 text-sm ${
                  darkMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-400"
                } focus:ring-2 focus:ring-opacity-50`}
              >
                Edit Purchase
              </Link>
              <Link
                to={`/ims/purchases`}
                className={`px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 text-sm ${
                  darkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                }`}
              >
                Go Back
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseView;