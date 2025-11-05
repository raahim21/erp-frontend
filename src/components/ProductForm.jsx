import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Context & Slices
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import {
  fetchProductById,
  addProduct,
  updateProduct,
  fetchBrands,
  addBrand,
  deleteBrand,
  fetchCategories,
  addCategory,
  deleteCategory,
  fetchLocations,
  addLocation,
  deleteLocation,
  clearCurrentProduct,
} from "../Slices/InventorySlice.jsx";

// Child Components
import FullPageSpinner from "./FullPageSpinner.jsx";
import debounce from "lodash.debounce";

/* --- Helper Functions & Components --- */

// Converts an array of items to the { value, label } format for react-select
const toOptions = (arr = [], idField = "_id", labelField = "name") =>
  arr.map(x => ({ value: x[idField], label: x[labelField] }));

// A reusable Icon component for section headers
const SectionIcon = ({ children }) => <div className="text-xl text-indigo-500">{children}</div>;

// A reusable Modal component for managing brands, categories, and locations
const ManagementModal = ({
  isOpen,
  onClose,
  darkMode,
  title,
  items,
  loading,
  onAddItem,
  onDeleteItem,
  onSelectItem,
  newItemFields,
  setNewItem,
  newItem,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white"} transform transition-all`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-600">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add New Item Form */}
        <div className="mb-4 space-y-3 p-4 border rounded-md dark:border-gray-600">
          {children}
          <div className="flex space-x-2">
            <button onClick={onAddItem} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Add {title.slice(0, -1)}
            </button>
          </div>
        </div>

        {/* List of Existing Items */}
        <div className="space-y-2 max-h-60 overflow-auto">
          {loading ? (<p>Loading...</p>) : items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No {title.toLowerCase()} found.</p>
          ) : (
            items.map(item => (
              <div key={item._id} className="flex justify-between items-center p-3 rounded-md border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>}
                  {item.address && <div className="text-sm text-gray-500 dark:text-gray-400">{item.address}</div>}
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button onClick={() => onSelectItem(item)} className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Select</button>
                  <button onClick={() => onDeleteItem(item._id)} className="px-3 py-1 rounded-md text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">Archive</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


/* --- Main ProductForm Component --- */

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const {
    currentProduct,
    loading,
    error,
    brands,
    brandsLoading,
    categories,
    categoriesLoading,
    locations,
    locationsLoading,
  } = useSelector(s => s.inventory);

  const initialFormData = {
    sku: "",
    name: "",
    unit: "piece",
    manufacturer: "",
    brand: null,
    weight: "",
    returnable: false,
    sellable: true,
    purchasable: true,
    sellingPrice: "",
    costPrice:"",
    description: "",
    category: null,
    inventory: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  /* Modal States */
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "" });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", notes: "" });

  /* --- Effects --- */
  useEffect(() => {
    dispatch(fetchBrands({ search: "" }));
    dispatch(fetchCategories({ search: "" }));
    dispatch(fetchLocations({ search: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchProductById({ id, user }));
    } else {
      dispatch(clearCurrentProduct());
      setFormData(initialFormData);
    }
    // Cleanup on unmount
    return () => dispatch(clearCurrentProduct());
  }, [isEdit, id, dispatch, user]);

  useEffect(() => {
    if (isEdit && currentProduct) {
      const productBrand = currentProduct.brand && typeof currentProduct.brand === 'object'
        ? { value: currentProduct.brand._id, label: currentProduct.brand.name } : null;
      const productCategory = currentProduct.category && typeof currentProduct.category === 'object'
        ? { value: currentProduct.category._id, label: currentProduct.category.name } : null;

      setFormData({
        sku: currentProduct.sku || "",
        name: currentProduct.name || "",
        unit: currentProduct.unit || "piece",
        manufacturer: currentProduct.manufacturer || "",
        brand: productBrand,
        weight: currentProduct.weight || "",
        returnable: !!currentProduct.returnable,
        sellable: currentProduct.sellable ?? true,
        purchasable: currentProduct.purchasable ?? true,
        sellingPrice: currentProduct.sellingPrice || "",
        costPrice: currentProduct.costPrice ? Number(Number(currentProduct.costPrice).toPrecision(3)) : "",
        description: currentProduct.description || "",
        category: productCategory,
        inventory: currentProduct.inventory?.map(inv => ({
          location: inv.location && typeof inv.location === 'object' 
            ? { value: inv.location._id, label: inv.location.name } : null,
          quantity: inv.quantity ?? 0
        })) || [],
      });
    }
  }, [currentProduct, isEdit]);

  /* --- Handlers --- */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (selected, name) => setFormData(prev => ({ ...prev, [name]: selected }));

  const addInventoryEntry = () => setFormData(prev => ({ ...prev, inventory: [...prev.inventory, { location: null, quantity: 0 }] }));
  
  const removeInventoryEntry = index => setFormData(prev => ({ ...prev, inventory: prev.inventory.filter((_, i) => i !== index) }));
  
  const handleInventoryChange = (index, field, value) => {
    const next = [...formData.inventory];
    next[index][field] = value;
    setFormData(prev => ({ ...prev, inventory: next }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      brand: formData.brand?.value || null,
      category: formData.category?.value || null,
      inventory: formData.inventory.map(inv => ({ location: inv.location?.value, quantity: isEdit ? Number(inv.quantity || 0) : 0, })),
      sellingPrice: Number(formData.sellingPrice || 0),
      weight: Number(formData.weight || 0),
    };

    try {
      if (isEdit) {
        await dispatch(updateProduct({ id, productData: payload, user })).unwrap();
      } else {
        await dispatch(addProduct({ productData: payload, user })).unwrap();
      }
      navigate("/ims/products");
    } catch (err) {
      toast.error(err.message || "Operation failed. Please check your input.");
    }
  };

  /* Modal Handlers */
  const handleAddBrand = async () => { if (!newBrand.name?.trim()) return toast.warn("Brand name required"); try { await dispatch(addBrand({ brandData: newBrand })).unwrap(); setNewBrand({ name: "" }); setShowBrandModal(false)} catch (err) { toast.error(err.message || "Failed to add brand."); } };
  const handleDeleteBrand = async (bid) => { if (!window.confirm("Archive this brand?")) return; try { await dispatch(deleteBrand({ id: bid })).unwrap(); if (formData.brand?.value === bid) setFormData(prev => ({ ...prev, brand: null })); } catch (err) { toast.error(err.message || "Failed to archive brand."); } };
  const handleAddCategory = async () => { if (!newCategory.name?.trim()) return toast.warn("Category name required"); try { const res = await dispatch(addCategory({ categoryData: newCategory })).unwrap(); setFormData(prev => ({ ...prev, category: { value: res._id, label: res.name } })); setNewCategory({ name: "", description: "" }); setShowCategoryModal(false); } catch (err) { toast.error(err.message || "Failed to add category."); } };
  const handleDeleteCategory = async (cid) => { if (!window.confirm("Archive this category?")) return; try { await dispatch(deleteCategory({ id: cid })).unwrap(); if (formData.category?.value === cid) setFormData(prev => ({ ...prev, category: null })); } catch (err) { toast.error(err.message || "Failed to archive category."); } };
  const handleAddLocation = async () => { if (!newLocation.name?.trim()) return toast.warn("Location name required"); try { await dispatch(addLocation({ locationData: newLocation })).unwrap(); setNewLocation({ name: "", address: "", notes: "" }); setShowLocationModal(false); } catch (err) { toast.error(err.message || "Failed to add location."); } };
  const handleDeleteLocation = async (lid) => { if (!window.confirm("Archive this location?")) return; try { await dispatch(deleteLocation({ id: lid })).unwrap();  setFormData(prev => ({ ...prev, inventory: prev.inventory.map(inv => (inv.location?.value === lid ? { ...inv, location: null } : inv)) })); } catch (err) { toast.error(err.message || "Failed to archive location."); } };
  



  const loadBrands = useCallback(
  debounce((inputValue, callback) => {
    dispatch(fetchBrands({ search: inputValue }))
      .unwrap()
      .then(brands => callback(toOptions(brands)))
      .catch(() => callback([]));
  }, 400),
  [dispatch]
);


const loadCategories = useCallback(
  debounce((inputValue, callback) => {
    dispatch(fetchCategories({ search: inputValue }))
      .unwrap()
      .then(categories => callback(toOptions(categories)))
      .catch(() => callback([]));
  }, 400)

, [dispatch])
  
const loadLocations = useCallback(
  debounce( (inputValue, callback) =>{
    dispatch(fetchLocations({search: inputValue}))
    .unwrap()
    .then( locations => callback(toOptions(locations)))
    .catch( () => callback([]) )
  } ,300)
)


    useEffect(() => {
  return () => {
    loadBrands.cancel();
    loadCategories.cancel();
    loadLocations.cancel();
  };
}, [loadBrands, loadCategories, loadLocations]);

  if (loading && isEdit) return <FullPageSpinner />;
  
  /* --- STYLES --- */
  const selectStyles = {
    control: (provided, state) => ({ ...provided, backgroundColor: darkMode ? "#374151" : "#fff", borderColor: darkMode ? "#4B5563" : "#D1D5DB", color: darkMode ? "#F9FAFB" : "#111827", boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : provided.boxShadow, "&:hover": { borderColor: darkMode ? "#6B7280" : "#9CA3AF" }, minHeight: '42px'}),
    menu: (provided) => ({ ...provided, backgroundColor: darkMode ? "#1F2937" : "#fff", zIndex: 20 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? (darkMode ? "#374151" : "#E5E7EB") : (darkMode ? "#1F2937" : "#fff"), color: darkMode ? "#F9FAFB" : "#111827" }),
    singleValue: (provided) => ({ ...provided, color: darkMode ? "#F9FAFB" : "#111827" }),
    placeholder: (provided) => ({ ...provided, color: darkMode ? "#9CA3AF" : "#6B7280" }),
    input: (provided) => ({...provided, color: darkMode ? "#F9FAFB" : "#111827"}),
  };
  
  const inputClass = `w-full p-2 border rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"}`;
  const modalInputClass = `w-full p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`;
  const buttonClass = "px-4 py-2 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const smallButtonClass = "px-3 h-[42px] rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";


  return (
    <div className={`w-full max-w-5xl mx-auto my-8 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-6 pb-4 border-b ${darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"}`}>
        {isEdit ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 dark:text-gray-200">
            <SectionIcon>📦</SectionIcon>
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">SKU <span className="text-red-500">*</span></label>
              <input name="sku" value={formData.sku} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Product Name <span className="text-red-500">*</span></label>
              <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Category <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-2">
                <div className="flex-grow">
                  <AsyncSelect key={`category-select-${formData.category?.value || 'new'}`} cacheOptions defaultOptions={toOptions(categories)} loadOptions={loadCategories} value={formData.category} onChange={(v) => handleSelectChange(v, "category")} placeholder="Select a category..." styles={selectStyles} required />
                </div>
                <button type="button" onClick={() => setShowCategoryModal(true)} className={`${smallButtonClass} bg-blue-500 hover:bg-blue-600`}>Add</button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Brand</label>
              <div className="flex items-center space-x-2">
                <div className="flex-grow">
                  <AsyncSelect key={`brand-select-${formData.brand?.value || 'new'}`} cacheOptions defaultOptions={toOptions(brands)} loadOptions={loadBrands} value={formData.brand} onChange={(v) => handleSelectChange(v, "brand")} placeholder="Select a brand..." styles={selectStyles} />
                </div>
                <button type="button" onClick={() => setShowBrandModal(true)} className={`${smallButtonClass} bg-blue-500 hover:bg-blue-600`}>Add</button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 dark:text-gray-200">
            <SectionIcon>💲</SectionIcon>
            Pricing & Units
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Selling Price <span className="text-red-500">*</span></label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} min="0" step="0.01" required className={inputClass} />
            </div>


            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">costPrice <span className="text-red-500">*</span></label>
              <input type="number" name="costPrice" value={formData.costPrice} disabled className={inputClass} />
            </div>


            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className={inputClass}>
                <option value="piece">Piece</option><option value="dozen">Dozen</option><option value="box">Box</option><option value="kg">Kilograms</option><option value="g">Grams</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium dark:text-gray-300">Weight (kg)</label>
              <input type="number" step='any' name="weight" value={formData.weight} onChange={handleChange} min="0" className={inputClass} />
            </div>
          </div>
        </section>

        <section>
           <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-xl font-semibold flex items-center gap-3 dark:text-gray-200">
                <SectionIcon>🏢</SectionIcon>
                Inventory
              </h3>
              <button type="button" onClick={() => setShowLocationModal(true)} className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-semibold w-full sm:w-auto">Manage Locations</button>
            </div>
          <div className="space-y-4">
            {formData.inventory.map((inv, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 items-center p-3 rounded-md border dark:border-gray-700">
                <div className="w-full sm:flex-grow">
                  <AsyncSelect cacheOptions defaultOptions={toOptions(locations)} loadOptions={loadLocations} value={inv.location} onChange={(v) => handleInventoryChange(idx, "location", v)} placeholder="Select location..." styles={selectStyles} />
                </div>
                
                <input disabled={!isEdit} type="number" min="0" placeholder="Quantity can only be changed by issuing or purchasing stock" value={inv.quantity} onChange={(e) => handleInventoryChange(idx, "quantity", e.target.value)} className={`${inputClass} w-full sm:w-32`} />
                <button type="button" onClick={() => removeInventoryEntry(idx)} className="w-full sm:w-auto px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md font-semibold transition-colors">Remove</button>
              </div>
            ))}
            {formData.inventory.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No inventory locations added for this product.</p>}
          </div>
          <button type="button" onClick={addInventoryEntry} className="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 font-semibold transition-colors">Add Inventory Location</button>
        </section>
        
        <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 dark:text-gray-200">
              <SectionIcon>⚙️</SectionIcon>
              Properties
            </h3>
            <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-3 sm:space-y-0 items-start">
                <label className="flex items-center space-x-3 cursor-pointer dark:text-gray-300">
                    <input type="checkbox" name="sellable" checked={formData.sellable} onChange={handleChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600" />
                    <span>Is this item sellable?</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer dark:text-gray-300">
                    <input type="checkbox" name="purchasable" checked={formData.purchasable} onChange={handleChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600"/>
                    <span>Is this item purchasable?</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer dark:text-gray-300">
                    <input type="checkbox" name="returnable" checked={formData.returnable} onChange={handleChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600"/>
                    <span>Is this item returnable?</span>
                </label>
            </div>
        </section>

        <div className="flex space-x-4 pt-6 border-t dark:border-gray-700">
          <button type="submit" disabled={loading} className={`${buttonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed`}>
            {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
          </button>
          <Link to="/ims/products" className={`px-6 py-2 rounded-md font-semibold transition-colors ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
            Cancel
          </Link>
        </div>

        {error && <p className="text-red-500 mt-4 text-sm">{error.message || "An unexpected error occurred."}</p>}
      </form>

      {/* --- Modals --- */}
      <ManagementModal title="Brands" isOpen={showBrandModal} onClose={() => setShowBrandModal(false)} darkMode={darkMode} items={brands} loading={brandsLoading} onAddItem={handleAddBrand} onDeleteItem={handleDeleteBrand} onSelectItem={(b) => { setFormData(prev => ({ ...prev, brand: { value: b._id, label: b.name } })); setShowBrandModal(false); }}>
        <input placeholder="New brand name" className={modalInputClass} value={newBrand.name} onChange={(e) => setNewBrand({ name: e.target.value })} />
      </ManagementModal>
      
      <ManagementModal title="Categories" isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} darkMode={darkMode} items={categories} loading={categoriesLoading} onAddItem={handleAddCategory} onDeleteItem={handleDeleteCategory} onSelectItem={(c) => { setFormData(prev => ({ ...prev, category: { value: c._id, label: c.name } })); setShowCategoryModal(false); }}>
        <div className="space-y-2">
            <input placeholder="New category name" className={modalInputClass} value={newCategory.name} onChange={(e) => setNewCategory(p => ({ ...p, name: e.target.value }))} />
            <input placeholder="Description (optional)" className={modalInputClass} value={newCategory.description} onChange={(e) => setNewCategory(p => ({ ...p, description: e.target.value }))} />
        </div>
      </ManagementModal>

      <ManagementModal title="Locations" isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} darkMode={darkMode} items={locations} loading={locationsLoading} onAddItem={handleAddLocation} onDeleteItem={handleDeleteLocation} onSelectItem={(l) => { addInventoryEntry(); const newIndex = formData.inventory.length; handleInventoryChange(newIndex, "location", { value: l._id, label: l.name }); setShowLocationModal(false); }}>
         <div className="space-y-2">
            <input placeholder="New location name" className={modalInputClass} value={newLocation.name} onChange={(e) => setNewLocation(p => ({ ...p, name: e.target.value }))} />
            <input placeholder="Address (optional)" className={modalInputClass} value={newLocation.address} onChange={(e) => setNewLocation(p => ({ ...p, address: e.target.value }))} />
            <input placeholder="Notes (optional)" className={modalInputClass} value={newLocation.notes} onChange={(e) => setNewLocation(p => ({ ...p, notes: e.target.value }))} />
         </div>
      </ManagementModal>

    </div>
  );
};

export default ProductForm;