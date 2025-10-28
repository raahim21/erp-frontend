import React, { useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import FullPageSpinner from "./FullPageSpinner.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../Slices/InventorySlice.jsx";
import { FiChevronLeft, FiEdit } from "react-icons/fi";

const ProductView = () => {
  const dispatch = useDispatch();
  const {
    currentProduct: product,
    loading,
    error,
  } = useSelector((state) => state.inventory);
  const { isAdmin, isManager, user } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const { id } = useParams();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!user || !user.userId) {
          throw new Error("User not authenticated in component");
        }
        await dispatch(fetchProductById({ id, user })).unwrap();
      } catch (err) {
        console.error("ProductView: Error fetching product:", err.message);
      }
    };
    if (id && user) {
        loadProduct();
    }
  }, [id, dispatch, user]);

  if (loading) return <FullPageSpinner />;
  if (error) return <ErrorMessage darkMode={darkMode} message={error} />;
  if (!product) return <ErrorMessage darkMode={darkMode} message="Product not found" />;

  const totalQuantity =
    product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;

  // ==================================================================
  // FIX: Access the .name property of the populated brand and category objects.
  // ==================================================================
  const productDetails = [
    { label: "Unit", value: product.unit || "pcs" },
    { label: "Brand", value: product.brand?.name || "N/A" }, // <-- THE FIX IS HERE
    { label: "Weight", value: product.weight || "N/A" },
    { label: "Category", value: product.category?.name || "N/A" }, // <-- This was already correct
    { label: "Price", value: `$${product.price?.toFixed(2) || "N/A"}` },
    { label: "Total Stock", value: totalQuantity },
  ];

  const productFlags = [
    { label: "Returnable", value: product.returnable },
    { label: "Sellable", value: product.sellable },
    { label: "Purchasable", value: product.purchasable },
  ];

  return (
    <div className={`max-w-4xl mx-auto mt-8 p-6 sm:ml-[200px] ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{product.name}</h1>
        <div className="flex space-x-4">
          <Link to="/ims/products" className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>
            <FiChevronLeft className="mr-2" />
            Back
          </Link>
          {(isAdmin || isManager) && (
            <Link to={`/ims/products/edit/${product._id}`} className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
              <FiEdit className="mr-2" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Details</h2>
            <div className="space-y-4">
              {productDetails.map(detail => <DetailRow key={detail.label} label={detail.label} value={detail.value} darkMode={darkMode} />)}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Flags</h2>
            <div className="space-y-4">
              {productFlags.map(flag => <FlagRow key={flag.label} label={flag.label} value={flag.value} darkMode={darkMode} />)}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Description</h2>
            <p className="text-base">{product.description || "N/A"}</p>
        </div>

        {product.inventory && product.inventory.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Inventory by Location</h2>
            <ul className="space-y-2">
              {product.inventory.map((inv, index) => (
                <li key={index} className={`flex justify-between p-2 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <span>{inv.location?.name || "Unknown Location"}</span>
                  <span className="font-semibold">{inv.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
       <div className="text-sm text-gray-500 mt-4 text-right">
        Created on: {new Date(product.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

const ErrorMessage = ({ darkMode, message }) => (
  <div className={`text-center mt-6 p-4 rounded-md ${darkMode ? "text-red-400 bg-red-900/20" : "text-red-600 bg-red-100"}`}>
    {message}
  </div>
);

const DetailRow = ({ label, value, darkMode }) => (
  <div className="flex justify-between">
    <span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{label}:</span>
    {/* This span now receives a string ('Brand Name' or 'N/A'), which is valid */}
    <span>{value}</span> 
  </div>
);

const FlagRow = ({ label, value, darkMode }) => (
  <div className="flex items-center justify-between">
    <span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{label}:</span>
    <span className={`px-3 py-1 text-sm rounded-full ${value ? (darkMode ? "bg-green-800 text-green-200" : "bg-green-200 text-green-800") : (darkMode ? "bg-red-800 text-red-200" : "bg-red-200 text-red-800")}`}>
      {value ? "Yes" : "No"}
    </span>
  </div>
);

export default ProductView;