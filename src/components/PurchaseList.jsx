import React, { useContext, useEffect } from "react" ;
 import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchases,
  deletePurchase,
  setPage,
  setActiveFilter,
  setSearchTerm,
} from "../Slices/PurchaseSlice.jsx";
import Spinner from "../components/Spinner.jsx";
// import Pagination from "../components/Pagination.jsx"
import Pagination from "./Pagination.jsx";
import FilterBox from "../components/FilterBox.jsx";
import useDebounce from "../../utils/useDebounce.js";
import { toast } from "react-toastify";

// SVG Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EmptyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;

const getStatusPillClass = (status) => {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    default: return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
  }
};

const getStatusBorderClass = (status) => {
  switch (status) {
    case "Completed": return "border-l-4 border-green-500";
    case "Pending": return "border-l-4 border-yellow-500";
    default: return "border-l-4 border-red-500";
  }
};

const PurchaseParty = ({ purchase }) => {
  switch (purchase.type) {
    case "Vendor": return <>{purchase.vendorId?.name}</>;
    case "Internal": return <>{purchase.department}</>;
    case "Transfer": return <>{purchase.fromLocation?.name} → {purchase.toLocation?.name}</>;
    default: return "N/A";
  }
};

const PurchaseCard = React.memo(({ purchase, isAdmin, isManager, onDelete, darkMode }) => (
  <div className={`p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 ${darkMode ? "bg-gray-700/80 hover:bg-gray-700" : "bg-white hover:bg-gray-50"} ${getStatusBorderClass(purchase.status)}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`font-bold text-base sm:text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>{purchase.productId?.name || "Unknown Product"}</p>
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
      </div>
      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusPillClass(purchase.status)}`}>{purchase.status}</span>
    </div>
    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
      <div className="flex justify-between"><span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Type:</span><span className={`${darkMode ? "text-gray-200" : "text-gray-800"}`}>{purchase.type}</span></div>
      <div className="flex justify-between"><span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Party:</span><span className={`text-right ${darkMode ? "text-gray-200" : "text-gray-800"}`}><PurchaseParty purchase={purchase} /></span></div>
      <div className="flex justify-between"><span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Quantity:</span><span className={`${darkMode ? "text-gray-200" : "text-gray-800"}`}>{purchase.quantity}</span></div>
      <div className="flex justify-between"><span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Price:</span><span className={`font-bold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>${purchase.totalPrice?.toFixed(2)}</span></div>
    </div>
    <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4 border-t pt-2 sm:pt-3 -mx-3 sm:-mx-4 px-3 sm:px-4 dark:border-gray-600">
      <Link to={`/ims/purchases/${purchase._id}`} className={`p-1.5 sm:p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} title="View Details"><EyeIcon /></Link>
      {(isAdmin || isManager) && (
        <>
          <Link to={`/ims/purchases/edit/${purchase._id}`} className={`p-1.5 sm:p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`} title="Edit Purchase"><PencilIcon /></Link>
          <button onClick={() => onDelete(purchase._id)} className={`p-1.5 sm:p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`} title="Delete Purchase"><TrashIcon /></button>
        </>
      )}
    </div>
  </div>
));

const PurchaseTableRow = React.memo(({ purchase, isAdmin, isManager, onDelete, darkMode }) => (
  <tr className={`transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50/80"}`}>
    <td className={`p-3 align-middle ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{purchase.type}</td>
    <td className="p-3 align-middle"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPillClass(purchase.status)}`}>{purchase.status}</span></td>
    <td className={`p-3 align-middle ${darkMode ? "text-gray-400" : "text-gray-600"}`}><PurchaseParty purchase={purchase} /></td>
    <td className={`p-3 align-middle ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{purchase.productId?.name || "Unknown Product"}</td>
    <td className={`p-3 align-middle ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{purchase.quantity}</td>
    <td className={`p-3 align-middle font-semibold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>${purchase.totalPrice?.toFixed(2)}</td>
    <td className={`p-3 align-middle ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
    {(isAdmin || isManager) && (
      <td className="p-3 align-middle text-center">
        <div className="flex justify-center gap-2">
          <Link to={`/ims/purchases/${purchase._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} title="View"><EyeIcon /></Link>
          <Link to={`/ims/purchases/edit/${purchase._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`} title="Edit"><PencilIcon /></Link>
          <button onClick={() => onDelete(purchase._id)} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`} title="Delete"><TrashIcon /></button>
        </div>
      </td>
    )}
  </tr>
));

const PurchaseList = () => {
  const dispatch = useDispatch();
  const { purchases, searchResults, searchTerm, currentPage, totalPages, loading, error, activeFilter } = useSelector((state) => state.purchases);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!user || !user.userId) return;
    dispatch(fetchPurchases({ page: currentPage, search: debouncedSearchTerm, activeFilter, user }));
  }, [
    debouncedSearchTerm,
    currentPage,
    activeFilter,
    user,
    dispatch,
  ]);

  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this purchase?")) {
      try {
        await dispatch(deletePurchase({ id, user })).unwrap();
        toast.success("Purchase deleted successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to delete purchase.");
      }
    }
  };

  const handlePageChange = (page) => dispatch(setPage(page));
  const handleFilterApply = (filter) => {
    dispatch(setActiveFilter(filter));
    dispatch(setPage(1));
  };

  const displayedPurchases = debouncedSearchTerm.trim() ? searchResults : purchases;

  if (error) {
    return (
      <div className={`text-center mt-10 p-6 rounded-lg ${darkMode ? "bg-gray-800 text-red-400" : "bg-white text-red-600"}`}>
        <h3 className="text-lg font-semibold mb-2">An Error Occurred</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchPurchases({ page: currentPage, search: debouncedSearchTerm, activeFilter, user }))} className={`mt-4 px-4 py-2 rounded font-semibold transition-colors ${darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 rounded-2xl shadow-lg transition-colors duration-300 ${darkMode ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/60 backdrop-blur-sm border border-gray-200"}`}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Purchases</h2>
        {(isAdmin || isManager) && (
          <Link to="/ims/purchases/new" className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-transform transform hover:scale-105 ${darkMode ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30" : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30"}`}>
            <PlusIcon /> Add Purchase
          </Link>
        )}
      </header>

      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3"><SearchIcon /></span>
          <input type="text" placeholder="Search by product, party, or status..." value={searchTerm} onChange={(e) => dispatch(setSearchTerm(e.target.value))} className={`border p-1.5 sm:p-2 pl-8 sm:pl-10 rounded-lg w-full text-sm transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 ${darkMode ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"}`} aria-label="Search purchases" />
        </div>
        <FilterBox onFilter={handleFilterApply} sliceName="purchases" showQuantityFilter={true} setActiveFilter={setActiveFilter}  showUserBar={true} showOrderStatusFilter={true} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8 sm:py-10"><Spinner /></div>
      ) : displayedPurchases.length === 0 ? (
        <div className={`text-center py-8 sm:py-10 px-4 sm:px-6 rounded-lg ${darkMode ? "bg-gray-800/80" : "bg-gray-50"}`}>
          <EmptyIcon />
          <p className={`mt-3 sm:mt-4 text-base sm:text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-800"}`}>No Purchases Found</p>
          <p className={`mt-1 text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:hidden">
            {displayedPurchases.map((purchase) => <PurchaseCard key={purchase._id} purchase={purchase} isAdmin={isAdmin} isManager={isManager} onDelete={handleDelete} darkMode={darkMode} />)}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <tr>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Type</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Party</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Product</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Quantity</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Total Price</th>
                  <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Date</th>
                  {(isAdmin || isManager) && (<th className="p-3 text-center font-semibold text-xs uppercase tracking-wider">Actions</th>)}
                </tr>
              </thead>
              <tbody className={`${darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}`}>
                {displayedPurchases.map((purchase) => <PurchaseTableRow key={purchase._id} purchase={purchase} isAdmin={isAdmin} isManager={isManager} onDelete={handleDelete} darkMode={darkMode} />)}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination loading={loading} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default PurchaseList;

