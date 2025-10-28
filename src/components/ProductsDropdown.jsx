import { useContext } from "react";
import AsyncSelect from "react-select/async";
import { fetchWithAuth } from "../../utils/fetchWithAuth.js";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

import { API_BASE_URL } from '../../config.js'

const ProductDropdown = ({ value, onChange }) => {
  const { darkMode } = useContext(DarkModeContext);

  const loadOptions = async (inputValue) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/api/products?search=${inputValue}&limit=10`
    );
    return res.products.map((product) => {
      const totalQuantity = product.inventory?.reduce(
        (sum, inv) => sum + inv.quantity,
        0
      ) || 0;
      return {
        value: product._id,
        label: `${product.name} (${totalQuantity})`,
      };
    });
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: darkMode ? "#374151" : "#fff", // gray-700 vs white
      borderColor: darkMode ? "#4B5563" : "#D1D5DB", // gray-600 vs gray-300
      color: darkMode ? "#F9FAFB" : "#111827", // text color
      boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : provided.boxShadow,
      "&:hover": {
        borderColor: darkMode ? "#6B7280" : "#9CA3AF",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? "#1F2937" : "#fff", // gray-800 vs white
      color: darkMode ? "#F9FAFB" : "#111827",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? darkMode
          ? "#374151"
          : "#E5E7EB"
        : darkMode
        ? "#1F2937"
        : "#fff",
      color: darkMode ? "#F9FAFB" : "#111827",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: darkMode ? "#F9FAFB" : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? "#9CA3AF" : "#6B7280",
    }),
  };

  return (
    <div className="w-full  border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring focus-within:border-blue-400 dark:bg-gray-700 dark:text-gray-100">
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={value}
        onChange={onChange}
        placeholder="Search products..."
        styles={customStyles}
      />
    </div>
  );
};

export default ProductDropdown;