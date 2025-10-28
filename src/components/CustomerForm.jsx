import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomer,
  clearCurrentCustomer,
  fetchCustomerById,
  updateCustomer,
} from "../Slices/CustomerSlice.jsx";
import FullPageSpinner from "./FullPageSpinner.jsx";
import { toast } from "react-toastify";
import { FiUser, FiBriefcase, FiHash, FiPhone, FiMail, FiMapPin, FiEdit } from 'react-icons/fi';

const CustomerForm = () => {
  const dispatch = useDispatch();
  const { currentCustomer: customer, loading, error } = useSelector((state) => state.customers);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const memoizedUser = useMemo(() => user, [user?.userId]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    taxNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAdmin && !isManager) {
      navigate("/ims/customers", { replace: true });
    }
  }, [isAdmin, isManager, navigate]);

  useEffect(() => {
    if (isEditMode && memoizedUser?.userId) {
      dispatch(fetchCustomerById({ id, user: memoizedUser })).unwrap().catch(err => {
        toast.error(err.message || "Failed to load customer");
      });
    }
    return () => {
      dispatch(clearCurrentCustomer());
    };
  }, [id, dispatch, memoizedUser, isEditMode]);

  useEffect(() => {
    if (isEditMode && customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        company: customer.company || "",
        taxNumber: customer.taxNumber || "",
        notes: customer.notes || "",
      });
    }
  }, [customer, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const customerData = { ...formData };
      if (isEditMode) {
        await dispatch(updateCustomer({ id, customerData, user: memoizedUser })).unwrap();
        toast.success("Customer updated successfully!");
      } else {
        await dispatch(addCustomer({ customerData, user: memoizedUser })).unwrap();
        toast.success("Customer added successfully!");
      }
      navigate("/ims/customers");
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "add"} customer`);
    }
  };

  if (loading && isEditMode) return <FullPageSpinner />;
  
  if (error && isEditMode && !customer) {
    return (
      <div className={`text-center mt-4 p-4 ${darkMode ? "text-red-400" : "text-red-600"}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`mt-10 max-w-2xl mx-auto p-6 sm:p-8 rounded-xl shadow-2xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} transition-colors duration-300`}>
      <h2 className="text-3xl font-bold mb-8 text-center">
        {isEditMode ? "Edit Customer" : "Add New Customer"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section: Customer Details */}
        <div className={`p-4 border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., John Doe"
              />
              <FiUser className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., Acme Inc."
              />
              <FiBriefcase className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Tax Number
              </label>
              <input
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., VAT ID"
              />
              <FiHash className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Section: Contact Information */}
        <div className={`p-4 border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., +1-555-1234"
              />
              <FiPhone className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-gray-50 text-gray-900 border-gray-300"
                } transition-colors`}
                placeholder="e.g., john.doe@example.com"
              />
              <FiMail className="absolute left-3 top-11 text-gray-400" size={18} />
            </div>
          </div>
          <div className="mt-4 relative">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={`w-full pl-10 pt-3 pb-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } transition-colors`}
              placeholder="e.g., 123 Main St, Anytown, USA"
            />
            <FiMapPin className="absolute left-3 top-10 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* Section: Notes */}
        <div className={`p-4 border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <div className="relative">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className={`w-full pl-10 pt-3 pb-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } transition-colors`}
              placeholder="Add any relevant notes here..."
            />
            <FiEdit className="absolute left-3 top-4 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* Submit Actions */}
        <div className={`flex items-center space-x-4 pt-4 mt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              darkMode
                ? "bg-blue-700 hover:bg-blue-800 active:bg-blue-900"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Saving..." : isEditMode ? "Update Customer" : "Add Customer"}
          </button>
          <Link
            to="/ims/customers"
            className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-800"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
            }`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;