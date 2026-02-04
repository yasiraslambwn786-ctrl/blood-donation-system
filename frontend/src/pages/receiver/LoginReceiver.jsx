// src/pages/auth/LoginReceiver.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginReceiver, clearError } from '../../redux/slices/receiverSlice';
import '../../index.css';

const LoginReceiver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // ✅ Get state from Redux
  const { loading, error, isAuthenticated } = useSelector((state) => state.receiver);
  
  // ✅ Form States
  const [loginMethod, setLoginMethod] = useState('id_card'); // 'id_card' or 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // ✅ Form Data
  const [formData, setFormData] = useState({
    identifier: '', // For ID card or email
    password: '',
  });

  // ✅ Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // ✅ Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('receiverToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'receiver') {
      navigate('/receiver/dashboard');
    }
  }, [navigate, isAuthenticated]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ FIXED: Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    
    // Validation
    if (!formData.identifier.trim()) {
      alert(`Please enter your ${loginMethod === 'id_card' ? 'ID Card Number' : 'Email Address'}`);
      return;
    }
    
    if (!formData.password) {
      alert('Please enter your password');
      return;
    }
    
    // Prepare credentials based on login method
    const credentials = {
      password: formData.password
    };
    
    if (loginMethod === 'id_card') {
      credentials.id_card = formData.identifier;
    } else {
      credentials.email = formData.identifier;
    }
    
    // Remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedIdentifier', formData.identifier);
      localStorage.setItem('rememberedLoginMethod', loginMethod);
    } else {
      localStorage.removeItem('rememberedIdentifier');
      localStorage.removeItem('rememberedLoginMethod');
    }
    
    console.log('📤 Sending login credentials:', credentials);
    
    try {
      // Dispatch login action
      const result = await dispatch(loginReceiver(credentials)).unwrap();
      
      if (result && result.success) {
        console.log('✅ Login successful');
        
        // Show success message
        alert('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/receiver/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      // Check if error is about mobile verification
      if (err && err.includes && err.includes('Mobile number verification required')) {
        // Store the login identifier temporarily
        localStorage.setItem('pendingVerificationIdentifier', formData.identifier);
        localStorage.setItem('pendingVerificationMethod', loginMethod);
        
        // Show alert and redirect to verification page
        alert('Mobile verification required. Please verify your mobile number first.');
        navigate('/verify-mobile');
      } else {
        alert(err || 'Login failed. Please try again.');
      }
    }
  };

  // ✅ Load remembered credentials
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem('rememberedIdentifier');
    const rememberedLoginMethod = localStorage.getItem('rememberedLoginMethod');
    
    if (rememberedIdentifier && rememberedLoginMethod) {
      setLoginMethod(rememberedLoginMethod);
      setFormData(prev => ({ ...prev, identifier: rememberedIdentifier }));
      setRememberMe(true);
    }
  }, []);

  // ✅ Forgot Password Handler
  const handleForgotPassword = () => {
    if (!formData.identifier) {
      alert(`Please enter your ${loginMethod === 'id_card' ? 'ID Card Number' : 'Email Address'} to reset password`);
      return;
    }
    
    navigate(`/forgot-password?role=receiver&identifier=${encodeURIComponent(formData.identifier)}`);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          {/* Login Card */}
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-2">
                <i className="fas fa-hospital-user me-2"></i>
                Receiver Login
              </h3>
              <p className="mb-0">Access your blood request portal</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              {/* Login Method Toggle */}
              <div className="mb-4">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${loginMethod === 'id_card' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setLoginMethod('id_card')}
                  >
                    <i className="fas fa-id-card me-2"></i>
                    ID Card
                  </button>
                  <button
                    type="button"
                    className={`btn ${loginMethod === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setLoginMethod('email')}
                  >
                    <i className="fas fa-envelope me-2"></i>
                    Email
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => dispatch(clearError())}
                  ></button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Identifier Input */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    {loginMethod === 'id_card' ? (
                      <>
                        <i className="fas fa-id-card me-2 text-primary"></i>
                        ID Card Number *
                      </>
                    ) : (
                      <>
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        Email Address *
                      </>
                    )}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className={`fas fa-${loginMethod === 'id_card' ? 'id-card' : 'envelope'}`}></i>
                    </span>
                    <input
                      type={loginMethod === 'id_card' ? 'text' : 'email'}
                      className="form-control"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder={loginMethod === 'id_card' ? 'Enter your ID card number' : 'Enter your email address'}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Password *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-key"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0"
                    onClick={handleForgotPassword}
                  >
                    <i className="fas fa-key me-1"></i>
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2 mb-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center mb-4">
                  <p className="mb-2">Don't have an account?</p>
                  <Link to="/register-receiver" className="btn btn-outline-success">
                    <i className="fas fa-user-plus me-2"></i>
                    Register as Receiver
                  </Link>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                  <Link to="/" className="btn btn-outline-secondary">
                    <i className="fas fa-home me-2"></i>
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginReceiver;