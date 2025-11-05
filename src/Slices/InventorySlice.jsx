// src/Slices/inventorySlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast } from "react-toastify";
// const API_BASE_URL = `https://erp-backend-production-c9ea.up.railway.app`
import { API_BASE_URL } from "../../config";

const API_BASE = `${API_BASE_URL}/api/products`;
const API_BRANDS = `${API_BASE_URL}/api/brands`;
const API_CATEGORIES = `${API_BASE_URL}/api/categories`;
const API_LOCATIONS = `${API_BASE_URL}/api/locations`;
let abortController;
/* ======================
   Products
   ====================== */

export const fetchProducts = createAsyncThunk(
  "inventory/fetchProducts",
  async ({ page = 1, limit = 10, search = "", activeFilter = {}, user } = {}, { rejectWithValue }) => {
    try {
      if (!user || !user.userId) return rejectWithValue("User not authenticated");
      const params = new URLSearchParams({ page, limit });
      if (activeFilter.startDate) params.append("startDate", new Date(activeFilter.startDate).toISOString());
      if (activeFilter.endDate) params.append("endDate", new Date(activeFilter.endDate).toISOString());
      if (activeFilter.startQuantity) params.append("startQuantity", activeFilter.startQuantity);
      if (activeFilter.endQuantity) params.append("endQuantity", activeFilter.endQuantity);
      if (activeFilter.username) params.append("username", activeFilter.username);
      // FIX: Remove .value (activeFilter.category is already the ID string).
      if (activeFilter.category) params.append("category", activeFilter.category);
      if (search?.trim()) params.append("search", encodeURIComponent(search.trim()));
      // ensure backend filters out isDeleted items; but append explicitly if you want
      params.append("isDeleted", "false");

      const data = await fetchWithAuth(`${API_BASE}?${params.toString()}`);
      return {
        products: data.products || [],
        totalPages: data.totalPages || 1,
        totalResults: data.totalResults || 0,
        page,
        isSearch: !!search.trim(),
      };
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch products";
      return rejectWithValue(msg);
    }
  }
);
export const fetchProductById = createAsyncThunk(
  "inventory/fetchProductById",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user || !user.userId) return rejectWithValue("User not authenticated");
      const res = await fetchWithAuth(`${API_BASE}/${id}`);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch product";
      return rejectWithValue(msg);
    }
  }
);

export const addProduct = createAsyncThunk(
  "inventory/addProduct",
  async ({ productData, user }, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!user || !user.userId) return rejectWithValue("User not authenticated");
      const res = await fetchWithAuth(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, userId: user.userId }),
      });
      const { products } = getState().inventory;
      // refresh list
      await dispatch(fetchProducts({ page: products.currentPage || 1, limit: products.limit || 10, search: products.searchTerm || "", activeFilter: products.activeFilter || {}, user })).catch(()=>{});
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add product";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "inventory/updateProduct",
  async ({ id, productData, user }, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!user || !user.userId) return rejectWithValue("User not authenticated");
      const res = await fetchWithAuth(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, userId: user.userId }),
      });
      const { products } = getState().inventory;
      await dispatch(fetchProducts({ page: products.currentPage || 1, limit: products.limit || 10, search: products.searchTerm || "", activeFilter: products.activeFilter || {}, user })).catch(()=>{});
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to update product";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "inventory/softDeleteProduct",
  async ({ id, user }, { dispatch, getState, rejectWithValue }) => {
    try {
      if (!user || !user.userId) return rejectWithValue("User not authenticated");
      // backend expected DELETE to soft-delete; if you prefer PATCH use appropriate route.
      await fetchWithAuth(`${API_BASE}/${id}`, { method: "DELETE" });
      const { products } = getState().inventory;
      await dispatch(fetchProducts({ page: products.currentPage || 1, limit: products.limit || 10, search: products.searchTerm || "", activeFilter: products.activeFilter || {}, user })).catch(()=>{});
      return id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to delete product";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* ======================
   Brands / Categories / Locations (lists + CRUD)
   All deletes are soft deletes (backend must handle isDeleted)
   ====================== */

/* BRANDS */
export const fetchBrands = createAsyncThunk(
  "inventory/fetchBrands",
  async ({ search = "" } = {}, { rejectWithValue, signal }) => {
    
    try {
      const params = new URLSearchParams({ search, isDeleted: "false" });
      const res = await fetchWithAuth(`${API_BRANDS}?${params.toString()}`, {signal});
      console.log(res)
      return res.brands || [];
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch brands";
      return rejectWithValue(msg);
    }
  }
);

export const addBrand = createAsyncThunk(
  "inventory/addBrand",
  async ({ brandData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(API_BRANDS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });
      toast.success("Brand added.");
      await dispatch(fetchBrands({ search: "" })).catch(()=>{});
      return res;
    } catch (err) {
      if (signal.aborted) {
        throw err; 
      }
      const msg = err?.response?.data?.message || err.message || "Failed to add brand";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "inventory/deleteBrand",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      await fetchWithAuth(`${API_BRANDS}/${id}`, { method: "DELETE" });
      toast.success("Brand archived.");
      await dispatch(fetchBrands({ search: "" })).catch(()=>{});
      return id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to delete brand";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* CATEGORIES */
export const fetchCategories = createAsyncThunk(
  "inventory/fetchCategories",
  async ({ search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ search, isDeleted: "false" });
      
      const res = await fetchWithAuth(`${API_CATEGORIES}?${params.toString()}`);
      return res.categories || [];
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch categories";
      return rejectWithValue(msg);
    }
  }
);

export const addCategory = createAsyncThunk(
  "inventory/addCategory",
  async ({ categoryData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(API_CATEGORIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      toast.success("Category added.");
      await dispatch(fetchCategories({ search: "" })).catch(()=>{});
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add category";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "inventory/deleteCategory",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      await fetchWithAuth(`${API_CATEGORIES}/${id}`, { method: "DELETE" });
      toast.success("Category archived.");
      await dispatch(fetchCategories({ search: "" })).catch(()=>{});
      return id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to delete category";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* LOCATIONS */
export const fetchLocations = createAsyncThunk(
  "inventory/fetchLocations",
  async ({ search = "" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ search, isDeleted: "false" });
      const res = await fetchWithAuth(`${API_LOCATIONS}?${params.toString()}`);
      return res.locations || [];
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch locations";
      return rejectWithValue(msg);
    }
  }
);

export const addLocation = createAsyncThunk(
  "inventory/addLocation",
  async ({ locationData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(API_LOCATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });
      toast.success("Location added.");
      await dispatch(fetchLocations({ search: "" })).catch(()=>{});
      return res;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add location";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteLocation = createAsyncThunk(
  "inventory/deleteLocation",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      await fetchWithAuth(`${API_LOCATIONS}/${id}`, { method: "DELETE" });
      toast.success("Location archived.");
      await dispatch(fetchLocations({ search: "" })).catch(()=>{});
      return id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to delete location";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

/* ======================
   Slice
   ====================== */

const initialState = {
  /* products */
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
  searchTerm: "",
  activeFilter: {},
  lastFetchTime: 0,
  // lists
  brands: [],
  brandsLoading: false,
  categories: [],
  categoriesLoading: false,
  locations: [],
  locationsLoading: false,
  limit: 10,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setActiveFilter(state, action) {
      state.activeFilter = action.payload;
      state.currentPage = 1;
    },
    setPage(state, action) {
      state.currentPage = action.payload;
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* products */
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSearch) state.products = action.payload.products;
        else state.products = action.payload.products;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalResults = action.payload.totalResults;
        state.lastFetchTime = Date.now();
        state.searchTerm = action.meta.arg.search || "";
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; state.currentProduct = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(addProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addProduct.fulfilled, (state) => { state.loading = false; })
      .addCase(addProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state) => { state.loading = false; })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // BRANDS
.addCase(fetchBrands.pending, (state) => {
  state.brandsLoading = true;
})
.addCase(fetchBrands.fulfilled, (state, action) => {
  state.brandsLoading = false;
  state.brands = action.payload;
})
.addCase(fetchBrands.rejected, (state, action) => {
  state.brandsLoading = false;
  state.error = action.payload;
})

.addCase(addBrand.pending, (state) => {
  state.loading = true;
})
.addCase(addBrand.fulfilled, (state, action) => {
  state.loading = false;
})
.addCase(addBrand.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(deleteBrand.pending, (state) => {
  state.loading = true;
})
.addCase(deleteBrand.fulfilled, (state, action) => {
  state.loading = false;
  const deletedId = action.payload;
  state.brands = state.brands.filter((b) => b._id !== deletedId);
})
.addCase(deleteBrand.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})


// CATEGORIES
.addCase(fetchCategories.pending, (state) => {
  state.categoriesLoading = true;
})
.addCase(fetchCategories.fulfilled, (state, action) => {
  state.categoriesLoading = false;
  state.categories = action.payload;
})
.addCase(fetchCategories.rejected, (state, action) => {
  state.categoriesLoading = false;
  state.error = action.payload;
})

.addCase(addCategory.pending, (state) => {
  state.loading = true;
})
.addCase(addCategory.fulfilled, (state, action) => {
  state.loading = false;
  // state.categories.push(action.payload);
})
.addCase(addCategory.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(deleteCategory.pending, (state) => {
  state.loading = true;
})
.addCase(deleteCategory.fulfilled, (state, action) => {
  state.loading = false;
  const deletedId = action.payload;
  state.categories = state.categories.filter((c) => c._id !== deletedId);
})
.addCase(deleteCategory.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})


// LOCATIONS
.addCase(fetchLocations.pending, (state) => {
  state.locationsLoading = true;
})
.addCase(fetchLocations.fulfilled, (state, action) => {
  state.locationsLoading = false;
  state.locations = action.payload;
})
.addCase(fetchLocations.rejected, (state, action) => {
  state.locationsLoading = false;
  state.error = action.payload;
})

.addCase(addLocation.pending, (state) => {
  state.loading = true;
})
.addCase(addLocation.fulfilled, (state, action) => {
  state.loading = false;
})
.addCase(addLocation.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

.addCase(deleteLocation.pending, (state) => {
  state.loading = true;
})
.addCase(deleteLocation.fulfilled, (state, action) => {
  state.loading = false;
  const deletedId = action.payload;
  state.locations = state.locations.filter((l) => l._id !== deletedId);
})
.addCase(deleteLocation.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
});


  },
});

export const { setActiveFilter, setPage, setSearchTerm, clearCurrentProduct } = inventorySlice.actions;
export default inventorySlice.reducer;
