import axios from 'axios';
import AuthHelper from '../utils/authHelper';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // ✅ UPDATED: Use AuthHelper to get token
    const token = AuthHelper.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Auth token added: ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️ No auth token found for request');
      
      // Debug why no token
      console.log('🔍 Token check debug:', {
        localStorageKeys: Object.keys(localStorage),
        authHelperToken: AuthHelper.getToken(),
        authState: AuthHelper.getAuthState()
      });
    }
    
    // Add additional headers for Laravel Sanctum/Passport
    if (config.url.includes('/accepter/')) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.content || '';
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status}:`, response.config.url);
    
    // Extract and store new token if provided
    if (response.data?.token) {
      const role = AuthHelper.getRole();
      if (role) {
        localStorage.setItem(`${role}Token`, response.data.token);
        localStorage.setItem('token', response.data.token);
        console.log('🔄 Token refreshed from response');
      }
    }
    
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    console.error(`❌ API Error ${response?.status || 'No response'}:`, {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      message: error.message
    });
    
    // Handle specific error cases
    if (response?.status === 401) {
      console.log("🔒 401 Unauthorized - Token expired or invalid");
      
      // ✅ UPDATED: Use AuthHelper to clear auth
      AuthHelper.logout();
      
      // Don't redirect if already on login page
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('login');
      
      if (!isLoginPage) {
        // Redirect based on current path
        const loginPages = {
          '/accepter': '/login-accepter',
          '/donor': '/login-donor',
          '/staff': '/login-staff',
          '/admin': '/login-admin',
          '/receiver': '/login-receiver'
        };
        
        for (const [path, loginPath] of Object.entries(loginPages)) {
          if (currentPath.includes(path)) {
            console.log(`🔄 Redirecting to ${loginPath}`);
            setTimeout(() => {
              window.location.href = loginPath;
            }, 1000);
            break;
          }
        }
      }
    }
    
    if (response?.status === 404) {
      console.error("🔍 404 Not Found - Check endpoint URL:", config?.url);
    }
    
    if (response?.status === 405) {
      console.error("🚫 405 Method Not Allowed - Check HTTP method:", config?.method);
    }
    
    if (response?.status === 422) {
      console.error("📝 422 Validation Error - Check request data:", response?.data);
    }
    
    if (response?.status === 500) {
      console.error("💥 500 Server Error - Contact administrator");
    }
    
    // Return error for component handling
    return Promise.reject({
      ...error,
      message: response?.data?.message || error.message || 'Network error',
      status: response?.status
    });
  }
);

// ✅ Add helper methods to axios instance
axiosInstance.helpers = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await axiosInstance.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get API status
  getStatus: async () => {
    try {
      const response = await axiosInstance.get('/status');
      return response.data;
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  },
  
  // Clear all auth and retry
  retryWithAuth: async (config) => {
    console.log('🔄 Retrying request with fresh auth check');
    
    // Clear old tokens
    AuthHelper.logout();
    
    // Get fresh token (might trigger login redirect)
    const token = AuthHelper.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(config);
    }
    
    throw new Error('No authentication available');
  }
};

export default axiosInstance;