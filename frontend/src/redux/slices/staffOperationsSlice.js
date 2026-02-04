import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ Async thunks for all operations
export const fetchStaffStats = createAsyncThunk(
  'staffOperations/fetchStats',
  async (_, { getState }) => {
    const { staff } = getState();
    const response = await axios.get(`/api/staff/dashboard-stats?staff_id=${staff.staffData.staff.id}`);
    return response.data;
  }
);

export const fetchBloodInventory = createAsyncThunk(
  'staffOperations/fetchInventory',
  async (_, { getState }) => {
    const { staff } = getState();
    const response = await axios.get(`/api/staff/inventory?hospital_id=${staff.staffData.staff.hospital_id}`);
    return response.data;
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'staffOperations/fetchActivities',
  async (_, { getState }) => {
    const { staff } = getState();
    const response = await axios.get(`/api/staff/recent-activities?staff_id=${staff.staffData.staff.id}&limit=10`);
    return response.data;
  }
);

export const fetchTodayAppointments = createAsyncThunk(
  'staffOperations/fetchAppointments',
  async (_, { getState }) => {
    const { staff } = getState();
    const response = await axios.get(`/api/staff/today-appointments?staff_id=${staff.staffData.staff.id}`);
    return response.data;
  }
);

export const searchDonors = createAsyncThunk(
  'staffOperations/searchDonors',
  async (searchParams, { getState }) => {
    const { staff } = getState();
    const response = await axios.post('/api/staff/search-donors', {
      ...searchParams,
      staff_id: staff.staffData.staff.id
    });
    return response.data;
  }
);

export const createBloodRequest = createAsyncThunk(
  'staffOperations/createRequest',
  async (requestData, { getState }) => {
    const { staff } = getState();
    const response = await axios.post('/api/staff/blood-requests', {
      ...requestData,
      staff_id: staff.staffData.staff.id
    });
    return response.data;
  }
);

export const updateInventory = createAsyncThunk(
  'staffOperations/updateInventory',
  async (inventoryData, { getState }) => {
    const { staff } = getState();
    const response = await axios.put('/api/staff/inventory/update', {
      ...inventoryData,
      staff_id: staff.staffData.staff.id
    });
    return response.data;
  }
);

export const scheduleAppointment = createAsyncThunk(
  'staffOperations/scheduleAppointment',
  async (appointmentData, { getState }) => {
    const { staff } = getState();
    const response = await axios.post('/api/staff/appointments', {
      ...appointmentData,
      staff_id: staff.staffData.staff.id
    });
    return response.data;
  }
);

export const generateReport = createAsyncThunk(
  'staffOperations/generateReport',
  async (reportParams, { getState }) => {
    const { staff } = getState();
    const response = await axios.post('/api/staff/reports/generate', {
      ...reportParams,
      staff_id: staff.staffData.staff.id
    });
    return response.data;
  }
);

const staffOperationsSlice = createSlice({
  name: 'staffOperations',
  initialState: {
    stats: null,
    inventory: [],
    activities: [],
    appointments: [],
    searchResults: [],
    currentRequest: null,
    reports: [],
    isLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateInventoryLocal: (state, action) => {
      const { bloodGroup, units } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.bloodGroup === bloodGroup);
      if (itemIndex !== -1) {
        state.inventory[itemIndex].units = units;
        // Update status based on units
        if (units === 0) {
          state.inventory[itemIndex].status = 'critical';
        } else if (units < 5) {
          state.inventory[itemIndex].status = 'low';
        } else {
          state.inventory[itemIndex].status = 'safe';
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Staff Stats
      .addCase(fetchStaffStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStaffStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // ✅ Fetch Blood Inventory
      .addCase(fetchBloodInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBloodInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload.map(item => ({
          ...item,
          status: item.units === 0 ? 'critical' : item.units < 5 ? 'low' : 'safe'
        }));
      })
      .addCase(fetchBloodInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        // Set default inventory if API fails
        state.inventory = [
          { id: 1, bloodGroup: 'A+', units: 12, status: 'safe' },
          { id: 2, bloodGroup: 'B+', units: 18, status: 'safe' },
          { id: 3, bloodGroup: 'O+', units: 25, status: 'safe' },
          { id: 4, bloodGroup: 'AB+', units: 8, status: 'safe' },
          { id: 5, bloodGroup: 'A-', units: 5, status: 'low' },
          { id: 6, bloodGroup: 'B-', units: 3, status: 'critical' },
          { id: 7, bloodGroup: 'O-', units: 4, status: 'low' },
          { id: 8, bloodGroup: 'AB-', units: 2, status: 'critical' }
        ];
      })
      
      // ✅ Fetch Recent Activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        // Set default activities if API fails
        state.activities = [
          { id: 1, time: '10:30 AM', action: 'Blood request created', type: 'request', details: 'Request #BR-001 for B-', status: 'pending', icon: 'file-medical', color: 'primary' },
          { id: 2, time: '11:15 AM', action: 'Donation completed', type: 'donation', details: 'Donor: Ali Raza, B+', status: 'completed', icon: 'tint', color: 'success' },
          { id: 3, time: '09:45 AM', action: 'Appointment scheduled', type: 'appointment', details: 'Donor: Sara Khan, 2PM', status: 'scheduled', icon: 'calendar-plus', color: 'info' },
          { id: 4, time: 'Yesterday 4:30 PM', action: 'Inventory updated', type: 'inventory', details: 'O+ stock increased to 25 units', status: 'completed', icon: 'boxes', color: 'warning' },
          { id: 5, time: 'Yesterday 2:15 PM', action: 'Emergency request', type: 'emergency', details: 'Emergency request for A-', status: 'fulfilled', icon: 'exclamation-triangle', color: 'danger' }
        ];
      })
      
      // ✅ Fetch Today's Appointments
      .addCase(fetchTodayAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchTodayAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        // Set default appointments if API fails
        state.appointments = [
          { id: 1, time: '10:00 AM', donorName: 'Ali Raza', bloodGroup: 'B+', status: 'confirmed' },
          { id: 2, time: '11:00 AM', donorName: 'Sara Khan', bloodGroup: 'O+', status: 'pending' },
          { id: 3, time: '02:00 PM', donorName: 'Ahmed Ali', bloodGroup: 'A+', status: 'confirmed' },
          { id: 4, time: '03:30 PM', donorName: 'Fatima Noor', bloodGroup: 'AB+', status: 'confirmed' },
          { id: 5, time: '04:45 PM', donorName: 'Usman Khan', bloodGroup: 'B-', status: 'pending' }
        ];
      })
      
      // ✅ Create Blood Request
      .addCase(createBloodRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBloodRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequest = action.payload;
        state.successMessage = 'Blood request created successfully!';
        // Add to activities
        state.activities.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Blood request created',
          type: 'request',
          details: `Request #${action.payload.request_code} for ${action.payload.blood_group}`,
          status: 'pending',
          icon: 'file-medical',
          color: 'primary'
        });
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create blood request';
      })
      
      // ✅ Search Donors
      .addCase(searchDonors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDonors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDonors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search donors';
      })
      
      // ✅ Update Inventory
      .addCase(updateInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Inventory updated successfully!';
        // Update local inventory
        const { bloodGroup, units } = action.payload;
        const itemIndex = state.inventory.findIndex(item => item.bloodGroup === bloodGroup);
        if (itemIndex !== -1) {
          state.inventory[itemIndex].units = units;
          state.inventory[itemIndex].status = units === 0 ? 'critical' : units < 5 ? 'low' : 'safe';
        }
        // Add to activities
        state.activities.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Inventory updated',
          type: 'inventory',
          details: `${bloodGroup} stock updated to ${units} units`,
          status: 'completed',
          icon: 'boxes',
          color: 'warning'
        });
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update inventory';
      })
      
      // ✅ Schedule Appointment
      .addCase(scheduleAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(scheduleAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Appointment scheduled successfully!';
        // Add to appointments
        state.appointments.push(action.payload);
        // Add to activities
        state.activities.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Appointment scheduled',
          type: 'appointment',
          details: `Appointment for ${action.payload.donorName} at ${action.payload.time}`,
          status: 'scheduled',
          icon: 'calendar-plus',
          color: 'info'
        });
      })
      .addCase(scheduleAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to schedule appointment';
      })
      
      // ✅ Generate Report
      .addCase(generateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.push(action.payload);
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate report';
      });
  }
});

// ✅ Export actions
export const { 
  clearError, 
  clearSuccessMessage, 
  setSearchResults, 
  clearSearchResults,
  updateInventoryLocal 
} = staffOperationsSlice.actions;

// ✅ Export reducer
export default staffOperationsSlice.reducer;