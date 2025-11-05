import React, { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { API_BASE_URL } from "../../config.js";
import {
  fetchProducts,
  deleteProduct,
  setPage,
  setActiveFilter,
  setSearchTerm,
} from "../Slices/InventorySlice.jsx";
import Spinner from "../components/Spinner.jsx";
import Pagination from "./pagination.jsx";
import FilterBox from "../components/FilterBox.jsx";
import useDebounce from "../../utils/useDebounce.js";

// SVG Icons for improved UI
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EmptyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;


const ProductList = () => {
  const dispatch = useDispatch();
  const {
    products,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    activeFilter,
  } = useSelector((state) => state.inventory);

  const { isAdmin, isManager, isStaff, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const memoizedUser = useMemo(() => user, [user?.userId]);
  const memoizedActiveFilter = useMemo(
    () => ({
      startDate: activeFilter.startDate,
      endDate: activeFilter.endDate,
      username: activeFilter.username,
      category: activeFilter.category,
      startQuantity: activeFilter.startQuantity,
      endQuantity: activeFilter.endQuantity,
    }),
    [
      activeFilter.startDate,
      activeFilter.endDate,
      activeFilter.username,
      activeFilter.startQuantity,
      activeFilter.category,
      activeFilter.endQuantity,
    ]
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!memoizedUser || !memoizedUser.userId) return;
    dispatch(
      fetchProducts({
        page: currentPage,
        search: debouncedSearchTerm,
        activeFilter: memoizedActiveFilter,
        user: memoizedUser,
      })
    );
  }, [
    debouncedSearchTerm,
    currentPage,
    memoizedActiveFilter,
    memoizedUser,
    dispatch,
  ]);

  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to delete this product?")) {
      try {
        await dispatch(deleteProduct({ id, user: memoizedUser })).unwrap();
      } catch (error) {}
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  const handleApply = (filter) => {
    dispatch(setActiveFilter(filter));
    dispatch(setPage(1));
  };

  const displayedProducts = products;
  
  const getStockColorClass = (quantity) => {
    if (quantity > 50) return darkMode ? 'text-green-400' : 'text-green-600';
    if (quantity > 10) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl shadow-lg max-w-7xl mx-auto mt-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/60 backdrop-blur-sm border border-gray-200"
      }`}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Products
        </h2>
        {(isAdmin || isManager) && (
          <Link
            to="/ims/products/new"
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-transform transform hover:scale-105 ${
              darkMode
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30"
            }`}
          >
            <PlusIcon />
            Add Product
          </Link>
        )}
      </header>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
             <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className={`border py-2 px-3 pl-10 rounded-lg w-full text-sm transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 ${
              darkMode
                ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
            aria-label="Search products"
          />
        </div>
        <FilterBox
          onFilter={handleApply}
          sliceName="inventory"
          showStatusFilter={false}
          showTypeFilter={false}
          showCategoryFilter={true}
          setActiveFilter={setActiveFilter}
          showQuantityFilter={true}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div
          className={`text-center py-10 px-6 rounded-lg ${
            darkMode ? "bg-gray-800/80" : "bg-gray-50"
          }`}
        >
          <EmptyIcon />
           <p
            className={`mt-4 text-lg font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            No Products Found
          </p>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Click "Add Product" to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {displayedProducts.map((product) => {
              const totalQuantity = product.inventory?.reduce(
                (sum, inv) => sum + inv.quantity,
                0
              ) || 0;
              return (
                <div
                  key={product._id}
                  className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
                    darkMode ? "bg-gray-700/80 hover:bg-gray-700" : "bg-white hover:bg-gray-50/50"
                  }`}
                >
                    <div className="flex justify-between items-center">
                        <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {product.name}
                        </h3>
                        <p className={`text-lg font-bold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                            ${product.price || 0}
                        </p>
                    </div>
                  <p
                    className={`text-sm font-semibold mt-2 ${getStockColorClass(totalQuantity)}`}
                  >
                    Stock: {totalQuantity}
                  </p>
                  <div className="flex gap-2 mt-4 border-t pt-3 -mx-4 px-4">
                    <Link to={`/ims/products/${product._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}><EyeIcon /></Link>
                    {(isAdmin || isManager) && (
                      <Link to={`/ims/products/edit/${product._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`}><PencilIcon /></Link>
                    )}
                    {(isAdmin || isManager || isStaff) && (
                      <button onClick={() => handleDelete(product._id)} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`}><TrashIcon /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
            <thead className={`${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <tr>
                  {["Name", "Price", "Stock"].map((header) => (
                    <th key={header} className="p-3 text-left font-semibold text-xs uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                  {(isAdmin || isManager || isStaff) && (
                    <th className="p-3 text-center font-semibold text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={`${darkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-200"}`}>
                {displayedProducts.map((product) => {
                  const totalQuantity = product.inventory?.reduce(
                    (sum, inv) => sum + inv.quantity,
                    0
                  ) || 0;
                  return (
                    <tr
                      key={product._id}
                      className={`transition-colors ${
                        darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <td className={`p-3 align-middle font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{product.name}</td>  
                      <td className={`p-3 align-middle ${darkMode ? "text-gray-400" : "text-gray-600"}`}>${product.sellingPrice || 0}</td>
                      <td className={`p-3 align-middle font-bold ${getStockColorClass(totalQuantity)}`}>
                        {totalQuantity}
                      </td>
                      {(isAdmin || isManager || isStaff) && (
                        <td className="p-3 align-middle">
                            <div className="flex justify-center gap-2">
                               <Link to={`/ims/products/${product._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-blue-600/50 hover:text-white' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} title="View"><EyeIcon /></Link>
                               {(isAdmin || isManager) && (
                                   <Link to={`/ims/products/edit/${product._id}`} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-yellow-600/50 hover:text-white' : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'}`} title="Edit"><PencilIcon /></Link>
                               )}
                               <button onClick={() => handleDelete(product._id)} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-300 hover:bg-red-600/50 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-red-600'}`} title="Delete"><TrashIcon /></button>
                            </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductList;
