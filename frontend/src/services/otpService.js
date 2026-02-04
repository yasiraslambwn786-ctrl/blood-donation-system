// src/services/otpService.js - SIMPLIFIED
import axiosInstance from '../api/axiosInstance';

class OTPService {
  constructor() {
    // No baseEndpoint needed - use full URLs in methods
  }

  /**
   * Send OTP to mobile number
   */
  async sendOTP(mobileNumber, options = {}) {
    try {
      // ✅ Use full endpoint path
      const response = await axiosInstance.post('/receiver/send-otp', {
        mobile_number: mobileNumber,
        ...options
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'OTP sent successfully',
        otp: response.data.otp
      };
    } catch (error) {
      console.error('OTP Service - Send Error:', error);
      
      // Better error messages
      let errorMessage = 'Failed to send OTP';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 405) {
        errorMessage = 'Server configuration error. Please contact support.';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(mobileNumber, otp) {
    try {
      if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP format');
      }

      // ✅ Use full endpoint path
      const response = await axiosInstance.post('/receiver/verify-mobile', {
        mobile_number: mobileNumber,
        otp: otp
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'OTP verified successfully'
      };
    } catch (error) {
      console.error('OTP Service - Verify Error:', error);
      
      let errorMessage = 'OTP verification failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid OTP. Please check and try again.';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(mobileNumber) {
    try {
      // ✅ Use full endpoint path
      const response = await axiosInstance.post('/receiver/resend-otp', {
        mobile_number: mobileNumber
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'OTP resent successfully',
        otp: response.data.otp
      };
    } catch (error) {
      console.error('OTP Service - Resend Error:', error);
      throw new Error('Failed to resend OTP');
    }
  }

  /**
   * Validate mobile number
   */
  validateMobileNumber(mobileNumber) {
    if (!mobileNumber) return false;
    const cleaned = mobileNumber.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  /**
   * Format mobile number
   */
  formatMobileNumber(mobileNumber) {
    const cleaned = mobileNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+92 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return mobileNumber;
  }
}

// Export singleton instance
export default new OTPService();