import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

// const API_BASE_URL = "http://localhost:5000/api/purchases";
import { API_BASE_URL } from "../../config";

const createFilteredQueryString = (search, activeFilter) => {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.append("search", search);
  }
  if (activeFilter.startDate) params.append("startDate", new Date(activeFilter.startDate).toISOString().split("T")[0]);
  if (activeFilter.endDate) params.append("endDate", new Date(activeFilter.endDate).toISOString().split("T")[0]);
  if (activeFilter.type) params.append("type", activeFilter.type);
  if (activeFilter.startQuantity) params.append("startQuantity", activeFilter.startQuantity);
  if (activeFilter.endQuantity) params.append("endQuantity", activeFilter.endQuantity);
  if (activeFilter.username) params.append("username", activeFilter.username);
  if (activeFilter.orderStatus) params.append("status", activeFilter.orderStatus);
  return params.toString();
};

export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async ({ page = 1, limit = 10, search = "", activeFilter = {}, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      
      const filterQuery = createFilteredQueryString(search, activeFilter);
      const data = await fetchWithAuth(`${API_BASE_URL}/api/purchases?page=${page}&limit=${limit}&${filterQuery}`);

      return {
        purchases: data.purchases || [],
        totalPages: data.totalPages || 1,
        totalResults: data.totalResults || 0,
        page,
        isSearch: !!search.trim(),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch purchases.");
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  "purchases/fetchPurchaseById",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/purchases/${id}`);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch purchase details.");
    }
  }
);

export const addPurchase = createAsyncThunk(
  "purchases/addPurchase",
  async ({ purchaseData, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purchaseData, userId: user.userId }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add purchase.");
    }
  }
);

export const updatePurchase = createAsyncThunk(
  "purchases/updatePurchase",
  async ({ id, purchaseData, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      return await fetchWithAuth(`${API_BASE_URL}/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purchaseData, userId: user.userId }),
      });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update purchase.");
    }
  }
);

export const deletePurchase = createAsyncThunk(
  "purchases/deletePurchase",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user?.userId) return rejectWithValue("User not authenticated.");
      await fetchWithAuth(`${API_BASE_URL}/api/purchases/${id}`, { method: "DELETE" });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete purchase.");
    }
  }
);

const purchasesSlice = createSlice({
  name: "purchases",
  initialState: {
    purchases: [],
    searchResults: [],
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    loading: false,
    error: null,
    activeFilter: {},
    currentPurchase: null,
  },
  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
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
      // Fetch Purchases
      .addCase(fetchPurchases.pending, handlePending)
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSearch) {
          state.searchResults = action.payload.purchases;
        } else {
          state.purchases = action.payload.purchases;
        }
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalResults = action.payload.totalResults;
      })
      .addCase(fetchPurchases.rejected, handleRejected)
      
      // Fetch Purchase By ID
      .addCase(fetchPurchaseById.pending, (state) => {
        handlePending(state);
        state.currentPurchase = null;
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload;
      })
      .addCase(fetchPurchaseById.rejected, (state, action) => {
        handleRejected(state, action);
        state.currentPurchase = null;
      })
      
      // Add, Update, Delete common handlers
      .addCase(addPurchase.pending, handlePending)
      .addCase(addPurchase.fulfilled, (state) => { state.loading = false; })
      .addCase(addPurchase.rejected, handleRejected)
      
      .addCase(updatePurchase.pending, handlePending)
      .addCase(updatePurchase.fulfilled, (state) => {
        state.loading = false;
        state.currentPurchase = null;
      })
      .addCase(updatePurchase.rejected, handleRejected)
      
      .addCase(deletePurchase.pending, handlePending)
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        // Refetch will handle list updates, but we can optimistically remove for faster UI response
        state.purchases = state.purchases.filter(p => p._id !== action.payload);
        state.searchResults = state.searchResults.filter(p => p._id !== action.payload);
      })
      .addCase(deletePurchase.rejected, handleRejected);
  },
});

export const { setActiveFilter, setPage, setSearchTerm, clearCurrentPurchase } = purchasesSlice.actions;
export default purchasesSlice.reducer;
