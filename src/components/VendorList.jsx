import React, { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendors,
  deleteVendor,
  setPage,
  setSearchTerm,
} from "../Slices/VendorSlice.jsx";
import Spinner from "../components/Spinner.jsx";
import Pagination from "../components/Pagination.jsx";
import useDebounce from "../../utils/useDebounce.js";
import { toast } from "react-toastify";

// SVG Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EmptyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

const VendorCard = React.memo(({ vendor, isAdmin, isManager, onDelete, darkMode }) => (
  <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-gray-700 border border-gray-600" : "bg-white border"}`}>
    <div className="space-y-1">
      <p className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>{vendor.name}</p>
      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{vendor.company || "No Company"}</p>
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{vendor.email || "No Email"}</p>
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{vendor.phone || "No Phone"}</p>
    </div>
    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}">
      <Link to={`/ims/vendors/${vendor._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} title="View Details"><EyeIcon /></Link>
      {(isAdmin || isManager) && (
        <>
          <Link to={`/ims/vendors/edit/${vendor._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`} title="Edit Vendor"><PencilIcon /></Link>
          <button onClick={() => onDelete(vendor._id)} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`} title="Archive Vendor"><TrashIcon /></button>
        </>
      )}
    </div>
  </div>
));

const VendorTableRow = React.memo(({ vendor, isAdmin, isManager, onDelete, darkMode }) => (
  <tr className={darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}>
    <td className="p-3 whitespace-nowrap font-medium">{vendor.name}</td>
    <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{vendor.company || "N/A"}</td>
    <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{vendor.email || "N/A"}</td>
    <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{vendor.phone || "N/A"}</td>
    <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{vendor.taxNumber || "N/A"}</td>
    {(isAdmin || isManager) && (
      <td className="p-3">
        <div className="flex justify-start items-center gap-2">
            <Link to={`/ims/vendors/${vendor._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} title="View"><EyeIcon /></Link>
            <Link to={`/ims/vendors/edit/${vendor._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`} title="Edit"><PencilIcon /></Link>
            <button onClick={() => onDelete(vendor._id)} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`} title="Archive"><TrashIcon /></button>
        </div>
      </td>
    )}
  </tr>
));

const VendorList = () => {
  const dispatch = useDispatch();
  const { vendors, searchResults, searchTerm, currentPage, totalPages, loading, error } = useSelector((state) => state.vendors);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!user?.userId) return;
    dispatch(fetchVendors({ page: currentPage, search: debouncedSearchTerm, user }));
  }, [debouncedSearchTerm, currentPage, user, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to archive this vendor?")) {
      try {
        await dispatch(deleteVendor({ id, user })).unwrap();
        toast.success("Vendor archived successfully!");
        // BUG FIX: Refetch the list to show the change
        dispatch(fetchVendors({ page: currentPage, search: debouncedSearchTerm, user }));
      } catch (err) {
        toast.error(err.message || "Failed to archive vendor.");
      }
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };
  
  const displayedVendors = debouncedSearchTerm.trim() ? searchResults : vendors;

  if (error) {
    return (
      <div className={`text-center mt-10 p-6 rounded-lg ${darkMode ? "bg-gray-800 text-red-400" : "bg-white text-red-600"}`}>
        <h3 className="text-lg font-semibold mb-2">An Error Occurred</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchVendors({ page: currentPage, search: debouncedSearchTerm, user }))} className={`mt-4 px-4 py-2 rounded font-semibold transition-colors ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-2xl shadow-lg transition-colors duration-300 ${darkMode ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/60 backdrop-blur-sm border border-gray-200"}`}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Vendors</h2>
        {(isAdmin || isManager) && (
          <Link to="/ims/vendors/new" className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-transform transform hover:scale-105 ${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30" : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30"}`}>
            <PlusIcon /> Add Vendor
          </Link>
        )}
      </header>

      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></span>
        <input type="text" placeholder="Search vendors by name, company, or email..." value={searchTerm} onChange={(e) => dispatch(setSearchTerm(e.target.value))} className={`border p-2 pl-10 rounded-lg w-full text-sm transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 ${darkMode ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"}`} aria-label="Search vendors" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10"><Spinner /></div>
      ) : displayedVendors.length === 0 ? (
        <div className={`text-center py-10 px-6 rounded-lg ${darkMode ? "bg-gray-800/80" : "bg-gray-50"}`}>
          <EmptyIcon />
          <p className={`mt-4 text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-800"}`}>No Vendors Found</p>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Try adjusting your search or add a new vendor.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {displayedVendors.map((vendor) => <VendorCard key={vendor._id} vendor={vendor} isAdmin={isAdmin} isManager={isManager} onDelete={handleDelete} darkMode={darkMode} />)}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={darkMode ? "bg-gray-700/50" : "bg-gray-100"}>
                <tr>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Company</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Email</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Phone</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Tax Number</th>
                  {(isAdmin || isManager) && <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className={darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}>
                {displayedVendors.map((vendor) => <VendorTableRow key={vendor._id} vendor={vendor} isAdmin={isAdmin} isManager={isManager} onDelete={handleDelete} darkMode={darkMode} />)}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination loading={loading} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default VendorList;