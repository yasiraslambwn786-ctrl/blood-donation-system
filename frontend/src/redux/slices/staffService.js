import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Backend API base URL
const API_URL = "http://127.0.0.1:8000/api"; // Change if needed

// ============================
// 🔹 LOGIN STAFF
// ============================
export const loginStaff = createAsyncThunk(
  "staff/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/staff/login`, formData);
      // Laravel success response expected { success: true, staff: {...}, token: '...' }
      if (response.data?.success) {
        localStorage.setItem("staffToken", response.data.token);
        localStorage.setItem("staffInfo", JSON.stringify(response.data.staff));
        return response.data.staff;
      } else {
        return rejectWithValue(response.data?.message || "Invalid login credentials");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Server error");
    }
  }
);

// ============================
// 🔹 REGISTER STAFF
// ============================
export const registerStaff = createAsyncThunk(
  "staff/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/staff/register`, formData);
      if (response.data?.success) {
        return response.data.staff;
      } else {
        return rejectWithValue(response.data?.message || "Registration failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Server error");
    }
  }
);

// ============================
// 🔹 SLICE
// ============================
const staffSlice = createSlice({
  name: "staff",
  initialState: {
    staff: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logoutStaff: (state) => {
      state.staff = null;
      localStorage.removeItem("staffToken");
      localStorage.removeItem("staffInfo");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = action.payload;
      })
      .addCase(loginStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(registerStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = action.payload;
      })
      .addCase(registerStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutStaff } = staffSlice.actions;
export default staffSlice.reducer;
