import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../../config";

export const fetchLeaveRequests = createAsyncThunk(
  "leave/fetchLeaveRequests",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leave`, { credentials: "include" });
      if (!response.ok) {
        const error = await response.json();
        return thunkAPI.rejectWithValue(error.msg || "Failed to fetch leave requests");
      }
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue("An unexpected error occurred.");
    }
  }
);

export const createLeaveRequest = createAsyncThunk(
  "leave/createLeaveRequest",
  async (formData, thunkAPI) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.msg || "Failed to submit leave request");
        return thunkAPI.rejectWithValue(data.msg || "Failed to submit leave request");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("An unexpected error occurred.");
    }
  }
);

export const updateLeaveRequestStatus = createAsyncThunk(
  "leave/updateLeaveRequestStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leave/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.msg || "Failed to update status");
        return thunkAPI.rejectWithValue(data.msg || "Failed to update status");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("An unexpected error occurred.");
    }
  }
);

const initialState = {
  requests: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fulfilled
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        toast.success("Leave request submitted successfully!");
      })
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        toast.success("Request status updated!");
      })
      // Pending
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default leaveSlice.reducer;
