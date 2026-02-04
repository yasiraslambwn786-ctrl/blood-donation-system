import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    loginAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAdminError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { loginAdmin, logoutAdmin, setAdminLoading, setAdminError } = adminSlice.actions;
export default adminSlice.reducer;