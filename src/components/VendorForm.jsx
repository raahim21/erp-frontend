import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorById,
  addVendor,
  updateVendor,
  clearCurrentVendor,
} from "../Slices/VendorSlice.jsx";
import FullPageSpinner from "./FullPageSpinner.jsx";
import { toast } from "react-toastify";

// --- Icon Components ---

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const OfficeBuildingIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationMarkerIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const HashtagIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

const PencilAltIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const VendorForm = () => {
  const dispatch = useDispatch();
  const { currentVendor: vendor, loading, error } = useSelector((state) => state.vendors);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    taxNumber: "",
    notes: "",
  });

  // Restrict access
  useEffect(() => {
    if (!isAdmin && !isManager) {
      navigate("/ims/vendors", { replace: true });
    }
  }, [isAdmin, isManager, navigate]);

  // Fetch vendor data for editing
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchVendorById({ id, user })).unwrap().catch(err => {
         toast.error(err.message || "Failed to load vendor data.");
      });
    }
    return () => {
      dispatch(clearCurrentVendor());
    };
  }, [id, dispatch, user, isEditMode]);

  // Populate form when vendor data is loaded
  useEffect(() => {
    if (isEditMode && vendor) {
      setFormData({
        name: vendor.name || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        address: vendor.address || "",
        company: vendor.company || "",
        taxNumber: vendor.taxNumber || "",
        notes: vendor.notes || "",
      });
    }
  }, [vendor, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vendor name is required.");
      return;
    }

    try {
      if (!user?.userId) {
        throw new Error("User not authenticated.");
      }

      const vendorData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value.trim() || ''])
      );

      if (isEditMode) {
        await dispatch(updateVendor({ id, vendorData, user })).unwrap();
        toast.success("Vendor updated successfully!");
      } else {
        await dispatch(addVendor({ vendorData, user })).unwrap();
        toast.success("Vendor added successfully!");
      }
      navigate("/ims/vendors");
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "add"} vendor.`);
    }
  };

  const renderInput = (id, label, type = "text", placeholder, icon, required = false, isTextArea = false) => {
    const commonClasses = `w-full p-2 pl-10 border rounded-md text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
      }`;
      
    const InputComponent = isTextArea ? 'textarea' : 'input';

    return (
        <div>
            <label htmlFor={id} className={`block font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isTextArea ? 'pt-2.5' : ''} ${isTextArea && 'items-start'}`}>
                    {icon}
                </span>
                <InputComponent
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id]}
                    onChange={handleChange}
                    className={commonClasses}
                    required={required}
                    placeholder={placeholder}
                    rows={isTextArea ? 4 : undefined}
                />
            </div>
        </div>
    );
  };
  
  if (loading && isEditMode) return <FullPageSpinner />;
  if (error && isEditMode) {
    return (
      <div className={`text-center mt-6 p-4 rounded-lg ${darkMode ? "text-red-400 bg-red-900/20" : "text-red-600 bg-red-100"}`}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchVendorById({ id, user }))} className={`mt-2 px-3 py-1 rounded text-sm font-semibold ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-3xl mx-auto mt-8 p-6 sm:p-8 rounded-xl shadow-lg mb-10 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
      <div className="mb-6">
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {isEditMode ? "Edit Vendor" : "Create New Vendor"}
        </h2>
        <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Fill in the details below to {isEditMode ? "update the" : "create a new"} vendor.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="space-y-4">
            {renderInput("name", "Vendor Name", "text", "e.g., John Doe", <UserIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>, true)}
            {renderInput("company", "Company", "text", "e.g., Acme Inc.", <OfficeBuildingIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("phone", "Phone", "tel", "e.g., (555) 123-4567", <PhoneIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>)}
            {renderInput("email", "Email", "email", "e.g., contact@acme.com", <MailIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>)}
        </div>

        <div className="space-y-4">
            {renderInput("address", "Address", "text", "e.g., 123 Main St, Anytown, USA", <LocationMarkerIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>, false, true)}
            {renderInput("taxNumber", "Tax Number", "text", "e.g., VAT ID, EIN", <HashtagIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>)}
            {renderInput("notes", "Notes", "text", "Add any relevant notes...", <PencilAltIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}/>, false, true)}
        </div>

        <div className={`flex flex-col sm:flex-row items-center gap-4 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <CheckIcon />
            {loading ? "Saving..." : isEditMode ? "Update Vendor" : "Add Vendor"}
          </button>
          <Link to="/ims/vendors" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold transition-colors ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
            <XIcon />
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
