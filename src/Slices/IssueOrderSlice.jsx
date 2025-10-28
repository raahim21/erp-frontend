import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast } from "react-toastify";

// TODO: This should be sourced from environment variables
// const API_BASE_URL = "http://localhost:5000/api/issue-orders";
import { API_BASE_URL } from "../../config";
export const fetchIssueOrders = createAsyncThunk(
  "issueOrders/fetchIssueOrders",
  async ({ page = 1, search = "", startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search.trim()) {
        params.append("search", search);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      const data = await fetchWithAuth(`${API_BASE_URL}/api/issue-orders?${params.toString()}`);
      return { ...data, isSearch: !!search.trim(), page };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch issue orders");
    }
  }
);

export const fetchIssueOrderById = createAsyncThunk(
  "issueOrders/fetchIssueOrderById",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/api/issue-orders/${id}`);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch issue order details");
    }
  }
);

export const addIssueOrder = createAsyncThunk(
  "issueOrders/addIssueOrder",
  async ({ issueOrderData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const newOrder = await fetchWithAuth(`${API_BASE_URL}/api/issue-orders`, {
        method: "POST",
        body: JSON.stringify(issueOrderData),
      });
      // Go to the first page to see the newly added order, keeping current search and filters
      const { searchTerm, activeFilter } = getState().issueOrders;
      dispatch(fetchIssueOrders({ page: 1, search: searchTerm, ...activeFilter }));
      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add issue order");
    }
  }
);

export const updateIssueOrder = createAsyncThunk(
  "issueOrders/updateIssueOrder",
  async ({ id, issueOrderData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const updatedOrder = await fetchWithAuth(`${API_BASE_URL}/api/issue-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(issueOrderData),
      });
      const { currentPage, searchTerm, activeFilter } = getState().issueOrders;
      dispatch(fetchIssueOrders({ page: currentPage, search: searchTerm, ...activeFilter }));
      return updatedOrder;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update issue order");
    }
  }
);

export const deleteIssueOrder = createAsyncThunk(
  "issueOrders/deleteIssueOrder",
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/api/issue-orders/${id}`, { method: "DELETE" });
      const { issueOrders, searchResults, searchTerm, currentPage, activeFilter } = getState().issueOrders;
      const list = searchTerm.trim() ? searchResults : issueOrders;

      const pageToFetch = list.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      dispatch(fetchIssueOrders({ page: pageToFetch, search: searchTerm, ...activeFilter }));
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete issue order");
    }
  }
);

const issueOrdersSlice = createSlice({
  name: "issueOrders",
  initialState: {
    issueOrders: [],
    searchResults: [],
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    currentIssueOrder: null,
    activeFilter: {},
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentIssueOrder: (state) => {
      state.currentIssueOrder = null;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssueOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssueOrders.fulfilled, (state, action) => {
        state.loading = false;
        const { issueOrders, totalPages, page, isSearch } = action.payload;
        if (isSearch) {
          state.searchResults = issueOrders;
        } else {
          state.issueOrders = issueOrders;
        }
        state.currentPage = page;
        state.totalPages = totalPages;
      })
      .addCase(fetchIssueOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIssueOrderById.pending, (state) => {
        state.loading = true;
        state.currentIssueOrder = null;
      })
      .addCase(fetchIssueOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIssueOrder = action.payload;
      })
      .addCase(fetchIssueOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) => [addIssueOrder.fulfilled.type, updateIssueOrder.fulfilled.type, deleteIssueOrder.fulfilled.type].includes(action.type),
        (state, action) => {
          const type = action.type.includes('add') ? 'added' : action.type.includes('update') ? 'updated' : 'deleted';
          toast.success(`Issue Order ${type} successfully!`);
        }
      )
      .addMatcher(
        (action) => [addIssueOrder.rejected.type, updateIssueOrder.rejected.type, deleteIssueOrder.rejected.type, fetchIssueOrderById.rejected.type].includes(action.type),
        (state, action) => {
          state.error = action.payload;
          toast.error(action.payload);
        }
      );
  },
});

export const { setPage, setSearchTerm, clearError, clearCurrentIssueOrder, setActiveFilter } = issueOrdersSlice.actions;
export default issueOrdersSlice.reducer;