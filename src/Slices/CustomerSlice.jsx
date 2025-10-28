import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast } from "react-toastify";

// const API_BASE_URL = "http://localhost:5000/api/customers";
// let API_BASE_URL = 'https://erp-backend-production-c9ea.up.railway.app/api/customers'

import { API_BASE_URL } from "../../config";
// Thunk to fetch paginated customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (
    { page = 1, limit = 10, search = "", user },
    { getState, rejectWithValue }
  ) => {
    try {
      if (!user || !user.userId) {
        return rejectWithValue("User not authenticated");
      }

      const params = new URLSearchParams({ page, limit });
      if (search.trim()) {
        params.append("search", encodeURIComponent(search));
      }

      const data = await fetchWithAuth(`${API_BASE_URL}/api/customers/?${params.toString()}`);
      return {
        customers: data.customers || [],
        totalPages: data.totalPages || 1,
        totalResults: data.totalResults || 0,
        page,
        isSearch: !!search.trim(),
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch customers";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to fetch a single customer by ID
export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async ({ id, user }, { rejectWithValue }) => {
    try {
      if (!user || !user.userId) {
        return rejectWithValue("User not authenticated");
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/customers/${id}`);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch customer";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to add a new customer
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async ({ customerData, user }, { getState, rejectWithValue, dispatch }) => {
    try {
      if (!user || !user.userId) {
        return rejectWithValue("User not authenticated");
      }

      const data = await fetchWithAuth(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customerData, userId: user.userId }),
      });

      const { customers } = getState();
      if (Date.now() - customers.lastFetchTime > 5000) {
        await dispatch(
          fetchCustomers({
            page: customers.currentPage,
            search: customers.searchTerm,
            user,
          })
        );
      }
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add customer";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to update an existing customer
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData, user }, { getState, rejectWithValue, dispatch }) => {
    try {
      if (!user || !user.userId) {
        return rejectWithValue("User not authenticated");
      }

      const data = await fetchWithAuth(`${API_BASE_URL}/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customerData, userId: user.userId }),
      });

      const { customers } = getState();
      if (Date.now() - customers.lastFetchTime > 5000) {
        await dispatch(
          fetchCustomers({
            page: customers.currentPage,
            search: customers.searchTerm,
            user,
          })
        );
      }
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update customer";
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to delete a customer
export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async ({ id, user }, { rejectWithValue, getState, dispatch }) => {
    try {
      if (!user || !user.userId) {
        return rejectWithValue("User not authenticated");
      }

      await fetchWithAuth(`${API_BASE_URL}/api/customers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const { customers } = getState();
      if (Date.now() - customers.lastFetchTime > 5000) {
        await dispatch(
          fetchCustomers({
            page: customers.currentPage,
            search: customers.searchTerm,
            user,
          })
        );
      }
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete customer";
      return rejectWithValue(errorMessage);
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    searchResults: [],
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    loading: false,
    error: null,
    currentCustomer: null,
    lastFetchTime: 0,
    lastSearchTerm: "",
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSearch) {
          state.searchResults = action.payload.customers;
        } else {
          state.customers = action.payload.customers;
        }
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalResults = action.payload.totalResults;
        state.lastFetchTime = Date.now();
        state.lastSearchTerm = action.meta.arg.search || "";
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload, {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCustomer = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        toast.success("Customer loaded successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCustomer = null;
        toast.error(action.payload, {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        toast.success("Customer added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Failed to add customer!", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
        state.currentCustomer = null;
        toast.success("Customer updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload, {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
        state.searchResults = state.searchResults.filter(
          (customer) => customer._id !== action.payload
        );
        toast.success("Customer deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Failed to delete customer!", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  },
});

export const { setPage, setSearchTerm, clearCurrentCustomer } = customersSlice.actions;
export default customersSlice.reducer;