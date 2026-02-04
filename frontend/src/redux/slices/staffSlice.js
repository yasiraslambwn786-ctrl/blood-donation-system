import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/staff";

// ======================================================
// ASYNC THUNKS FOR STAFF OPERATIONS
// ======================================================

// 🔹 REGISTER STAFF
export const registerStaff = createAsyncThunk(
  "staff/registerStaff",
  async (staffData, { rejectWithValue }) => {
    try {
      console.log("📤 Staff Registration Data:", staffData);
      
      const response = await axios.post(`${API_URL}/register`, staffData);
      
      console.log("✅ Registration Response:", response.data);

      if (response.data?.token) {
        localStorage.setItem("staffToken", response.data.token);
      }

      const staffDataCombined = {
        user: response.data.user,
        staff: response.data.staff,
        token: response.data.token
      };

      localStorage.setItem("staffData", JSON.stringify(staffDataCombined));

      return staffDataCombined;
    } catch (err) {
      console.log("❌ Registration Error:", err.response?.data || err.message);
      
      if (err.response?.status === 422) {
        const errorData = err.response.data;
        if (errorData.errors) {
          return rejectWithValue({ type: 'validation', data: errorData.errors });
        }
      }
      
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error ||
        "Registration failed. Please try again."
      );
    }
  }
);

// 🔹 LOGIN STAFF
export const loginStaff = createAsyncThunk(
  "staff/loginStaff",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);

      if (response.data?.token) {
        localStorage.setItem("staffToken", response.data.token);
      }

      const staffDataCombined = {
        user: response.data.user,
        staff: response.data.staff,
        token: response.data.token
      };

      localStorage.setItem("staffData", JSON.stringify(staffDataCombined));

      return staffDataCombined;
    } catch (err) {
      console.log("❌ Login Error:", err.response?.data || err.message);
      
      if (err.response?.status === 422) {
        const errorData = err.response.data;
        if (errorData.errors) {
          return rejectWithValue({ type: 'validation', data: errorData.errors });
        }
      }
      
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error ||
        "Login failed. Please check your credentials."
      );
    }
  }
);

// 🔹 FETCH STAFF DASHBOARD STATISTICS
export const fetchStaffStats = createAsyncThunk(
  "staff/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Stats Fetch Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load dashboard statistics"
      );
    }
  }
);

// 🔹 FETCH STAFF NOTIFICATIONS
export const fetchStaffNotifications = createAsyncThunk(
  "staff/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Notifications Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load notifications"
      );
    }
  }
);

// 🔹 CREATE BLOOD REQUEST
export const createBloodRequest = createAsyncThunk(
  "staff/createBloodRequest",
  async (requestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.post(`${API_URL}/create-request`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Create Request Error:", err.response?.data || err.message);
      
      if (err.response?.status === 422) {
        return rejectWithValue({ 
          type: 'validation', 
          data: err.response.data.errors 
        });
      }
      
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to create blood request"
      );
    }
  }
);

// 🔹 FETCH BLOOD INVENTORY
export const fetchBloodInventory = createAsyncThunk(
  "staff/fetchBloodInventory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/blood-inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Inventory Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load blood inventory"
      );
    }
  }
);

// 🔹 FETCH DONOR LIST
export const fetchDonors = createAsyncThunk(
  "staff/fetchDonors",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/donors`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });
      return response.data;
    } catch (err) {
      console.log("❌ Donors Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load donors"
      );
    }
  }
);

// 🔹 FETCH SENT REQUESTS
export const fetchSentRequests = createAsyncThunk(
  "staff/fetchSentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/sent-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Sent Requests Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load sent requests"
      );
    }
  }
);

// 🔹 FETCH ACCEPT REQUESTS
export const fetchAcceptRequests = createAsyncThunk(
  "staff/fetchAcceptRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("staffToken");
      const response = await axios.get(`${API_URL}/accept-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.log("❌ Accept Requests Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 
        "Failed to load accept requests"
      );
    }
  }
);

// ======================================================
// STAFF SLICE DEFINITION
// ======================================================

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    // Staff authentication data
    staffData: localStorage.getItem("staffData")
      ? JSON.parse(localStorage.getItem("staffData"))
      : null,
    
    // Dashboard statistics
    stats: {
      totalDonors: 0,
      pendingRequests: 0,
      availableBlood: 0,
      todayAppointments: 0,
      emergencyRequests: 0,
      pendingResponses: 0,
      lowStockAlerts: 0,
      pendingVerifications: 0,
      expiringSoon: 0,
      receiverRequests: 0,
      totalRequests: 0,
      completedDonations: 0
    },
    
    // Notifications
    notifications: {
      emergency: [],
      donorConfirmations: [],
      accepterAlerts: [],
      adminMessages: [],
      unreadCount: 0
    },
    
    // Donor management
    donors: {
      list: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      },
      filters: {
        bloodGroup: '',
        location: '',
        lastDonation: ''
      }
    },
    
    // Blood requests
    bloodRequests: {
      sent: [],
      pending: [],
      completed: [],
      emergency: []
    },
    
    // Blood inventory
    inventory: {
      bloodGroups: [],
      expiringSoon: [],
      criticalLow: []
    },
    
    // UI states
    isLoading: false,
    isStatsLoading: false,
    isInventoryLoading: false,
    
    // Error handling
    error: null,
    validationErrors: {},
    
    // Activity logs
    recentActivities: []
  },
  
  reducers: {
    // 🔹 LOGOUT STAFF
    logoutStaff: (state) => {
      state.staffData = null;
      state.stats = {
        totalDonors: 0,
        pendingRequests: 0,
        availableBlood: 0,
        todayAppointments: 0,
        emergencyRequests: 0,
        pendingResponses: 0,
        lowStockAlerts: 0,
        pendingVerifications: 0,
        expiringSoon: 0,
        receiverRequests: 0,
        totalRequests: 0,
        completedDonations: 0
      };
      state.notifications = {
        emergency: [],
        donorConfirmations: [],
        accepterAlerts: [],
        adminMessages: [],
        unreadCount: 0
      };
      state.donors.list = [];
      state.bloodRequests = {
        sent: [],
        pending: [],
        completed: [],
        emergency: []
      };
      state.inventory = {
        bloodGroups: [],
        expiringSoon: [],
        criticalLow: []
      };
      state.error = null;
      state.validationErrors = {};
      state.recentActivities = [];
      
      localStorage.removeItem("staffData");
      localStorage.removeItem("staffToken");
    },
    
    // 🔹 CLEAR ERRORS
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    
    // 🔹 UPDATE STAFF PROFILE
    updateStaffProfile: (state, action) => {
      if (state.staffData) {
        state.staffData.staff = { ...state.staffData.staff, ...action.payload };
        localStorage.setItem("staffData", JSON.stringify(state.staffData));
      }
    },
    
    // 🔹 MARK NOTIFICATION AS READ
    markNotificationAsRead: (state, action) => {
      const { type, id } = action.payload;
      if (state.notifications[type]) {
        state.notifications[type] = state.notifications[type].filter(
          notification => notification.id !== id
        );
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    },
    
    // 🔹 UPDATE DONOR FILTERS
    updateDonorFilters: (state, action) => {
      state.donors.filters = { ...state.donors.filters, ...action.payload };
    },
    
    // 🔹 ADD RECENT ACTIVITY
    addRecentActivity: (state, action) => {
      state.recentActivities.unshift({
        ...action.payload,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      
      // Keep only last 10 activities
      if (state.recentActivities.length > 10) {
        state.recentActivities.pop();
      }
    },
    
    // 🔹 TOGGLE EMERGENCY MODE (for UI)
    toggleEmergencyMode: (state) => {
      if (state.staffData) {
        state.staffData.emergencyMode = !state.staffData.emergencyMode;
      }
    },
    
    // 🔹 UPDATE STATS (for real-time updates)
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // 🔹 UPDATE INVENTORY (for real-time updates)
    updateInventory: (state, action) => {
      state.inventory = { ...state.inventory, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    // ======================================================
    // REGISTER STAFF CASES
    // ======================================================
    builder
      .addCase(registerStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(registerStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffData = action.payload;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(registerStaff.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.type === 'validation') {
          state.validationErrors = action.payload.data;
          state.error = "Please fix the validation errors below.";
        } else {
          state.error = action.payload || "Registration failed";
          state.validationErrors = {};
        }
      });
      
    // ======================================================
    // LOGIN STAFF CASES
    // ======================================================
    builder
      .addCase(loginStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffData = action.payload;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(loginStaff.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.type === 'validation') {
          state.validationErrors = action.payload.data;
          state.error = "Please check your credentials.";
        } else {
          state.error = action.payload || "Login failed";
          state.validationErrors = {};
        }
      });
      
    // ======================================================
    // FETCH STAFF STATS CASES
    // ======================================================
    builder
      .addCase(fetchStaffStats.pending, (state) => {
        state.isStatsLoading = true;
      })
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(fetchStaffStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload || "Failed to load statistics";
      });
      
    // ======================================================
    // FETCH NOTIFICATIONS CASES
    // ======================================================
    builder
      .addCase(fetchStaffNotifications.pending, (state) => {
        // Don't set loading for notifications (background process)
      })
      .addCase(fetchStaffNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(fetchStaffNotifications.rejected, (state) => {
        // Silent fail for notifications
        console.log("Notifications fetch failed (will retry)");
      });
      
    // ======================================================
    // CREATE BLOOD REQUEST CASES
    // ======================================================
    builder
      .addCase(createBloodRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createBloodRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to sent requests
        state.bloodRequests.sent.unshift(action.payload.request);
        // Update stats
        state.stats.pendingRequests += 1;
        state.stats.totalRequests += 1;
        // Add activity
        state.recentActivities.unshift({
          type: 'request_created',
          message: `Created blood request #${action.payload.request.id}`,
          timestamp: new Date().toISOString(),
          id: Date.now()
        });
        // Trim activities
        if (state.recentActivities.length > 10) {
          state.recentActivities.pop();
        }
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.type === 'validation') {
          state.validationErrors = action.payload.data;
          state.error = "Please fix the validation errors.";
        } else {
          state.error = action.payload || "Failed to create blood request";
          state.validationErrors = {};
        }
      });
      
    // ======================================================
    // FETCH BLOOD INVENTORY CASES
    // ======================================================
    builder
      .addCase(fetchBloodInventory.pending, (state) => {
        state.isInventoryLoading = true;
      })
      .addCase(fetchBloodInventory.fulfilled, (state, action) => {
        state.isInventoryLoading = false;
        state.inventory = action.payload;
        // Update stats from inventory
        if (action.payload.criticalLow) {
          state.stats.lowStockAlerts = action.payload.criticalLow.length;
        }
        if (action.payload.expiringSoon) {
          state.stats.expiringSoon = action.payload.expiringSoon.length;
        }
      })
      .addCase(fetchBloodInventory.rejected, (state, action) => {
        state.isInventoryLoading = false;
        state.error = action.payload || "Failed to load inventory";
      });
      
    // ======================================================
    // FETCH DONORS CASES
    // ======================================================
    builder
      .addCase(fetchDonors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDonors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.donors.list = action.payload.donors;
        state.donors.pagination = action.payload.pagination;
        state.stats.totalDonors = action.payload.pagination.totalItems;
      })
      .addCase(fetchDonors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load donors";
      });
      
    // ======================================================
    // FETCH SENT REQUESTS CASES
    // ======================================================
    builder
      .addCase(fetchSentRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bloodRequests.sent = action.payload.requests;
        state.bloodRequests.pending = action.payload.pending;
        state.bloodRequests.emergency = action.payload.emergency;
        state.stats.pendingRequests = action.payload.pending.length;
        state.stats.emergencyRequests = action.payload.emergency.length;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load sent requests";
      });
      
    // ======================================================
    // FETCH ACCEPT REQUESTS CASES
    // ======================================================
    builder
      .addCase(fetchAcceptRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAcceptRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update pending verifications
        state.stats.pendingVerifications = action.payload.length;
      })
      .addCase(fetchAcceptRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load accept requests";
      });
  }
});

// Export all actions
export const { 
  logoutStaff, 
  clearErrors, 
  updateStaffProfile, 
  markNotificationAsRead,
  updateDonorFilters,
  addRecentActivity,
  toggleEmergencyMode,
  updateStats,
  updateInventory
} = staffSlice.actions;

export default staffSlice.reducer;