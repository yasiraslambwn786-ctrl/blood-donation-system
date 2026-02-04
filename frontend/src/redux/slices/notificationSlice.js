// src/redux/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  notifications: [
    {
      id: 1,
      title: 'Welcome to Blood Bank Admin',
      message: 'You have successfully logged in as administrator',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      link: '/admin/dashboard',
      duration: 5000 // Auto-dismiss after 5 seconds
    },
    {
      id: 2,
      title: 'Blood Inventory Low',
      message: 'O+ blood type is below minimum threshold',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: false,
      link: '/admin/inventory'
    },
    {
      id: 3,
      title: 'New Donor Registered',
      message: 'John Doe has registered as a new donor',
      type: 'success',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      read: true,
      link: '/admin/users'
    }
  ],
  unreadCount: 2,
  showToast: false,
  currentToast: null
};

// Create slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // ✅ ADD THIS: Show notification/toast
    showNotification: (state, action) => {
      const { title, message, type = 'info', duration = 5000, link } = action.payload;
      
      // Create new notification
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        link,
        duration
      };
      
      // Add to notifications list
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      
      // Set as current toast
      state.currentToast = newNotification;
      state.showToast = true;
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      
      // Auto-hide toast after duration
      if (duration > 0) {
        setTimeout(() => {
          state.showToast = false;
        }, duration);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // ✅ Hide toast notification
    hideNotification: (state) => {
      state.showToast = false;
      state.currentToast = null;
    },
    
    // Add new notification (legacy)
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // Mark single notification as read
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        
        // Save to localStorage
        try {
          const notificationsToSave = {
            notifications: state.notifications,
            unreadCount: state.unreadCount
          };
          localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
        } catch (error) {
          console.error('Failed to save notifications:', error);
        }
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      
      // Clear from localStorage
      localStorage.removeItem('adminNotifications');
    },
    
    // Remove single notification
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
        
        // Save to localStorage
        try {
          const notificationsToSave = {
            notifications: state.notifications,
            unreadCount: state.unreadCount
          };
          localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
        } catch (error) {
          console.error('Failed to save notifications:', error);
        }
      }
    },
    
    // Set notifications from API or localStorage
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // Load notifications from localStorage
    loadNotificationsFromStorage: (state) => {
      try {
        const savedNotifications = localStorage.getItem('adminNotifications');
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications);
          state.notifications = parsed.notifications || [];
          state.unreadCount = parsed.unreadCount || 0;
        }
      } catch (error) {
        console.error('Failed to load notifications from storage:', error);
      }
    },
    
    // Save notifications to localStorage
    saveNotificationsToStorage: (state) => {
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications to storage:', error);
      }
    },
    
    // ✅ Show success notification
    showSuccessNotification: (state, action) => {
      const { title = 'Success', message, duration = 3000, link } = action.payload;
      
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        link,
        duration
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      state.currentToast = newNotification;
      state.showToast = true;
      
      // Auto-hide
      if (duration > 0) {
        setTimeout(() => {
          state.showToast = false;
        }, duration);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // ✅ Show error notification
    showErrorNotification: (state, action) => {
      const { title = 'Error', message, duration = 5000, link } = action.payload;
      
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type: 'danger',
        timestamp: new Date().toISOString(),
        read: false,
        link,
        duration
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      state.currentToast = newNotification;
      state.showToast = true;
      
      // Auto-hide
      if (duration > 0) {
        setTimeout(() => {
          state.showToast = false;
        }, duration);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // ✅ Show warning notification
    showWarningNotification: (state, action) => {
      const { title = 'Warning', message, duration = 4000, link } = action.payload;
      
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        link,
        duration
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      state.currentToast = newNotification;
      state.showToast = true;
      
      // Auto-hide
      if (duration > 0) {
        setTimeout(() => {
          state.showToast = false;
        }, duration);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    },
    
    // ✅ Show info notification
    showInfoNotification: (state, action) => {
      const { title = 'Information', message, duration = 4000, link } = action.payload;
      
      const newNotification = {
        id: Date.now(),
        title,
        message,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        link,
        duration
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      state.currentToast = newNotification;
      state.showToast = true;
      
      // Auto-hide
      if (duration > 0) {
        setTimeout(() => {
          state.showToast = false;
        }, duration);
      }
      
      // Save to localStorage
      try {
        const notificationsToSave = {
          notifications: state.notifications,
          unreadCount: state.unreadCount
        };
        localStorage.setItem('adminNotifications', JSON.stringify(notificationsToSave));
      } catch (error) {
        console.error('Failed to save notifications:', error);
      }
    }
  }
});

// ✅ Export all actions including showNotification
export const {
  showNotification, // ← YEH AB EXPORT HOGAYA HAI
  hideNotification,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
  setNotifications,
  loadNotificationsFromStorage,
  saveNotificationsToStorage,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification
} = notificationSlice.actions;

// Export selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectRecentNotifications = (state) => 
  state.notifications.notifications.slice(0, 10);
export const selectShowToast = (state) => state.notifications.showToast;
export const selectCurrentToast = (state) => state.notifications.currentToast;

// Export reducer
export default notificationSlice.reducer;