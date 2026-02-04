// src/pages/auth/VerifyMobile.jsx - FIXED IMPORT
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance'; // ✅ Import axiosInstance
// import otpServices from '../../services/otpService'; // ❌ REMOVE THIS LINE

const VerifyMobile = () => {
  const navigate = useNavigate();
  
  // ✅ State variables
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter OTP, 3: Success
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const inputRefs = useRef([]);

  // ✅ Get identifier from localStorage
  useEffect(() => {
    const identifier = localStorage.getItem('pendingVerificationIdentifier');
    const loginMethod = localStorage.getItem('pendingVerificationMethod');
    
    if (identifier) {
      console.log('🔍 Found pending verification:', { identifier, loginMethod });
    }
  }, []);

  // ✅ Timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer, canResend]);

  // ✅ Step 1: Send OTP to mobile
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number (10 digits)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const identifier = localStorage.getItem('pendingVerificationIdentifier');
      const loginMethod = localStorage.getItem('pendingVerificationMethod');
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/receiver/send-otp`, {
        mobile_number: mobileNumber,
        identifier: identifier || '',
        login_method: loginMethod || 'email'
      });

      console.log('📤 OTP send response:', response.data);
      
      if (response.data.success) {
        setStep(2);
        setTimer(60);
        setCanResend(false);
        
        // ✅ Check if OTP is in response
        if (response.data.otp) {
          setSuccess(`OTP sent successfully! Your OTP is: ${response.data.otp}`);
          console.log('📱 OTP received in response:', response.data.otp);
        } else {
          setSuccess('OTP sent successfully! (Check console for OTP)');
          console.warn('⚠️ OTP not found in response:', response.data);
        }
        
        // Auto-focus first OTP input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ OTP send error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 404) {
        setError('Mobile number not found. Please register first or check your number.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debug function
  const debugOTPStatus = async () => {
    try {
      console.log('🔍 DEBUG: Checking OTP status for:', mobileNumber);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/receiver/debug-otp-status`, {
        mobile_number: mobileNumber
      });
      
      console.log('🔍 DEBUG OTP Status:', response.data);
      
      if (response.data.success) {
        setSuccess(`DEBUG: OTP status loaded. Check console for details.`);
        // Show OTP in console
        const otp = response.data.debug_info?.user?.mobile_verification_otp;
        if (otp) {
          console.log('🔍 Current OTP in database:', otp);
          console.log('🔍 Your entered OTP:', otp.join(''));
        }
      }
    } catch (error) {
      console.error('🔍 DEBUG Error:', error);
    }
  };

  // ✅ Step 2: Verify OTP - FIXED
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Verifying OTP:', {
        otp: otpCode,
        mobile: mobileNumber,
        timestamp: new Date().toISOString()
      });
      
      // ✅ Use axiosInstance with proper endpoint
      const response = await axiosInstance.post('/receiver/verify-mobile', {
        mobile_number: mobileNumber,
        otp: otpCode
      });

      console.log('✅ OTP verification response:', response.data);
      
      if (response.data.success) {
        setStep(3);
        setSuccess('Mobile verified successfully! You can now login.');
        
        // Clear pending verification data
        localStorage.removeItem('pendingVerificationIdentifier');
        localStorage.removeItem('pendingVerificationMethod');
        
        // Store verification status
        if (response.data.data) {
          localStorage.setItem('mobile_verified', 'true');
          localStorage.setItem('verification_status', response.data.data.verification_status);
        }
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login-receiver?verified=true');
        }, 2000);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // More specific error handling
      if (error.response?.status === 400) {
        if (error.response?.data?.message) {
          setError(`Error: ${error.response.data.message}`);
        } else if (error.response?.data?.errors) {
          // Handle validation errors
          const errors = Object.values(error.response.data.errors).flat();
          setError(errors.join(', '));
        } else {
          setError('Invalid OTP. Please check and try again.');
        }
      } else if (error.response?.status === 404) {
        setError('Account not found with this mobile number.');
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit if all digits entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOtp();
    }
  };

  // ✅ Handle OTP key down (for backspace navigation)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/receiver/resend-otp`, {
        mobile_number: mobileNumber
      });
      
      console.log('🔄 OTP resend response:', response.data);
      
      if (response.data.success) {
        setTimer(60);
        setCanResend(false);
        
        // ✅ Check if OTP is in response
        if (response.data.otp) {
          setSuccess(`OTP resent successfully! Your OTP is: ${response.data.otp}`);
          console.log('📱 OTP received in response:', response.data.otp);
        } else {
          setSuccess('OTP resent successfully! (Check console for OTP)');
          console.warn('⚠️ OTP not found in response:', response.data);
        }
        
        // Reset OTP fields
        setOtp(['', '', '', '', '', '']);
        
        // Focus first OTP input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format mobile number for display
  const formatMobileNumber = (number) => {
    if (!number) return '';
    return number.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  // ✅ Alternative: Fetch mobile by identifier
  const fetchMobileByIdentifier = async () => {
    const identifier = localStorage.getItem('pendingVerificationIdentifier');
    const loginMethod = localStorage.getItem('pendingVerificationMethod');
    
    if (!identifier) return;
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/receiver/get-mobile-by-identifier`, {
        identifier: identifier,
        type: loginMethod === 'email' ? 'email' : 'id_card'
      });
      
      if (response.data.success) {
        setMobileNumber(response.data.mobile_number);
        setSuccess('Mobile number found. Click "Send Verification Code" to continue.');
      }
    } catch (error) {
      console.log('Could not fetch mobile automatically');
    }
  };

  // Try to fetch mobile on component mount
  useEffect(() => {
    fetchMobileByIdentifier();
  }, []);

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-warning text-dark text-center py-4">
              <h3 className="mb-2">
                <i className="fas fa-mobile-alt me-2"></i>
                Mobile Number Verification
              </h3>
              <p className="mb-0">Required for secure login access</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                  ></button>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="alert alert-success alert-dismissible fade show">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {/* Step 1: Enter Mobile Number */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="fas fa-shield-alt fa-4x text-warning"></i>
                    </div>
                    <h5>Mobile Verification Required</h5>
                    <p className="text-muted">
                      For security purposes, please verify your mobile number before login.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-mobile-alt me-2 text-warning"></i>
                      Mobile Number *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">+92</span>
                      <input
                        type="tel"
                        className="form-control"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="3001234567"
                        maxLength="10"
                        required
                      />
                    </div>
                    <small className="text-muted mt-1">
                      Enter the mobile number registered with your account
                    </small>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-warning btn-lg"
                      onClick={handleSendOtp}
                      disabled={loading || !mobileNumber}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Enter OTP */}
              {step === 2 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="fas fa-sms fa-4x text-success"></i>
                    </div>
                    <h5>Enter Verification Code</h5>
                    <p className="text-muted">
                      We sent a 6-digit code to <strong>{formatMobileNumber(mobileNumber)}</strong>
                    </p>
                  </div>
                  
                  {/* OTP Inputs */}
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-3">
                      <i className="fas fa-key me-2 text-success"></i>
                      Enter 6-Digit OTP
                    </label>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => inputRefs.current[index] = el}
                          type="text"
                          className="form-control text-center"
                          style={{ width: '50px', height: '60px', fontSize: '24px' }}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          maxLength="1"
                          required
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="text-center mb-4">
                    {canResend ? (
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={handleResendOtp}
                        disabled={loading}
                      >
                        <i className="fas fa-redo me-1"></i>
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-muted">
                        Resend OTP in <strong>{timer}</strong> seconds
                      </p>
                    )}
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Verify & Continue
                        </>
                      )}
                    </button>
                    
                    {/* Debug button - temporary */}
                    <button 
                      className="btn btn-sm btn-outline-info mt-2"
                      onClick={debugOTPStatus}
                      type="button"
                    >
                      <i className="fas fa-bug me-1"></i>
                      Debug OTP Status
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="fas fa-check-circle fa-5x text-success"></i>
                  </div>
                  <h4 className="mb-3">Verification Successful!</h4>
                  <p className="text-muted mb-4">
                    Your mobile number has been verified successfully.
                    You can now login to your account.
                  </p>
                  <div className="d-grid gap-2 col-md-6 mx-auto">
                    <Link to="/login-receiver" className="btn btn-primary">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Go to Login
                    </Link>
                  </div>
                </div>
              )}

              {/* Back to Login */}
              {step !== 3 && (
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="mb-2">Changed your mind?</p>
                  <Link to="/login-receiver" className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyMobile;