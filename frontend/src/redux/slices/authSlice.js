// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ Safe JSON parsing function
const safeJsonParse = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// ✅ API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ Admin login thunk
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin-login`, { 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Admin login failed');
    }
  }
);

// ✅ Donor/Staff login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ role, cnic, password }, { rejectWithValue }) => {
    try {
      const endpoint =
        role === 'donor'
          ? `${API_BASE_URL}/donor-login`
          : `${API_BASE_URL}/staff-login`;

      const response = await axios.post(endpoint, { cnic, password });
      return { ...response.data, role };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// ✅ Get admin profile
export const getAdminProfile = createAsyncThunk(
  'auth/getAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

// ✅ Update admin profile
export const updateAdminProfile = createAsyncThunk(
  'auth/updateAdminProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.put(`${API_BASE_URL}/admin/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update profile');
    }
  }
);

// ✅ Check admin session
export const checkAdminSession = createAsyncThunk(
  'auth/checkAdminSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { valid: false };
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/check-session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { valid: true, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Session check failed');
    }
  }
);

// ✅ FIXED: Stable initial state - only reads from localStorage once
const getInitialState = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const role = localStorage.getItem('userRole');
  
  if (!token) {
    return {
      user: null,
      token: null,
      role: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      permissions: [],
      adminProfile: null,
      sessionValid: false,
      authChecked: true, // ✅ NEW: Flag to prevent re-initialization
    };
  }
  
  return {
    user: safeJsonParse('userData'),
    token,
    role,
    loading: false,
    error: null,
    isAuthenticated: true,
    permissions: safeJsonParse('adminPermissions', []),
    adminProfile: safeJsonParse('adminProfile'),
    sessionValid: false,
    authChecked: true, // ✅ NEW: Flag to prevent re-initialization
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Login success sync action
    loginSuccess: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];
      state.isAuthenticated = true;
      state.error = null;
      state.authChecked = true;
      
      // Store in localStorage
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      if (role === 'admin') {
        localStorage.setItem('adminToken', token);
      }
      if (permissions) {
        localStorage.setItem('adminPermissions', JSON.stringify(permissions));
      }
    },
    
    // ✅ Clear admin data specifically
    clearAdminData: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.adminProfile = null;
      state.sessionValid = false;
      state.authChecked = true;
      
      // Clear admin specific localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminPermissions');
      localStorage.removeItem('adminProfile');
    },
    
    // ✅ Set admin data
    setAdminData: (state, action) => {
      const { admin, permissions } = action.payload;
      state.adminProfile = admin;
      state.user = admin;
      state.permissions = permissions || [];
      state.authChecked = true;
      
      localStorage.setItem('adminProfile', JSON.stringify(admin));
      if (permissions) {
        localStorage.setItem('adminPermissions', JSON.stringify(permissions));
      }
    },
    
    // ✅ Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.adminProfile = null;
      state.sessionValid = false;
      state.authChecked = true;
      
      // Clear all from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      localStorage.removeItem('adminPermissions');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminProfile');
    },
    
    // ✅ Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // ✅ Update admin profile locally
    updateAdminProfileLocal: (state, action) => {
      if (state.adminProfile) {
        state.adminProfile = { ...state.adminProfile, ...action.payload };
      }
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      
      if (state.adminProfile) {
        localStorage.setItem('adminProfile', JSON.stringify(state.adminProfile));
      }
      if (state.user) {
        localStorage.setItem('userData', JSON.stringify(state.user));
      }
    },
    
    // ✅ Mark auth as checked (prevents re-initialization)
    markAuthChecked: (state) => {
      state.authChecked = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.admin;
        state.adminProfile = action.payload.admin;
        state.token = action.payload.token;
        state.role = 'admin';
        state.permissions = action.payload.permissions || ['all'];
        state.isAuthenticated = true;
        state.sessionValid = true;
        state.authChecked = true;

        // Store in localStorage
        localStorage.setItem('userData', JSON.stringify(state.user));
        localStorage.setItem('adminProfile', JSON.stringify(state.adminProfile));
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('adminToken', action.payload.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminPermissions', JSON.stringify(state.permissions));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.sessionValid = false;
        state.authChecked = true;
      })
      
      // Donor/Staff login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.donor || action.payload.staff;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.authChecked = true;

        localStorage.setItem('userData', JSON.stringify(state.user));
        localStorage.setItem('token', state.token);
        localStorage.setItem('userRole', state.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.authChecked = true;
      })
      
      // Get admin profile
      .addCase(getAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.adminProfile = action.payload.data;
        state.user = action.payload.data;
        state.authChecked = true;
        localStorage.setItem('adminProfile', JSON.stringify(action.payload.data));
        localStorage.setItem('userData', JSON.stringify(action.payload.data));
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })
      
      // Update admin profile
      .addCase(updateAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.adminProfile = action.payload.data;
        state.user = action.payload.data;
        state.authChecked = true;
        localStorage.setItem('adminProfile', JSON.stringify(action.payload.data));
        localStorage.setItem('userData', JSON.stringify(action.payload.data));
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })
      
      // Check admin session
      .addCase(checkAdminSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAdminSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionValid = action.payload.valid;
        state.authChecked = true;
        if (!action.payload.valid) {
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAdminSession.rejected, (state) => {
        state.loading = false;
        state.sessionValid = false;
        state.isAuthenticated = false;
        state.authChecked = true;
      });
  },
});

// ✅ Export all actions
export const { 
  loginSuccess, 
  logout, 
  clearError, 
  clearAdminData,
  setAdminData,
  updateAdminProfileLocal,
  markAuthChecked
} = authSlice.actions;

export default authSlice.reducer;