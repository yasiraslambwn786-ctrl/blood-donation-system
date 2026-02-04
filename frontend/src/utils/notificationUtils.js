// src/utils/notificationUtils.js
import { store } from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

// Notification types
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Show notification function
export const showNotification = (notification) => {
  store.dispatch(addNotification({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  }));
};

// Helper functions for different notification types
export const showSuccess = (title, message, link = null) => {
  showNotification({
    title,
    message,
    type: NotificationType.SUCCESS,
    link
  });
};

export const showError = (title, message, link = null) => {
  showNotification({
    title,
    message,
    type: NotificationType.ERROR,
    link
  });
};

export const showWarning = (title, message, link = null) => {
  showNotification({
    title,
    message,
    type: NotificationType.WARNING,
    link
  });
};

export const showInfo = (title, message, link = null) => {
  showNotification({
    title,
    message,
    type: NotificationType.INFO,
    link
  });
};