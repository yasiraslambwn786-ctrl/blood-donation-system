import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosInstance';

// Initial state
const initialState = {
  donor: JSON.parse(localStorage.getItem('donorData')) || null,
  token: localStorage.getItem('donorToken') || null,
  loading: false,
  error: null,
};

// ==================== ASYNC ACTIONS ====================

// 1. REGISTER DONOR - FIXED VERSION
export const registerDonor = createAsyncThunk(
  'donor/register',
  async (registerData, { rejectWithValue }) => {
    try {
      console.log("📤 Sending registration data:", registerData);
      
      const response = await axios.post('/donor/register', registerData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log("✅ Registration response:", response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Registration failed");
      }
      
      const token = response.data.token;
      const donor = response.data.donor;
      
      if (!token) {
        throw new Error("No authentication token received");
      }
      
      localStorage.setItem('donorToken', token);
      if (donor) {
        localStorage.setItem('donorData', JSON.stringify(donor));
      }
      
      // ✅ Save credentials for auto-fill
      if (registerData.cnic && registerData.password) {
        const credentialsToSave = {
          cnic: registerData.cnic,
          password: registerData.password,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('donorCredentials', JSON.stringify(credentialsToSave));
        console.log("💾 Credentials saved for auto-fill");
      }
      
      console.log("💾 Token saved successfully");
      
      return {
        token: token,
        donor: donor
      };
      
    } catch (error) {
      console.error("❌ Registration failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: error.config?.url
      });
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.status === 405) {
        errorMessage = "Server error: Method not allowed. Please check if the endpoint exists.";
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorList = Object.values(errors).flat();
          errorMessage = errorList.join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// 2. LOGIN DONOR - FIXED VERSION (WITH CNIC LOGIN)
export const loginDonor = createAsyncThunk(
  'donor/login',
  async (loginData, { rejectWithValue }) => {
    try {
      console.log("📤 Login attempt:", loginData);
      
      const response = await axios.post('/donor/login', loginData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log("✅ Login response:", response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }
      
      const token = response.data.token;
      const donor = response.data.donor;
      
      if (!token) {
        throw new Error("No authentication token received");
      }
      
      localStorage.setItem('donorToken', token);
      if (donor) {
        localStorage.setItem('donorData', JSON.stringify(donor));
      }
      
      // ✅ Save credentials for auto-fill
      if (loginData.cnic && loginData.password) {
        const credentialsToSave = {
          cnic: loginData.cnic,
          password: loginData.password,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('donorCredentials', JSON.stringify(credentialsToSave));
        console.log("💾 Login credentials saved");
      }
      
      return { token, donor };
      
    } catch (error) {
      console.error("❌ Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response?.status === 401) {
        errorMessage = "Invalid credentials";
      } else if (error.response?.status === 404) {
        errorMessage = "Donor not found. Please register first.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// 3. LOGOUT DONOR
export const logoutDonor = createAsyncThunk(
  'donor/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('donorToken');
      if (token) {
        await axios.post('/donor/logout', {}, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
      }
    } catch (error) {
      console.log("⚠️ Logout API error (ignoring):", error.message);
    } finally {
      // Clear auth data but keep credentials for auto-fill
      localStorage.removeItem('donorToken');
      localStorage.removeItem('donorData');
      // DON'T clear donorCredentials - keep for next login
      return true;
    }
  }
);

// 4. FETCH DONOR PROFILE
export const fetchDonorProfile = createAsyncThunk(
  'donor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('donorToken');
      if (!token) throw new Error("No authentication token found");
      
      const response = await axios.get('/donor/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      const donor = response.data.donor;
      if (donor) {
        localStorage.setItem('donorData', JSON.stringify(donor));
      }
      
      return donor;
      
    } catch (error) {
      console.error("❌ Profile fetch error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Failed to fetch profile";
      
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem('donorToken');
        localStorage.removeItem('donorData');
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Update donor profile
export const updateDonorProfile = createAsyncThunk(
  'donor/updateProfile',
  async (updatedData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('donorToken');
      const formData = new FormData();
      
      Object.keys(updatedData).forEach(key => {
        formData.append(key, updatedData[key]);
      });
      
      const response = await axios.post('/donor/update-profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data.donor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

const donorSlice = createSlice({
  name: 'donor',
  initialState,
  reducers: {
    setDonor: (state, action) => {
      state.donor = action.payload.donor;
      state.token = action.payload.token;
    },
    clearDonor: (state) => {
      state.donor = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('donorToken', action.payload);
    }
  },
  extraReducers: (builder) => {
    // ========== REGISTER DONOR ==========
    builder.addCase(registerDonor.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log("🔄 Registration started...");
    });
    builder.addCase(registerDonor.fulfilled, (state, action) => {
      state.loading = false;
      state.donor = action.payload.donor;
      state.token = action.payload.token;
      state.error = null;
      console.log("✅ Registration successful in Redux");
    });
    builder.addCase(registerDonor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      console.log("❌ Registration failed in Redux:", action.payload);
    });

    // ========== LOGIN DONOR ==========
    builder.addCase(loginDonor.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginDonor.fulfilled, (state, action) => {
      state.loading = false;
      state.donor = action.payload.donor;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(loginDonor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ========== LOGOUT DONOR ==========
    builder.addCase(logoutDonor.fulfilled, (state) => {
      state.donor = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    });

    // ========== FETCH PROFILE ==========
    builder.addCase(fetchDonorProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDonorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.donor = action.payload;
    });
    builder.addCase(fetchDonorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setDonor, clearDonor, clearError, setToken } = donorSlice.actions;
export default donorSlice.reducer;