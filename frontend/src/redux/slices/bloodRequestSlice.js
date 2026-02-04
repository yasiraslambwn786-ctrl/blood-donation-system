// src/redux/slices/bloodRequestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ✅ Create new blood request (for receivers)
export const createBloodRequest = createAsyncThunk(
  "bloodRequest/create",
  async (requestData, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.post(`${API_BASE_URL}/receiver/blood-requests`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to create blood request"
      );
    }
  }
);

// ✅ Get all blood requests for receiver
export const fetchReceiverBloodRequests = createAsyncThunk(
  "bloodRequest/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.get(`${API_BASE_URL}/receiver/blood-requests`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to fetch blood requests"
      );
    }
  }
);

// ✅ Get single blood request by ID
export const fetchBloodRequestById = createAsyncThunk(
  "bloodRequest/fetchById",
  async (requestId, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.get(`${API_BASE_URL}/receiver/blood-requests/${requestId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to fetch blood request details"
      );
    }
  }
);

// ✅ Update blood request
export const updateBloodRequest = createAsyncThunk(
  "bloodRequest/update",
  async ({ requestId, requestData }, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.put(`${API_BASE_URL}/receiver/blood-requests/${requestId}`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to update blood request"
      );
    }
  }
);

// ✅ Cancel blood request
export const cancelBloodRequest = createAsyncThunk(
  "bloodRequest/cancel",
  async (requestId, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.delete(`${API_BASE_URL}/receiver/blood-requests/${requestId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to cancel blood request"
      );
    }
  }
);

// ✅ Get available donors for emergency request
export const fetchAvailableDonors = createAsyncThunk(
  "bloodRequest/fetchDonors",
  async (bloodType, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.get(`${API_BASE_URL}/receiver/available-donors`, {
        params: { blood_type: bloodType },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to fetch available donors"
      );
    }
  }
);

// ✅ Get request statistics
export const fetchRequestStatistics = createAsyncThunk(
  "bloodRequest/statistics",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("receiverToken");
      
      const res = await axios.get(`${API_BASE_URL}/receiver/request-statistics`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to fetch statistics"
      );
    }
  }
);

const bloodRequestSlice = createSlice({
  name: "bloodRequest",
  initialState: {
    // Requests list
    requests: [],
    currentRequest: null,
    
    // Donors
    availableDonors: [],
    
    // Statistics
    statistics: {
      total: 0,
      pending: 0,
      accepted: 0,
      fulfilled: 0,
      cancelled: 0
    },
    
    // UI states
    loading: false,
    creating: false,
    updating: false,
    cancelling: false,
    
    // Messages
    successMessage: null,
    error: null,
    
    // Filters
    filters: {
      status: 'all',
      bloodType: 'all',
      dateRange: 'all'
    }
  },
  
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        bloodType: 'all',
        dateRange: 'all'
      };
    },
    
    resetBloodRequestState: (state) => {
      state.requests = [];
      state.currentRequest = null;
      state.availableDonors = [];
      state.statistics = {
        total: 0,
        pending: 0,
        accepted: 0,
        fulfilled: 0,
        cancelled: 0
      };
      state.successMessage = null;
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ✅ Create blood request
      .addCase(createBloodRequest.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBloodRequest.fulfilled, (state, action) => {
        state.creating = false;
        state.successMessage = action.payload.message || "Blood request created successfully";
        // Add new request to the beginning of the list
        if (action.payload.data) {
          state.requests.unshift(action.payload.data);
          state.statistics.total += 1;
          state.statistics.pending += 1;
        }
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // ✅ Fetch all blood requests
      .addCase(fetchReceiverBloodRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceiverBloodRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data || [];
        
        // Update statistics if included in response
        if (action.payload.statistics) {
          state.statistics = action.payload.statistics;
        }
      })
      .addCase(fetchReceiverBloodRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Fetch single blood request
      .addCase(fetchBloodRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBloodRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload.data;
      })
      .addCase(fetchBloodRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Update blood request
      .addCase(updateBloodRequest.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBloodRequest.fulfilled, (state, action) => {
        state.updating = false;
        state.successMessage = action.payload.message || "Blood request updated successfully";
        
        // Update in requests list
        if (action.payload.data) {
          const index = state.requests.findIndex(req => req.id === action.payload.data.id);
          if (index !== -1) {
            state.requests[index] = action.payload.data;
          }
          
          // Update current request if it's the same
          if (state.currentRequest && state.currentRequest.id === action.payload.data.id) {
            state.currentRequest = action.payload.data;
          }
        }
      })
      .addCase(updateBloodRequest.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // ✅ Cancel blood request
      .addCase(cancelBloodRequest.pending, (state) => {
        state.cancelling = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelBloodRequest.fulfilled, (state, action) => {
        state.cancelling = false;
        state.successMessage = action.payload.message || "Blood request cancelled successfully";
        
        // Update in requests list
        if (action.payload.data) {
          const index = state.requests.findIndex(req => req.id === action.payload.data.id);
          if (index !== -1) {
            state.requests[index] = action.payload.data;
            // Update statistics
            if (state.requests[index].status === 'cancelled') {
              state.statistics.cancelled += 1;
              state.statistics.pending -= 1;
            }
          }
        }
      })
      .addCase(cancelBloodRequest.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      })
      
      // ✅ Fetch available donors
      .addCase(fetchAvailableDonors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDonors = action.payload.data || [];
      })
      .addCase(fetchAvailableDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Fetch request statistics
      .addCase(fetchRequestStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data || state.statistics;
      })
      .addCase(fetchRequestStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearMessages, 
  setCurrentRequest, 
  clearCurrentRequest,
  setFilters, 
  clearFilters,
  resetBloodRequestState 
} = bloodRequestSlice.actions;

export default bloodRequestSlice.reducer;