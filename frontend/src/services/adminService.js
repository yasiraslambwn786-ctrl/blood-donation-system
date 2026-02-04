// src/services/adminService.js
import axios from 'axios';

// ✅ Use hardcoded API URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login-admin';
    }
    
    // Handle other errors
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// ✅ Export adminApi object (this was missing)
export const adminApi = {
  // Dashboard
  getDashboardStats: () => axiosInstance.get('/admin/dashboard/stats'),
  
  getNotifications: () => axiosInstance.get('/admin/notifications'),
  
  getSystemStatus: () => axiosInstance.get('/admin/system/status'),
  
  // Profile
  getProfile: () => axiosInstance.get('/admin/profile'),
  
  updateProfile: (data) => axiosInstance.put('/admin/profile', data),
  
  // Users Management
  getAllUsers: (params) => axiosInstance.get('/admin/users', { params }),
  
  getUserDetails: (id) => axiosInstance.get(`/admin/users/${id}`),
  
  updateUserStatus: (id, data) => axiosInstance.put(`/admin/users/${id}/status`, data),
  
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  
  // Staff Management
  getStaffList: () => axiosInstance.get('/admin/staff'),
  
  createStaff: (data) => axiosInstance.post('/admin/staff', data),
  
  // Receiver Management
  getReceivers: () => axiosInstance.get('/admin/receivers'),
  
  approveReceiver: (id) => axiosInstance.post(`/admin/receivers/${id}/approve`),
  
  // Blood Inventory
  getInventory: () => axiosInstance.get('/admin/inventory'),
  
  updateInventory: (data) => axiosInstance.put('/admin/inventory', data),
  
  // Reports
  generateReport: (data) => axiosInstance.post('/admin/reports/generate', data, {
    responseType: 'blob'
  }),
  
  // System Settings
  getSettings: () => axiosInstance.get('/admin/settings'),
  
  updateSettings: (data) => axiosInstance.put('/admin/settings', data),
  
  // Emergency Mode
  activateEmergencyMode: (data) => axiosInstance.post('/admin/emergency-mode', data),
  
  // Database Backup
  createBackup: () => axiosInstance.post('/admin/database/backup'),
  
  getBackups: () => axiosInstance.get('/admin/database/backups'),
  
  // Audit Logs
  getAuditLogs: (params) => axiosInstance.get('/admin/audit-logs', { params }),
  
  // Logout
  logout: () => axiosInstance.post('/admin-logout'),
  
  // Admin Authentication
  login: (data) => axiosInstance.post('/admin-login', data),
  
  checkSession: () => axiosInstance.get('/admin/check-session')
};

// ✅ Also export individual service functions
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await adminApi.getDashboardStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  getNotifications: async () => {
    try {
      const response = await adminApi.getNotifications();
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  getSystemStatus: async () => {
    try {
      const response = await adminApi.getSystemStatus();
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },
  
  // Profile
  getProfile: async () => {
    try {
      const response = await adminApi.getProfile();
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  updateProfile: async (data) => {
    try {
      const response = await adminApi.updateProfile(data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Users Management
  getAllUsers: async (params = {}) => {
    try {
      const response = await adminApi.getAllUsers(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserDetails: async (id) => {
    try {
      const response = await adminApi.getUserDetails(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },
  
  updateUserStatus: async (id, data) => {
    try {
      const response = await adminApi.updateUserStatus(id, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await adminApi.deleteUser(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  
  // Staff Management
  getStaffList: async () => {
    try {
      const response = await adminApi.getStaffList();
      return response.data;
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  },
  
  createStaff: async (data) => {
    try {
      const response = await adminApi.createStaff(data);
      return response.data;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },
  
  // Receiver Management
  getReceivers: async () => {
    try {
      const response = await adminApi.getReceivers();
      return response.data;
    } catch (error) {
      console.error('Error fetching receivers:', error);
      throw error;
    }
  },
  
  approveReceiver: async (id) => {
    try {
      const response = await adminApi.approveReceiver(id);
      return response.data;
    } catch (error) {
      console.error('Error approving receiver:', error);
      throw error;
    }
  },
  
  // Blood Inventory
  getInventory: async () => {
    try {
      const response = await adminApi.getInventory();
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },
  
  updateInventory: async (data) => {
    try {
      const response = await adminApi.updateInventory(data);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  },
  
  // Reports
  generateReport: async (data) => {
    try {
      const response = await adminApi.generateReport(data);
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },
  
  // System Settings
  getSettings: async () => {
    try {
      const response = await adminApi.getSettings();
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },
  
  updateSettings: async (data) => {
    try {
      const response = await adminApi.updateSettings(data);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
  
  // Emergency Mode
  activateEmergencyMode: async (data) => {
    try {
      const response = await adminApi.activateEmergencyMode(data);
      return response.data;
    } catch (error) {
      console.error('Error activating emergency mode:', error);
      throw error;
    }
  },
  
  // Database Backup
  createBackup: async () => {
    try {
      const response = await adminApi.createBackup();
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },
  
  getBackups: async () => {
    try {
      const response = await adminApi.getBackups();
      return response.data;
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw error;
    }
  },
  
  // Audit Logs
  getAuditLogs: async (params = {}) => {
    try {
      const response = await adminApi.getAuditLogs(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },
  
  // Admin Authentication
  login: async (email, password) => {
    try {
      const response = await adminApi.login({ email, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await adminApi.logout();
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
  
  checkSession: async () => {
    try {
      const response = await adminApi.checkSession();
      return response.data;
    } catch (error) {
      console.error('Error checking session:', error);
      throw error;
    }
  }
};

// ✅ Export default as well
export default adminService;