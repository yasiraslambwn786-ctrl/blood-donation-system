import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosInstance";

// Fetch all donors
export const fetchDonors = createAsyncThunk(
  "request/fetchDonors",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("donorToken");
      const res = await axios.get("/request-donor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// Send request to donor
export const sendRequest = createAsyncThunk(
  "request/sendRequest",
  async ({ donor_id }, thunkAPI) => {
    try {
      const token = localStorage.getItem("donorToken");
      const requester_id = localStorage.getItem("donorId");
      const res = await axios.post(`/request-donor/${donor_id}`, { requester_id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const requestSlice = createSlice({
  name: "request",
  initialState: {
    donors: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch donors
      .addCase(fetchDonors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDonors.fulfilled, (state, action) => { state.loading = false; state.donors = action.payload; })
      .addCase(fetchDonors.rejected, (state, action) => { state.loading = false; state.error = action.payload.message || "Failed to fetch donors"; })

      // Send request
      .addCase(sendRequest.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendRequest.fulfilled, (state, action) => { state.loading = false; state.successMessage = action.payload.message; })
      .addCase(sendRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload.message || "Request failed"; });
  }
});

export const { clearMessages } = requestSlice.actions;
export default requestSlice.reducer;
