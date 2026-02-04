// ✅ Central Authentication Service for Laravel - VITE COMPATIBLE
import axios from 'axios';

// ✅ VITE के लिए environment variables
// Vite में import.meta.env use करें
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configure axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ✅ Debug - console में check करें
console.log('🔧 API URL:', API_URL);
console.log('🔧 All env variables:', import.meta.env);

class AuthService {
  // ✅ Check if user is authenticated
  static isAuthenticated(role) {
    const token = localStorage.getItem(`${role}Token`);
    const storedRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem(`${role}Data`);
    
    // All three must exist
    return !!token && storedRole === role && !!userData;
  }

  // ✅ Get current user data
  static getCurrentUser() {
    const role = localStorage.getItem('userRole');
    if (!role) return null;
    
    const userData = localStorage.getItem(`${role}Data`);
    return {
      role,
      data: userData ? JSON.parse(userData) : null,
      token: localStorage.getItem(`${role}Token`)
    };
  }

  // ✅ Login function
  static async login(role, credentials) {
    try {
      console.log(`🔐 Attempting ${role} login to: ${API_URL}/${role}/login`);
      
      const response = await axios.post(`/${role}/login`, {
        ...credentials,
        device_name: 'web_browser'
      });
      
      console.log('📥 Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Clear previous session
        this.clearAllStorage();
        
        // Set new session
        localStorage.setItem(`${role}Token`, token);
        localStorage.setItem('userRole', role);
        localStorage.setItem(`${role}Data`, JSON.stringify(user));
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Login successful, token stored');
        return { success: true, data: user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  // ✅ Logout function
  static async logout(role) {
    try {
      const token = localStorage.getItem(`${role}Token`);
      if (token) {
        console.log(`🔐 Logging out ${role} from: ${API_URL}/${role}/logout`);
        await axios.post(`/${role}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log('⚠️ Logout API error (continuing anyway):', error.message);
    } finally {
      this.clearSession(role);
      console.log('✅ Session cleared');
    }
  }

  // ✅ Clear session
  static clearSession(role) {
    localStorage.removeItem(`${role}Token`);
    localStorage.removeItem(`${role}Data`);
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastLogin');
    
    delete axios.defaults.headers.common['Authorization'];
  }

  // ✅ Clear all storage
  static clearAllStorage() {
    const roles = ['donor', 'staff', 'admin', 'receiver', 'accepter'];
    roles.forEach(role => {
      localStorage.removeItem(`${role}Token`);
      localStorage.removeItem(`${role}Data`);
    });
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastLogin');
  }

  // ✅ Check token validity with Laravel
  static async validateToken(role) {
    try {
      const token = localStorage.getItem(`${role}Token`);
      if (!token) return false;
      
      const response = await axios.get(`/${role}/validate-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // ✅ Get API URL for debugging
  static getApiUrl() {
    return API_URL;
  }
}

export default AuthService;