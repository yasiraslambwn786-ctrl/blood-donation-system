// FILE: src/redux/slices/accepterSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosInstance';

// Async thunks
export const loginAccepter = createAsyncThunk(
  'accepter/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/login-accepter', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerAccepter = createAsyncThunk(
  'accepter/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/register-accepter', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutAccepter = createAsyncThunk(
  'accepter/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accepterToken');
      if (token) {
        await axios.post('/accepter/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// Initial state
const initialState = {
  accepter: JSON.parse(localStorage.getItem('accepterData')) || null,
  token: localStorage.getItem('accepterToken') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('accepterToken'),
};

const accepterSlice = createSlice({
  name: 'accepter',
  initialState,
  reducers: {
    setAccepter: (state, action) => {
      state.accepter = action.payload.accepter;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('accepterToken', action.payload.token);
      localStorage.setItem('accepterData', JSON.stringify(action.payload.accepter));
    },
    clearAccepter: (state) => {
      state.accepter = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accepterToken');
      localStorage.removeItem('accepterData');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAccepter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAccepter.fulfilled, (state, action) => {
        state.loading = false;
        state.accepter = action.payload.accepter;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('accepterToken', action.payload.token);
        localStorage.setItem('accepterData', JSON.stringify(action.payload.accepter));
      })
      .addCase(loginAccepter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerAccepter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAccepter.fulfilled, (state, action) => {
        state.loading = false;
        state.accepter = action.payload.accepter;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('accepterToken', action.payload.token);
        localStorage.setItem('accepterData', JSON.stringify(action.payload.accepter));
      })
      .addCase(registerAccepter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutAccepter.fulfilled, (state) => {
        state.accepter = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accepterToken');
        localStorage.removeItem('accepterData');
      });
  },
});

export const { setAccepter, clearAccepter } = accepterSlice.actions;
export default accepterSlice.reducer;