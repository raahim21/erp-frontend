import React, { useState, useEffect } from "react";
import ProductList from "./ProductList.jsx";
import ProductForm from "./ProductForm.jsx";

import { API_BASE_URL } from "../../config.js";
const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);



  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
      <ProductForm
        products={products}
        setProducts={setProducts}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
      />
      <ProductList
        products={products}
        setProducts={setProducts}
        setEditingProduct={setEditingProduct}
      />
    </div>
  );
};

export default Inventory;
