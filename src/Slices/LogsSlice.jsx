import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";

// const API_BASE_URL = "https://erp-backend-production-c9ea.up.railway.app";
import { API_BASE_URL } from "../../config";
export const fetchLogs = createAsyncThunk(
  "logs/fetchLogs",
  async (
    { search = "", page = 1, limit = 10, filter = {} },
    { rejectWithValue }
  ) => {
    try {
      let query = `page=${page}&limit=${limit}`;
      if (filter.startDate) query += `&startDate=${filter.startDate}`;
      if (filter.endDate) query += `&endDate=${filter.endDate}`;
      if (search) query += `&search=${search}`;
      if (filter.username) query += `&username=${filter.username}`;

      const res = await fetch(
        `${API_BASE_URL}/api/logs/get-user-logs?${query}`,
        {
          credentials: "include", // Send cookies for authentication
        }
      );
      const json = await res.json();
      console.log(json);

      return {
        data: json.data || [],
        totalPages: json.totalPages || 1,
        currentPage: json.currentPage || 1,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

let initialState = {
  logs: [],
  activeFilter: {},
  searchTerm: "",
  loading: false,
  expanded: null,
  error:null,
  selectedUser: null,
  currentPage: 1,
  totalPages: 1,
};

const LogSlice = createSlice({
  name: "logs",
  initialState,

  reducers: {
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
      state.currentPage = 1;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload.currentPage;

        state.logs = action.payload.data;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveFilter, setPage, setSearchTerm } = LogSlice.actions;
export default LogSlice.reducer;
