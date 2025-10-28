import React, { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import DatePicker from "react-datepicker";
import AsyncSelect from "react-select/async";
import "react-datepicker/dist/react-datepicker.css";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";

// const API_BASE_URL = 'http://localhost:8000';
import { API_BASE_URL } from "../../config.js";

// --- Icon Components ---

const FilterIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const CalendarIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TagIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-1" />
    </svg>
);

const UserCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const RefreshIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 17L20 20M20 4l-1.5 1.5A9 9 0 003.5 7L4 4z" />
    </svg>
);


const fetchUsers = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/auth/users-all/?username=${inputValue || ""}`);
  return data.users.map((user) => ({ label: user.username, value: user._id }));
};

const fetchCategories = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/categories?search=${inputValue || ""}`);
  return data.categories ? data.categories.map((cat) => ({ label: cat.name, value: cat._id })) : [];
};

const debouncedFetchUsers = debounce((inputValue, callback) => { fetchUsers(inputValue).then(callback) }, 400);
const debouncedFetchCategories = debounce((inputValue, callback) => { fetchCategories(inputValue).then(callback) }, 400);

const loadUserOptions = (inputValue) => new Promise(resolve => debouncedFetchUsers(inputValue, resolve));
const loadCategoryOptions = (inputValue) => new Promise(resolve => debouncedFetchCategories(inputValue, resolve));

export default function FilterBox({
  onFilter,
  sliceName,
  setActiveFilter,
  loading = false,
  showUserBar = true,
  showTypeFilter = true,
  showOrderStatusFilter = false,
  showContentStatusFilter = false,
  showCategoryFilter = false,
  showQuantityFilter = true,
}) {
  const { darkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const activeFilter = useSelector((state) => state[sliceName].activeFilter);

  const [localFilter, setLocalFilter] = useState({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    setLocalFilter({
      orderStatus: activeFilter.orderStatus || "",
      contentStatus: activeFilter.contentStatus || "",
      type: activeFilter.type || "",
      category: activeFilter.category ? { value: activeFilter.category, label: activeFilter.categoryLabel || "" } : null,
      startDate: activeFilter.startDate ? new Date(activeFilter.startDate) : null,
      endDate: activeFilter.endDate ? new Date(activeFilter.endDate) : null,
      startQuantity: activeFilter.startQuantity || "",
      endQuantity: activeFilter.endQuantity || "",
      username: activeFilter.username ? { label: activeFilter.username, value: null } : null
    });
  }, [activeFilter]);

  const handleInputChange = (name, value) => {
    setLocalFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    const filterPayload = {
      ...localFilter,
      startDate: localFilter.startDate?.toISOString(),
      endDate: localFilter.endDate?.toISOString(),
      username: localFilter.username?.label,
      category: localFilter.category?.value,
      categoryLabel: localFilter.category?.label
    };
    
    Object.keys(filterPayload).forEach(key => {
      if (filterPayload[key] === null || filterPayload[key] === "" || filterPayload[key] === undefined) {
        delete filterPayload[key];
      }
    });

    dispatch(setActiveFilter(filterPayload));
    onFilter(filterPayload);
  };
  
  const handleClearFilter = () => {
    const cleared = { orderStatus: "", contentStatus: "", type: "", category: null, startDate: null, endDate: null, startQuantity: "", endQuantity: "", username: null };
    setLocalFilter(cleared);
    dispatch(setActiveFilter({}));
    onFilter({});
  };

  const selectStyles = {
    control: (provided) => ({ ...provided, paddingLeft: '2.25rem', backgroundColor: darkMode ? "#1F2937" : "#F9FAFB", borderColor: darkMode ? "#4b5563" : "#d1d5db", color: darkMode ? "#d1d5db" : "#1f2937", boxShadow: "none", '&:hover': { borderColor: darkMode ? "#6b7280" : "#9ca3af" } }),
    input: (provided) => ({ ...provided, color: darkMode ? "#d1d5db" : "#1f2937" }),
    singleValue: (provided) => ({ ...provided, color: darkMode ? "#d1d5db" : "#1f2937" }),
    menu: (provided) => ({ ...provided, backgroundColor: darkMode ? "#374151" : "#ffffff" }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? (darkMode ? "#4b5563" : "#2563eb") : (darkMode ? "#374151" : "#ffffff"), color: darkMode ? "#d1d5db" : "#1f2937", '&:hover': { backgroundColor: darkMode ? "#4b5563" : "#e5e7eb" } }),
    placeholder: (provided) => ({ ...provided, color: darkMode ? "#9ca3af" : "#6b7280" }),
  };

  const commonInputClasses = `border p-2 pl-10 rounded-md w-full text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"}`;

  return (
    <div className={`rounded-lg my-4 w-full ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border"}`}>
      <button
        onClick={() => setIsFilterVisible(!isFilterVisible)}
        className={`w-full flex items-center justify-between p-4 font-semibold text-left transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} ${isFilterVisible ? 'border-b' : 'rounded-lg'} ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        aria-expanded={isFilterVisible}
      >
        <div className="flex items-center gap-3">
          <FilterIcon className={darkMode ? 'text-gray-400' : 'text-gray-500'}/>
          <span className={darkMode ? 'text-white' : 'text-gray-800'}>{isFilterVisible ? 'Hide Filters' : 'Show Filters'}</span>
        </div>
        <ChevronDownIcon className={`transition-transform duration-200 ${isFilterVisible ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>

      {isFilterVisible && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span>
                <DatePicker selected={localFilter.startDate} onChange={date => handleInputChange('startDate', date)} selectsStart startDate={localFilter.startDate} endDate={localFilter.endDate} placeholderText="Start Date" disabled={loading} className={commonInputClasses} wrapperClassName="w-full" />
            </div>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span>
                <DatePicker selected={localFilter.endDate} onChange={date => handleInputChange('endDate', date)} selectsEnd startDate={localFilter.startDate} endDate={localFilter.endDate} minDate={localFilter.startDate} placeholderText="End Date" disabled={loading} className={commonInputClasses} wrapperClassName="w-full" />
            </div>
            
            {showOrderStatusFilter && (
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                    <select value={localFilter.orderStatus || ""} onChange={e => handleInputChange('orderStatus', e.target.value)} className={commonInputClasses}>
                        <option value="">All Order Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            )}

            {showContentStatusFilter && (
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                    <select value={localFilter.contentStatus || ""} onChange={e => handleInputChange('contentStatus', e.target.value)} className={commonInputClasses}>
                        <option value="">All Content Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            )}

            {showUserBar && (
                <div className="relative lg:col-span-2 xl:col-span-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"><UserCircleIcon className="h-5 w-5 text-gray-400" /></span>
                    <AsyncSelect cacheOptions defaultOptions loadOptions={loadUserOptions} onChange={option => handleInputChange('username', option)} value={localFilter.username} placeholder="Search by creator..." isClearable styles={selectStyles} />
                </div>
            )}

            {showTypeFilter && (
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                  <select value={localFilter.type || ""} onChange={e => handleInputChange('type', e.target.value)} className={commonInputClasses}>
                      <option value="">All Types</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Internal">Internal</option>
                      <option value="Transfer">Transfer</option>
                  </select>
              </div>
            )}
            
            {showCategoryFilter && (
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                  <AsyncSelect cacheOptions defaultOptions loadOptions={loadCategoryOptions} onChange={option => handleInputChange('category', option)} value={localFilter.category} placeholder="Search categories..." isClearable styles={selectStyles} />
              </div>
            )}

            {showQuantityFilter && (
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                  <input value={localFilter.startQuantity || ""} onChange={e => handleInputChange('startQuantity', e.target.value)} placeholder="Min quantity" type="number" className={commonInputClasses} min={0} />
              </div>
            )}
            {showQuantityFilter && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></span>
                <input value={localFilter.endQuantity || ""} onChange={e => handleInputChange('endQuantity', e.target.value)} placeholder="Max quantity" type="number" className={commonInputClasses} min={0} />
              </div>
            )}

          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-gray-700/50">
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors ${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-500 text-white hover:bg-indigo-600"} disabled:opacity-50`} onClick={handleApplyFilter} disabled={loading}>
              <CheckIcon /> Apply Filters
            </button>
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`} onClick={handleClearFilter}>
              <RefreshIcon /> Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
