import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

// const API_BASE_URL = "http://localhost:5000/api/vendors";
import { API_BASE_URL } from "../../config";

// Thunk to fetch paginated and searchable vendors
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async ({ page = 1, limit = 10, search = "", user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      const params = new URLSearchParams({ page, limit });
      if (search.trim()) {
        params.append("search", search);
      }
      const data = await fetchWithAuth(`${API_BASE_URL}/api/vendors?${params.toString()}`);
      return {
        vendors: data.vendors || [],
        totalPages: data.totalPages || 1,
        page,
        isSearch: !!search.trim(),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch vendors.");
    }
  }
);

// Thunk to fetch a single vendor by ID
export const fetchVendorById = createAsyncThunk(
  "vendors/fetchVendorById",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/vendors/${id}`);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch vendor details.");
    }
  }
);

// Thunk to add a new vendor
export const addVendor = createAsyncThunk(
  "vendors/addVendor",
  async ({ vendorData, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vendorData, userId: user.userId }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add vendor.");
    }
  }
);

// Thunk to update an existing vendor
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, vendorData, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vendorData, userId: user.userId }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update vendor.");
    }
  }
);

// Thunk to delete (archive) a vendor
export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      await fetchWithAuth(`${API_BASE_URL}/api/vendors/${id}`, { method: "DELETE" });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to archive vendor.");
    }
  }
);

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: [],
    searchResults: [],
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    currentVendor: null,
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, handlePending)
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSearch) {
          state.searchResults = action.payload.vendors;
        } else {
          state.vendors = action.payload.vendors;
        }
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchVendors.rejected, handleRejected)

      // Fetch Vendor By ID
      .addCase(fetchVendorById.pending, (state) => {
        handlePending(state);
        state.currentVendor = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        handleRejected(state, action);
        state.currentVendor = null;
      })
      
      // Generic handlers for mutations
      .addCase(addVendor.pending, handlePending)
      .addCase(addVendor.fulfilled, (state) => { state.loading = false; })
      .addCase(addVendor.rejected, handleRejected)
      
      .addCase(updateVendor.pending, handlePending)
      .addCase(updateVendor.fulfilled, (state) => {
        state.loading = false;
        state.currentVendor = null; // Clear current vendor after update
      })
      .addCase(updateVendor.rejected, handleRejected)
      
      .addCase(deleteVendor.pending, handlePending)
      .addCase(deleteVendor.fulfilled, (state) => {
        state.loading = false; 
        // The component will trigger a refetch, so no state change needed here
      })
      .addCase(deleteVendor.rejected, handleRejected);
  },
});

export const { setPage, setSearchTerm, clearCurrentVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
