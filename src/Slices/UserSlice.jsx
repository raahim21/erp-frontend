import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";


// let API_BASE_URL = 'https://erp-backend-production-c9ea.up.railway.app'
// const API_BASE_URL = "http://localhost:5000/api";
import { API_BASE_URL } from "../../config";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 1, searchTerm = "", activeFilter = "" }, thunkAPI) => {
    const params = new URLSearchParams();
    params.append("page", page);
    if (searchTerm) params.append("username", searchTerm);
    if (activeFilter.startDate)
      params.append("startDate", activeFilter.startDate);
    if (activeFilter.endDate) params.append("endDate", activeFilter.endDate);
    const response = await fetch(
      `${API_BASE_URL}/api/auth/users-all?${params.toString()}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      return thunkAPI.rejectWithValue("Failed to fetch users");
    }
    const data = await response.json();
    console.log(data);
    return data;
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  searchTerm: "",
  activeFilter: "",
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
};

const userSlice = createSlice({
  initialState,
  name: "users",
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      state.currentPage = 1; // reset to first page on new search
    },
    setActiveFilter(state, action) {
      state.activeFilter = action.payload;
      state.currentPage = 1; // reset to first page on new filter
    },
    setPage(state, action) {
      state.currentPage = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalResults = action.payload.totalResults;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.error.message || "Failed to fetch users");
        state.error = action.error.message;
      });
  },
});

export const { setSearchTerm, setActiveFilter, setPage } = userSlice.actions;

export default userSlice.reducer;
