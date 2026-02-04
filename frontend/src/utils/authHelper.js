/**
 * 🔐 Unified Authentication Helper
 * Complete solution for all authentication needs
 */

import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

class AuthHelper {
  // ==================== CORE AUTH METHODS ====================
  
  /**
   * Get current user role from localStorage
   */
  static getRole() {
    return localStorage.getItem('userRole') || 
           localStorage.getItem('role') || 
           null;
  }

  /**
   * Get authentication token (works with all storage formats)
   */
  static getToken() {
    const role = this.getRole();
    
    // Priority 1: Role-specific token
    if (role) {
      const roleToken = localStorage.getItem(`${role}Token`);
      if (roleToken) return roleToken;
    }
    
    // Priority 2: Generic token
    const genericToken = localStorage.getItem('token');
    if (genericToken) return genericToken;
    
    // Priority 3: Check all role tokens
    const roles = ['accepter', 'donor', 'staff', 'admin', 'receiver'];
    for (const r of roles) {
      const token = localStorage.getItem(`${r}Token`);
      if (token) {
        // Update role to match found token
        localStorage.setItem('role', r);
        localStorage.setItem('userRole', r);
        return token;
      }
    }
    
    return null;
  }

  /**
   * Get current user data
   */
  static getUser() {
    const role = this.getRole();
    
    if (role) {
      // Try role-specific data
      const roleData = localStorage.getItem(`${role}Data`);
      if (roleData) {
        try {
          return JSON.parse(roleData);
        } catch (e) {
          console.error('❌ Error parsing role data:', e);
        }
      }
    }
    
    // Try role-based generic storage
    if (role) {
      const genericData = localStorage.getItem(role);
      if (genericData) {
        try {
          return JSON.parse(genericData);
        } catch (e) {
          console.error('❌ Error parsing generic role data:', e);
        }
      }
    }
    
    // Try 'accepter' storage
    const accepterData = localStorage.getItem('accepter');
    if (accepterData) {
      try {
        const data = JSON.parse(accepterData);
        if (!role) {
          localStorage.setItem('role', 'accepter');
          localStorage.setItem('userRole', 'accepter');
        }
        return data;
      } catch (e) {
        console.error('❌ Error parsing accepter data:', e);
      }
    }
    
    return null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(expectedRole = null) {
    const role = this.getRole();
    const token = this.getToken();
    const user = this.getUser();
    
    const isAuthenticated = !!(role && token && user);
    const roleMatches = expectedRole ? role === expectedRole : true;
    
    console.log('🔍 AuthHelper.isAuthenticated:', {
      role,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 15) + '...' : 'No token',
      hasUser: !!user,
      isAuthenticated,
      expectedRole,
      roleMatches,
      finalResult: isAuthenticated && roleMatches
    });
    
    return isAuthenticated && roleMatches;
  }

  // ==================== LOGIN/LOGOUT METHODS ====================
  
  /**
   * Login user and store data in all formats
   */
  static login(role, userData, token) {
    try {
      console.log(`🔐 AuthHelper.login: Setting up ${role} session`);
      
      // Clear any existing auth data
      this.clearAll();
      
      // STORE IN ALL FORMATS FOR COMPATIBILITY
      
      // 1. AuthService format
      localStorage.setItem(`${role}Token`, token);
      localStorage.setItem(`${role}Data`, JSON.stringify(userData));
      localStorage.setItem('userRole', role);
      
      // 2. Component format (for AccepterLayout, etc.)
      localStorage.setItem('token', token);
      localStorage.setItem(role, JSON.stringify(userData));
      localStorage.setItem('role', role);
      
      // 3. For accepter specifically
      if (role === 'accepter') {
        localStorage.setItem('accepter', JSON.stringify(userData));
      }
      
      // 4. Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 5. Store login timestamp
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      console.log(`✅ AuthHelper.login: ${role} login successful`);
      console.log('📦 Stored keys:', Object.keys(localStorage));
      
      return true;
    } catch (error) {
      console.error('❌ AuthHelper.login error:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  static logout(role = null) {
    console.log('🔓 AuthHelper.logout: Clearing authentication');
    
    const currentRole = role || this.getRole();
    
    // Clear specific role if provided
    if (currentRole) {
      localStorage.removeItem(`${currentRole}Token`);
      localStorage.removeItem(`${currentRole}Data`);
      localStorage.removeItem(currentRole);
    }
    
    // Clear all generic keys
    const genericKeys = [
      'token', 'role', 'userRole', 'user', 'accepter', 'donor',
      'staff', 'admin', 'receiver', 'lastLogin'
    ];
    
    genericKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Removed: ${key}`);
    });
    
    // Clear all role-specific token keys
    const roles = ['accepter', 'donor', 'staff', 'admin', 'receiver'];
    roles.forEach(r => {
      localStorage.removeItem(`${r}Token`);
      localStorage.removeItem(`${r}Data`);
    });
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('✅ AuthHelper.logout: All auth data cleared');
  }

  /**
   * Clear all authentication data
   */
  static clearAll() {
    console.log('🧹 AuthHelper.clearAll: Hard reset');
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    console.log('✅ All localStorage and axios headers cleared');
  }

  // ==================== API INTEGRATION METHODS ====================
  
  /**
   * Login with API call
   */
  static async apiLogin(role, credentials) {
    try {
      console.log(`🌐 AuthHelper.apiLogin: Calling ${role}/login API`);
      
      const response = await axios.post(`/${role}/login`, {
        ...credentials,
        device_name: 'web_browser'
      });
      
      console.log('📥 API Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store using unified login method
        this.login(role, user, token);
        
        return {
          success: true,
          data: user,
          token: token
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
      
    } catch (error) {
      console.error('❌ AuthHelper.apiLogin error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error'
      };
    }
  }

  /**
   * Logout with API call
   */
  static async apiLogout(role = null) {
    try {
      const currentRole = role || this.getRole();
      const token = this.getToken();
      
      if (currentRole && token) {
        console.log(`🌐 AuthHelper.apiLogout: Calling ${currentRole}/logout API`);
        
        await axios.post(`/${currentRole}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log('⚠️ AuthHelper.apiLogout: API error (continuing with local logout)', error.message);
    } finally {
      // Always clear local storage
      this.logout(currentRole);
    }
  }

  // ==================== UTILITY & DEBUG METHODS ====================
  
  /**
   * Get full authentication state
   */
  static getAuthState() {
    const role = this.getRole();
    const token = this.getToken();
    const user = this.getUser();
    
    return {
      isAuthenticated: !!(role && token && user),
      role,
      token: token ? '***' + token.slice(-10) : null,
      user,
      lastLogin: localStorage.getItem('lastLogin'),
      localStorageKeys: Object.keys(localStorage)
    };
  }

  /**
   * Get all roles that have tokens in localStorage
   */
  static getAllRolesWithTokens() {
    const roles = ['accepter', 'donor', 'staff', 'admin', 'receiver'];
    const result = {};
    
    roles.forEach(role => {
      const token = localStorage.getItem(`${role}Token`);
      const data = localStorage.getItem(`${role}Data`);
      
      if (token) {
        result[role] = {
          hasToken: true,
          hasData: !!data,
          tokenPreview: token.substring(0, 10) + '...'
        };
      }
    });
    
    return result;
  }

  /**
   * Debug current authentication state
   */
  static debug() {
    console.group('🔍 AuthHelper Debug Report');
    
    // Current state
    console.log('📊 Current Auth State:', this.getAuthState());
    
    // All localStorage items
    console.log('🗂️ All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      try {
        const parsedValue = JSON.parse(value);
        console.log(`  ${key}:`, typeof parsedValue === 'object' ? '[Object]' : parsedValue);
      } catch {
        console.log(`  ${key}:`, value?.length > 50 ? value.substring(0, 50) + '...' : value);
      }
    }
    
    // Axios config
    console.log('🌐 Axios Config:', {
      baseURL: axios.defaults.baseURL,
      hasAuthHeader: !!axios.defaults.headers.common['Authorization']
    });
    
    console.groupEnd();
    return this.getAuthState();
  }

  /**
   * Initialize authentication on app start
   */
  static initialize() {
    console.log('🚀 AuthHelper.initialize: Setting up authentication');
    
    // Set token from localStorage to axios
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Restored axios auth header from localStorage');
    }
    
    // Debug output
    this.debug();
    
    return this.getAuthState();
  }

  /**
   * Check and refresh token if needed
   */
  static async checkAndRefreshToken() {
    const isValid = await this.validateToken();
    
    if (!isValid) {
      console.log('🔄 Token invalid or expired, attempting refresh...');
      // Implement refresh token logic here if needed
      return false;
    }
    
    return true;
  }

  /**
   * Validate token with backend
   */
  static async validateToken(role = null) {
    try {
      const currentRole = role || this.getRole();
      const token = this.getToken();
      
      if (!currentRole || !token) {
        return false;
      }
      
      console.log(`🔐 AuthHelper.validateToken: Validating ${currentRole} token`);
      
      const response = await axios.get(`/${currentRole}/validate-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.success === true;
      
    } catch (error) {
      console.log('❌ AuthHelper.validateToken failed:', error.message);
      return false;
    }
  }

  /**
   * Switch between roles (for multi-role users)
   */
  static switchRole(newRole) {
    const token = localStorage.getItem(`${newRole}Token`);
    const data = localStorage.getItem(`${newRole}Data`);
    
    if (token && data) {
      // Update current role
      localStorage.setItem('userRole', newRole);
      localStorage.setItem('role', newRole);
      
      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log(`🔄 Switched to ${newRole} role`);
      return true;
    }
    
    console.log(`❌ Cannot switch to ${newRole}: No token/data found`);
    return false;
  }

  /**
   * Quick test if authentication is working
   */
  static test() {
    console.log('🧪 AuthHelper.test: Running authentication test');
    
    // Clear first
    this.clearAll();
    
    // Test login
    const testUser = {
      id: 999,
      name: 'Test User',
      email: 'test@example.com',
      role: 'accepter'
    };
    
    const testToken = 'test_jwt_token_' + Date.now();
    
    this.login('accepter', testUser, testToken);
    
    // Verify
    const state = this.getAuthState();
    
    console.log('🧪 Test Results:', {
      loginSuccess: state.isAuthenticated,
      role: state.role,
      hasToken: !!state.token,
      localStorageCount: localStorage.length
    });
    
    // Cleanup
    this.clearAll();
    
    return state.isAuthenticated;
  }
}

// Auto-initialize when imported
try {
  AuthHelper.initialize();
} catch (error) {
  console.error('❌ AuthHelper initialization failed:', error);
}

export default AuthHelper;