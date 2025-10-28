import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../../config";

const initialFormData = {
  name: "",
  startDate: "",
  endDate: "",
  notes: "",
  status: "draft",
  shifts: [],
  createdBy: null,
};

// Async Thunks
export const fetchSchedules = createAsyncThunk("schedules/fetchSchedules", async ({ page = 1, filters = {} }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({ page });
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/api/schedules?${query}`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch schedules");
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchSchedule = createAsyncThunk("schedules/fetchSchedule", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, { credentials: "include" });
    if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.msg || "Failed to fetch schedule.");
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createSchedule = createAsyncThunk("schedules/createSchedule", async (scheduleData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(scheduleData),
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.msg || "Failed to create schedule.");
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateSchedule = createAsyncThunk("schedules/updateSchedule", async ({ id, ...scheduleData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(scheduleData),
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.msg || "Failed to update schedule.");
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteSchedule = createAsyncThunk("schedules/deleteSchedule", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.msg || "Failed to delete schedule.");
    }
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});


const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    schedules: [],
    formData: initialFormData,
    loading: false,
    error: null,
    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    searchTerm: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
        state.searchTerm = action.payload;
        state.currentPage = 1; // Reset to first page on new search
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    updateFormData: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetFormData: (state) => {
      state.formData = initialFormData;
      state.error = null;
    },
    addShift: (state) => {
      state.formData.shifts.push({
        _id: `temp_${Date.now()}`,
        date: "",
        requiredPositions: [{ jobPosition: "", count: 1 }],
        assignedEmployees: [],
      });
    },
    removeShift: (state, action) => {
      state.formData.shifts.splice(action.payload, 1);
    },
    updateShift: (state, action) => {
        const { shiftIndex, field, value } = action.payload;
        if(state.formData.shifts[shiftIndex]) {
            state.formData.shifts[shiftIndex][field] = value;
        }
    },
    addRequiredPosition: (state, action) => {
        const { shiftIndex } = action.payload;
        state.formData.shifts[shiftIndex].requiredPositions.push({ jobPosition: '', count: 1 });
    },
    removeRequiredPosition: (state, action) => {
        const { shiftIndex, posIndex } = action.payload;
        state.formData.shifts[shiftIndex].requiredPositions.splice(posIndex, 1);
    },
    updateRequiredPosition: (state, action) => {
        const { shiftIndex, posIndex, field, value } = action.payload;
        state.formData.shifts[shiftIndex].requiredPositions[posIndex][field] = value;
    },
    assignEmployeeToShift: (state, action) => {
        const { shiftIndex, employee } = action.payload;
        const shift = state.formData.shifts[shiftIndex];
        if (shift && !shift.assignedEmployees.some(e => e.user._id === employee._id)) {
            shift.assignedEmployees.push({
                user: employee,
                startTime: '',
                endTime: '',
            });
        }
    },
    unassignEmployeeFromShift: (state, action) => {
        const { shiftIndex, empIndex } = action.payload;
        const shift = state.formData.shifts[shiftIndex];
        if (shift) {
            shift.assignedEmployees.splice(empIndex, 1);
        }
    },
    updateEmployeeInShift: (state, action) => {
        const { shiftIndex, empIndex, field, value } = action.payload;
        const shift = state.formData.shifts[shiftIndex];
        if (shift && shift.assignedEmployees[empIndex]) {
            shift.assignedEmployees[empIndex][field] = value;
        }
    },
    replaceShifts: (state, action) => {
      state.formData.shifts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.schedules = action.payload.schedules;
        state.totalResults = action.payload.totalResults;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.loading = false;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.formData = action.payload;
        state.loading = false;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload);
        state.loading = false;
        toast.success("Schedule created successfully!");
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex((s) => s._id === action.payload.schedule._id);
        if (index !== -1) {
          state.schedules[index] = action.payload.schedule;
        }
        state.formData = action.payload.schedule;
        state.loading = false;
        toast.success(action.payload.msg || "Schedule updated successfully!");
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter((s) => s._id !== action.payload);
        state.loading = false;
        toast.success("Schedule deleted successfully!");
      })
      // Pending
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Rejected
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          if (action.payload) toast.error(action.payload);
        }
      );
  },
});

export const {
  updateFormData,
  resetFormData,
  addShift,
  removeShift,
  updateShift,
  addRequiredPosition,
  removeRequiredPosition,
  updateRequiredPosition,
  assignEmployeeToShift,
  unassignEmployeeFromShift,
  updateEmployeeInShift,
  replaceShifts,
  setCurrentPage,
  setSearchTerm,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
