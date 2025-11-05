import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchaseById,
  addPurchase,
  updatePurchase,
  clearCurrentPurchase,
} from "../Slices/PurchaseSlice.jsx";
import ProductDropdown from "./ProductsDropdown.jsx";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import FullPageSpinner from "./FullPageSpinner.jsx";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../../config.js";

// Custom hook to encapsulate debounced fetching logic for react-select
const useDebouncedFetch = (fetchFunction) => {
  const memoizedFetch = useCallback(fetchFunction, []);

  const debouncedFetcher = useMemo(() =>
    debounce((inputValue, callback) => {
      memoizedFetch(inputValue).then(callback);
    }, 400),
    [memoizedFetch]
  );
  
  return (inputValue) => new Promise((resolve) => {
    debouncedFetcher(inputValue, resolve);
  });
};

// API call functions for async selects
const fetchVendorsAPI = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/vendors?search=${inputValue || ''}`);
  return data.vendors.map((ven) => ({ label: ven.name, value: ven._id }));
};
const fetchLocationsAPI = async (inputValue) => {
  const data = await fetchWithAuth(`${API_BASE_URL}/api/locations?search=${inputValue || ''}`);
  return data.locations.map((loc) => ({ label: loc.name, value: loc._id }));
};

// Sub-components for different purchase types to improve readability
const VendorFields = ({ value, onChange, selectStyles, loadVendorOptions }) => (
  <div>
    <label className="block font-medium mb-1">Vendor <span className="text-red-500">*</span></label>
    <AsyncSelect
      cacheOptions
      loadOptions={loadVendorOptions}
      onChange={onChange}
      value={value}
      placeholder="Search vendors..."
      isClearable
      styles={selectStyles}
    />
  </div>
);

const InternalFields = ({ value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">Department <span className="text-red-500">*</span></label>
    <input
      type="text"
      name="department"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-300"
      placeholder="e.g., IT, Marketing"
    />
  </div>
);

const TransferFields = ({ fromValue, onFromChange, toValue, onToChange, selectStyles, loadLocationOptions }) => (
  <>
    <div>
      <label className="block font-medium mb-1">From Location <span className="text-red-500">*</span></label>
      <AsyncSelect
        cacheOptions
        loadOptions={loadLocationOptions}
        onChange={onFromChange}
        value={fromValue}
        placeholder="Source location..."
        isClearable
        styles={selectStyles}
      />
    </div>
    <div>
      <label className="block font-medium mb-1">To Location <span className="text-red-500">*</span></label>
      <AsyncSelect
        cacheOptions
        loadOptions={loadLocationOptions}
        onChange={onToChange}
        value={toValue}
        placeholder="Destination location..."
        isClearable
        styles={selectStyles}
      />
    </div>
  </>
);

const PurchaseForm = () => {
  const dispatch = useDispatch();
  const { currentPurchase: purchase, loading, error } = useSelector((state) => state.purchases);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    type: "Vendor",
    vendorId: null,
    department: "",
    fromLocation: null,
    toLocation: null,
    productId: null,
    quantity: "",
    unitPrice:"",
    totalPrice: "",
    poNumber: "",
    notes: "",
    status: "Pending",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const loadVendorOptions = useDebouncedFetch(fetchVendorsAPI);
  const loadLocationOptions = useDebouncedFetch(fetchLocationsAPI);

  const fetchProductDetails = useCallback(async (productId) => {
    if (!productId) {
      setSelectedProduct(null);
      return;
    }
    setInventoryLoading(true);
    try {
      const productData = await fetchWithAuth(`${API_BASE_URL}/api/products/${productId}`);
      setSelectedProduct(productData);
    } catch (error) {
      console.error("Failed to fetch product details", error);
      toast.error("Could not load details for the selected product.");
      setSelectedProduct(null);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin && !isManager) navigate("/ims/purchases", { replace: true });
  }, [isAdmin, isManager, navigate]);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchPurchaseById({ id, user })).unwrap().catch(err => {
        toast.error(err.message || "Failed to load purchase data.");
      });
    }
    return () => { dispatch(clearCurrentPurchase()) };
  }, [id, dispatch, user, isEditMode]);

  useEffect(() => {
    if (isEditMode && purchase) {
      setFormData({
        type: purchase.type || "Vendor",
        vendorId: purchase.vendorId ? { value: purchase.vendorId._id, label: purchase.vendorId.name } : null,
        department: purchase.department || "",
        fromLocation: purchase.fromLocation ? { value: purchase.fromLocation._id, label: purchase.fromLocation.name } : null,
        toLocation: purchase.toLocation ? { value: purchase.toLocation._id, label: purchase.toLocation.name } : null,
        productId: purchase.productId ? { value: purchase.productId._id, label: purchase.productId.name } : null,
        quantity: purchase.quantity?.toString() || "",
        totalPrice: purchase.totalPrice?.toString() || "",
        poNumber: purchase.poNumber || "",
        unitPrice:purchase.unitPrice || "",
        notes: purchase.notes || "",
        status: purchase.status || "Pending",
      });
      if(purchase.productId) {
        fetchProductDetails(purchase.productId._id);
      }
    }
  }, [purchase, isEditMode, fetchProductDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (fieldName, selected) => {
    setFormData({ ...formData, [fieldName]: selected });
    if (fieldName === 'productId') {
      if (selected) {
        fetchProductDetails(selected.value);
      } else {
        setSelectedProduct(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId?.value) return toast.error("Product is required.");
    if(!formData.unitPrice && formData.type=='Vendor' || formData.type=='Internal' || parseInt(formData.unitPrice) < 1) return toast.warn('unitPrice cannot be 0 or empty')
    if (!formData.quantity || parseInt(formData.quantity) <= 0) return toast.error("Quantity must be a positive number.");
    
    switch (formData.type) {
      case "Vendor":
        if (!formData.vendorId?.value) return toast.error("Vendor is required for Vendor type purchase.");
        if (!formData.toLocation?.value) return toast.error("Stock location is required.");
        if (formData.totalPrice === "" || parseFloat(formData.totalPrice) < 0) return toast.error("Total price must be a non-negative number.");
        break;
      case "Internal":
        if (!formData.department.trim()) return toast.error("Department is required for Internal type purchase.");
        if (!formData.toLocation?.value) return toast.error("Stock location is required.");
        if (formData.totalPrice === "" || parseFloat(formData.totalPrice) < 0) return toast.error("Total price must be a non-negative number.");
        break;
      case "Transfer":
        if (!formData.fromLocation?.value || !formData.toLocation?.value) return toast.error("Both From and To locations are required for Transfer.");
        if (!selectedProduct) return toast.error("Please wait for product details to load before submitting.");
        
        const fromLocationId = formData.fromLocation.value;
        const availableStock = selectedProduct?.inventory?.find(item => item.location?._id === fromLocationId)?.quantity || 0;
        
        if (parseInt(formData.quantity) > availableStock) {
            return toast.error(`Cannot transfer more than available stock. Available at ${formData.fromLocation.label}: ${availableStock} ${selectedProduct.unit || 'units'}.`);
        }
        break;
      default:
        break;
    }

    try {
      const purchaseData = {
        type: formData.type,
        vendorId: formData.vendorId?.value || null,
        department: formData.department.trim(),
        fromLocation: formData.fromLocation?.value || null,
        toLocation: formData.toLocation?.value || null,
        productId: formData.productId.value,
        quantity: Number(parseInt(formData.quantity)),
        totalPrice: formData.type === 'Transfer' ? 0 : Number(parseFloat(formData.totalPrice)),
        poNumber: formData.poNumber.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
        unitPrice:Number(parseFloat(formData.unitPrice)),
      };

      if (isEditMode) {
        await dispatch(updatePurchase({ id, purchaseData, user })).unwrap();
        toast.success("Purchase updated successfully!");
      } else {
        await dispatch(addPurchase({ purchaseData, user })).unwrap();
        toast.success("Purchase added successfully!");
      }
      navigate("/ims/purchases");
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "add"} purchase.`);
    }
  };
  
  useEffect(() => {
  const quantity = parseFloat(formData.quantity) || 0;
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const total = quantity * unitPrice;
  
  // Fix: Format to match backend expectation (2 decimals, string)
  setFormData(prev => ({
    ...prev,
    totalPrice: total.toFixed(2)  // "125.00" → parseFloat() = 125.00 ✅
  }));
}, [formData.quantity, formData.unitPrice]);


  const productInventory = selectedProduct?.inventory;

  const selectStyles = useMemo(() => ({
    control: (provided) => ({ ...provided, backgroundColor: darkMode ? "#374151" : "#ffffff", borderColor: darkMode ? "#4b5563" : "#d1d5db", color: darkMode ? "#d1d5db" : "#1f2937", boxShadow: "none", '&:hover': { borderColor: darkMode ? "#6b7280" : "#9ca3af" } }),
    input: (provided) => ({ ...provided, color: darkMode ? "#d1d5db" : "#1f2937" }),
    singleValue: (provided) => ({ ...provided, color: darkMode ? "#d1d5db" : "#1f2937" }),
    menu: (provided) => ({ ...provided, backgroundColor: darkMode ? "#374151" : "#ffffff" }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? (darkMode ? "#4b5563" : "#2563eb") : (darkMode ? "#374151" : "#ffffff"), color: state.isSelected ? "#ffffff" : (darkMode ? "#d1d5db" : "#1f2937"), '&:hover': { backgroundColor: darkMode ? "#4b5563" : "#e5e7eb", color: state.isSelected ? "#ffffff" : (darkMode ? "#d1d5db" : "#1f2937")} }),
    placeholder: (provided) => ({ ...provided, color: darkMode ? "#9ca3af" : "#6b7280" }),
  }), [darkMode]);

  if (loading && isEditMode) return <FullPageSpinner />;
  if (error && isEditMode) return <div className={`text-center mt-6 ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</div>;

  return (
    <div className={`w-full max-w-4xl mx-auto mt-8 p-6 rounded-lg shadow-md mb-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
        {isEditMode ? "Edit Purchase" : "Create New Purchase"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <section className="p-4 border rounded-md dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Purchase Type & Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-300">Purchase Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}>
                <option value="Vendor">Vendor</option>
                <option value="Internal">Internal</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            {formData.type === "Vendor" && <VendorFields value={formData.vendorId} onChange={(selected) => handleSelectChange('vendorId', selected)} selectStyles={selectStyles} loadVendorOptions={loadVendorOptions} />}
            {formData.type === "Internal" && <InternalFields value={formData.department} onChange={handleChange} />}
            {formData.type === "Transfer" && <TransferFields fromValue={formData.fromLocation} onFromChange={(selected) => handleSelectChange('fromLocation', selected)} toValue={formData.toLocation} onToChange={(selected) => handleSelectChange('toLocation', selected)} selectStyles={selectStyles} loadLocationOptions={loadLocationOptions} />}
            
            {formData.type !== "Transfer" && (
              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Stock Location <span className="text-red-500">*</span></label>
                <AsyncSelect cacheOptions loadOptions={loadLocationOptions} onChange={(selected) => handleSelectChange('toLocation', selected)} value={formData.toLocation} placeholder="Receiving location..." isClearable styles={selectStyles} />
              </div>
            )}
          </div>
        </section>

        <section className="p-4 border rounded-md dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Item & Pricing
          </h3>
          <div className="space-y-4">
              <div>
                  <label className="block font-medium mb-1 dark:text-gray-300">Product <span className="text-red-500">*</span></label>
                  <ProductDropdown value={formData.productId} onChange={(selected) => handleSelectChange('productId', selected)} />
              </div>

              {(inventoryLoading || formData.productId) && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 transition-all duration-300 ease-in-out">
                    <h4 className="font-semibold text-md mb-3 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                        Current Stock Levels
                    </h4>
                    {inventoryLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Loading stock details...</span>
                        </div>
                    ) : productInventory && productInventory.length > 0 ? (
                        <ul className="space-y-2">
                            {productInventory.map(item => (
                                <li key={item.location?._id || item._id} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-600">
                                    <span className="font-medium text-gray-800 dark:text-gray-100">{item.location?.name || 'Unknown Location'}</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${item.quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : item.quantity > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                        {item.quantity} {selectedProduct.unit || 'pcs'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No stock information found for this product.</p>
                    )}
                </div>
              )}

              <div className={`grid grid-cols-1 ${formData.type !== 'Transfer' ? 'md:grid-cols-2' : ''} gap-4`}>
                  <div>
                      <label className="block font-medium mb-1 dark:text-gray-300">Quantity <span className="text-red-500">*</span></label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} required min="1" />
                  </div>
                  {formData.type !== 'Transfer' && (
                    <>
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">Unit Price (USD) <span className="text-red-500">*</span></label>
                        <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} required min="1" step="0.01" />
                    </div>
                    {/* <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">Total Price (USD) <span className="text-red-500">*</span></label>
                        <input type="number" name="totalPrice" value={parseFloat(formData.quantity)*parseFloat(formData.unitPrice)} disabled onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} required min="0" step="1" />
                    </div> */}
                    <div>
                  <label className="block font-medium mb-1 dark:text-gray-300">Total Price (USD) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="totalPrice" 
                    value={formData.totalPrice}  // Use stored string value directly
                    disabled 
                    readOnly
                    className={`w-full p-2 border rounded bg-gray-200 dark:bg-gray-600 cursor-not-allowed ${darkMode ? "border-gray-600 text-gray-300" : "border-gray-400 text-gray-500"}`} 
                    step="0.01" 
                  />
                </div>
                    </>
                  )}
              </div>
          </div>
        </section>

        <section className="p-4 border rounded-md dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h6a2 2 0 002-2V9a1 1 0 00-1-1H5a2 2 0 00-2 2v.5a.5.5 0 001 0V8a1 1 0 011-1h12a1 1 0 00-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 001-1V3z" /></svg>
              Metadata & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-300">PO Number (Optional)</label>
                    <input type="text" name="poNumber" value={formData.poNumber} onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} placeholder="e.g., PO-12345"/>
                </div>
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} required>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
             <div className="mt-4">
                <label className="block font-medium mb-1 dark:text-gray-300">Notes (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`} placeholder="Add any relevant notes..." />
            </div>
        </section>
        
        <div className="flex space-x-4 pt-4 border-t dark:border-gray-700">
          <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {loading ? "Saving..." : isEditMode ? "Update Purchase" : "Add Purchase"}
          </button>
          <Link to="/ims/purchases" className={`px-6 py-2 rounded font-semibold transition-colors ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
