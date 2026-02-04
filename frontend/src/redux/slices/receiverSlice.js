// src/redux/slices/receiverSlice.js - FIXED WITH clearError EXPORT
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('receiverToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('receiverToken');
      localStorage.removeItem('receiverData');
      localStorage.removeItem('userRole');
      window.location.href = '/receiver/login';
    }
    return Promise.reject(error);
  }
);

// ================ ASYNC THUNKS ================

// ✅ Receiver Registration
export const registerReceiver = createAsyncThunk(
  'receiver/register',
  async (receiverData, { rejectWithValue }) => {
    try {
      console.log('Registering receiver with data:', receiverData);
      const response = await axiosInstance.post('/receiver/register', receiverData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed'
      );
    }
  }
);

// ✅ Receiver Login
export const loginReceiver = createAsyncThunk(
  'receiver/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login attempt with:', { 
        identifier: credentials.email || credentials.id_card,
        hasEmail: !!credentials.email,
        hasIdCard: !!credentials.id_card 
      });
      
      const response = await axiosInstance.post('/receiver/login', credentials);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Invalid credentials'
      );
    }
  }
);

// ✅ NEW: Send OTP
export const sendOTP = createAsyncThunk(
  'receiver/sendOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      console.log('📤 Sending OTP to:', otpData.mobile_number);
      const response = await axiosInstance.post('/receiver/send-otp', otpData);
      console.log('OTP send response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to send OTP'
      );
    }
  }
);

// ✅ Verify Mobile OTP
export const verifyMobile = createAsyncThunk(
  'receiver/verifyMobile',
  async (verificationData, { rejectWithValue }) => {
    try {
      console.log('Verifying mobile with OTP:', verificationData.mobile_number);
      const response = await axiosInstance.post('/receiver/verify-mobile', verificationData);
      console.log('Mobile verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Mobile verification error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'OTP verification failed'
      );
    }
  }
);

// ✅ NEW: Resend OTP
export const resendOTP = createAsyncThunk(
  'receiver/resendOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      console.log('🔄 Resending OTP to:', otpData.mobile_number);
      const response = await axiosInstance.post('/receiver/resend-otp', otpData);
      console.log('OTP resend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to resend OTP'
      );
    }
  }
);

// ✅ Get Mobile by Identifier (Email/ID Card)
export const getMobileByIdentifier = createAsyncThunk(
  'receiver/getMobileByIdentifier',
  async (data, { rejectWithValue }) => {
    try {
      console.log('Getting mobile for identifier:', data);
      
      // Transform data to match backend expectations
      const requestData = {
        identifier: data.email || data.id_card,
        type: data.email ? 'email' : 'id_card'
      };
      
      console.log('Transformed request data:', requestData);
      
      const response = await axiosInstance.post('/receiver/get-mobile-by-identifier', requestData);
      console.log('Mobile retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get mobile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to retrieve mobile number'
      );
    }
  }
);

// ✅ Resend Mobile OTP (for backward compatibility)
export const resendMobileOTP = createAsyncThunk(
  'receiver/resendMobileOTP',
  async (verificationData, { rejectWithValue }) => {
    try {
      console.log('Resending OTP to:', verificationData.mobile_number);
      const response = await axiosInstance.post('/receiver/resend-mobile-otp', verificationData);
      console.log('OTP resend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to resend OTP'
      );
    }
  }
);

// ✅ Verify Email
export const verifyEmail = createAsyncThunk(
  'receiver/verifyEmail',
  async (verificationData, { rejectWithValue }) => {
    try {
      console.log('Verifying email:', verificationData.email);
      const response = await axiosInstance.post('/receiver/verify-email', verificationData);
      console.log('Email verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Email verification failed'
      );
    }
  }
);

// ✅ Resend Verification Email
export const resendVerificationEmail = createAsyncThunk(
  'receiver/resendVerificationEmail',
  async (emailData, { rejectWithValue }) => {
    try {
      console.log('Resending verification email to:', emailData.email);
      const response = await axiosInstance.post('/receiver/resend-verification-email', emailData);
      console.log('Verification email resend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend verification email error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to resend verification email'
      );
    }
  }
);

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk(
  'receiver/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      console.log('Forgot password request for:', emailData.email);
      const response = await axiosInstance.post('/receiver/forgot-password', emailData);
      console.log('Forgot password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to process password reset request'
      );
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  'receiver/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      console.log('Resetting password for:', resetData.email);
      const response = await axiosInstance.post('/receiver/reset-password', resetData);
      console.log('Password reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to reset password'
      );
    }
  }
);

// ✅ Fetch Receiver Profile
export const fetchReceiverProfile = createAsyncThunk(
  'receiver/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching receiver profile...');
      const response = await axiosInstance.get('/receiver/profile');
      console.log('Profile fetched:', response.data);
      return response.data.data.receiver;
    } catch (error) {
      console.error('Fetch profile error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch profile'
      );
    }
  }
);

// ✅ Update Receiver Profile
export const updateReceiverProfile = createAsyncThunk(
  'receiver/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('Updating profile with:', profileData);
      const response = await axiosInstance.put('/receiver/profile', profileData);
      console.log('Profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update profile'
      );
    }
  }
);

// ✅ Get Receiver Dashboard
export const fetchReceiverDashboard = createAsyncThunk(
  'receiver/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching receiver dashboard...');
      const response = await axiosInstance.get('/receiver/dashboard');
      console.log('Dashboard fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch dashboard error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch dashboard'
      );
    }
  }
);

// ✅ Get Verification Status
export const fetchVerificationStatus = createAsyncThunk(
  'receiver/fetchVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching verification status...');
      const response = await axiosInstance.get('/receiver/verification-status');
      console.log('Verification status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch verification status error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch verification status'
      );
    }
  }
);

// ✅ Create Blood Request
export const createBloodRequest = createAsyncThunk(
  'receiver/createBloodRequest',
  async (bloodRequestData, { rejectWithValue }) => {
    try {
      console.log('Creating blood request:', bloodRequestData);
      const response = await axiosInstance.post('/receiver/blood-requests', bloodRequestData);
      console.log('Blood request created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create blood request error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create blood request'
      );
    }
  }
);

// ✅ Get Blood Requests
export const fetchBloodRequests = createAsyncThunk(
  'receiver/fetchBloodRequests',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching blood requests...');
      const response = await axiosInstance.get('/receiver/blood-requests');
      console.log('Blood requests fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch blood requests error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch blood requests'
      );
    }
  }
);

// ✅ Logout Receiver
export const logoutReceiver = createAsyncThunk(
  'receiver/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logging out receiver...');
      const response = await axiosInstance.post('/receiver/logout');
      console.log('Logout successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to logout'
      );
    }
  }
);

// ================ REDUX SLICE ================
const receiverSlice = createSlice({
  name: 'receiver',
  initialState: {
    receiver: JSON.parse(localStorage.getItem('receiverData')) || null,
    token: localStorage.getItem('receiverToken') || null,
    isAuthenticated: !!localStorage.getItem('receiverToken'),
    loading: false,
    error: null,
    verificationStatus: null,
    bloodRequests: [],
    dashboardData: null
  },
  reducers: {
    clearReceiverError: (state) => {
      state.error = null;
    },
    clearReceiverData: (state) => {
      state.receiver = null;
      state.token = null;
      state.isAuthenticated = false;
      state.verificationStatus = null;
      state.bloodRequests = [];
      state.dashboardData = null;
      localStorage.removeItem('receiverToken');
      localStorage.removeItem('receiverData');
      localStorage.removeItem('userRole');
    },
    setReceiverToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('receiverToken', action.payload);
    },
    setReceiverData: (state, action) => {
      state.receiver = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('receiverData', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerReceiver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerReceiver.fulfilled, (state, action) => {
        state.loading = false;
        state.receiver = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('receiverToken', action.payload.token);
        localStorage.setItem('receiverData', JSON.stringify(action.payload.user));
        localStorage.setItem('userRole', 'receiver');
      })
      .addCase(registerReceiver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginReceiver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginReceiver.fulfilled, (state, action) => {
        state.loading = false;
        state.receiver = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('receiverToken', action.payload.token);
        localStorage.setItem('receiverData', JSON.stringify(action.payload.user));
        localStorage.setItem('userRole', 'receiver');
      })
      .addCase(loginReceiver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyMobile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyMobile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.receiver) {
          state.receiver = { ...state.receiver, ...action.payload.receiver };
          localStorage.setItem('receiverData', JSON.stringify(state.receiver));
        }
      })
      .addCase(verifyMobile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReceiverDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceiverDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchReceiverDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationStatus = action.payload;
      })
      .addCase(fetchVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// ✅ FIX: Export clearError properly
export const { clearReceiverError, clearReceiverData, setReceiverToken, setReceiverData } = receiverSlice.actions;

// ✅ FIX: Export clearError as alias
export const clearError = clearReceiverError;

// Selectors
export const selectReceiver = (state) => state.receiver.receiver;
export const selectReceiverToken = (state) => state.receiver.token;
export const selectIsReceiverAuthenticated = (state) => state.receiver.isAuthenticated;
export const selectReceiverLoading = (state) => state.receiver.loading;
export const selectReceiverError = (state) => state.receiver.error;
export const selectVerificationStatus = (state) => state.receiver.verificationStatus;
export const selectBloodRequests = (state) => state.receiver.bloodRequests;
export const selectDashboardData = (state) => state.receiver.dashboardData;

export default receiverSlice.reducer;