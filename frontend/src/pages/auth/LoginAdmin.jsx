import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import '../../index.css';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  
  // ✅ Remove serverStatus state and API call
  const initialized = useRef(false);

  useEffect(() => {
    // ✅ Prevent multiple executions
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('LoginAdmin mounted - checking stored data');
    
    // Check for previous login attempts from localStorage
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const storedLockTime = localStorage.getItem('adminLockTime');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockTime) {
      const lockTimeDate = new Date(storedLockTime);
      const now = new Date();
      const diffMinutes = (now - lockTimeDate) / (1000 * 60);
      
      if (diffMinutes < 15) { // Lock for 15 minutes
        setIsLocked(true);
        setLockTime(lockTimeDate);
      }
    }
    
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedAdminEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.includes('@iub.edu.pk') && !formData.email.includes('@admin.bdms')) {
      newErrors.email = 'Only institutional email addresses are allowed';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Prevent event bubbling
    
    if (isLocked) {
      setErrors({ general: 'Account is temporarily locked. Please try again after 15 minutes.' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials check
      const demoEmail = 'admin@iub.edu.pk';
      const demoPassword = 'Admin@123';
      
      if (formData.email === demoEmail && formData.password === demoPassword) {
        const adminUser = {
          id: 1,
          name: 'System Administrator',
          email: formData.email,
          role: 'admin',
          permissions: ['all'],
          avatar: null,
          last_login: new Date().toISOString()
        };

        const token = 'admin-token-' + Date.now();
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userData', JSON.stringify(adminUser));
        localStorage.setItem('adminPermissions', JSON.stringify(['all']));
        localStorage.setItem('sessionId', 'session-' + Date.now());
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberedAdminEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedAdminEmail');
        }
        
        // Reset login attempts on successful login
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLockTime');
        setLoginAttempts(0);
        
        // Dispatch to Redux
        dispatch(loginSuccess({
          user: adminUser,
          role: 'admin',
          token: token,
          permissions: ['all']
        }));

        // Show success message
        showNotification('success', 'Authentication successful!', 'Redirecting to admin panel...');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 500);
        
      } else {
        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('adminLoginAttempts', newAttempts.toString());
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockTime = new Date();
          localStorage.setItem('adminLockTime', lockTime.toISOString());
          setIsLocked(true);
          setLockTime(lockTime);
          setErrors({ general: 'Account locked due to too many failed attempts. Please try again after 15 minutes.' });
        } else {
          setErrors({ general: `Invalid credentials. Demo: ${demoEmail} / ${demoPassword}` });
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, title, message) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
      <strong>${title}</strong>
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  };

  const formatLockTime = () => {
    if (!lockTime) return '';
    const now = new Date();
    const unlockTime = new Date(lockTime.getTime() + 15 * 60000);
    const remainingMinutes = Math.ceil((unlockTime - now) / 60000);
    return remainingMinutes > 0 ? `${remainingMinutes} minutes` : 'unlocked';
  };

  return (
    <div className="login-admin-page">
      <div className="position-fixed top-0 left-0 w-100 h-100 bg-light" style={{ zIndex: -1 }}></div>
      
      <div className="container py-5">
        <div className="row justify-content-center align-items-center min-vh-75">
          <div className="col-xl-5 col-lg-6 col-md-8">
            {/* Login Card */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              {/* Card Header - Security Badge */}
              <div className="card-header py-4" style={{ 
                backgroundColor: '#0f0597',
                borderBottom: '3px solid #dc3545'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h4 className="mb-0 text-white">
                      <i className="fas fa-shield-alt me-2"></i>
                      Administrative Access
                    </h4>
                    <small className="text-white-50">
                      Blood Donation Management System
                    </small>
                  </div>
                  <div className="text-end">
                    {/* ✅ Static server status - no API call */}
                    <span className="badge bg-success px-3 py-2">
                      <i className="fas fa-check-circle me-1"></i>
                      Server Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Warning */}
              <div className="alert alert-warning rounded-0 border-0 m-0 py-2" style={{ backgroundColor: '#fff3cd' }}>
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle text-warning fs-5 me-2"></i>
                  <small className="fw-bold">
                    <i className="fas fa-user-shield me-1"></i>
                    Restricted Area - Authorized Personnel Only
                  </small>
                </div>
              </div>

              {/* Card Body - Login Form */}
              <div className="card-body p-4 p-md-5">
                {/* Error Message */}
                {errors.general && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <div>
                        <strong>Authentication Failed</strong>
                        <div className="small">{errors.general}</div>
                      </div>
                    </div>
                    <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                  </div>
                )}

                {/* Account Locked Warning */}
                {isLocked && (
                  <div className="alert alert-dark alert-dismissible fade show" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-lock me-2"></i>
                      <div>
                        <strong>Account Temporarily Locked</strong>
                        <div className="small">
                          Too many failed login attempts. Account will be unlocked in {formatLockTime()}.
                          <br />
                          <Link to="/contact" className="alert-link">
                            <i className="fas fa-phone-alt me-1"></i>Contact System Administrator
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="needs-validation" noValidate>
                  {/* Email Input */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-bold">
                      <i className="fas fa-envelope me-1 text-primary"></i>
                      Institutional Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-at text-muted"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="admin@iub.edu.pk"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading || isLocked}
                        required
                        autoComplete="username"
                      />
                    </div>
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.email}
                      </div>
                    )}
                    <small className="text-muted">
                      Only @iub.edu.pk or @admin.bdms email addresses are accepted
                    </small>
                  </div>

                  {/* Password Input */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label htmlFor="password" className="form-label fw-bold">
                        <i className="fas fa-key me-1 text-primary"></i>
                        Password
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'} me-1`}></i>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-lock text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading || isLocked}
                        required
                        minLength="8"
                        autoComplete="current-password"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || isLocked}
                        tabIndex={-1}
                      >
                        <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.password}
                      </div>
                    )}
                    <small className="text-muted">
                      Password must be at least 8 characters with uppercase, lowercase and numbers
                    </small>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        className="form-check-input"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        disabled={loading || isLocked}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember this device
                      </label>
                    </div>
                    <Link 
                      to="/forgot-password-admin" 
                      className="text-decoration-none small"
                      onClick={(e) => {
                        if (isLocked) e.preventDefault();
                      }}
                    >
                      <i className="fas fa-question-circle me-1"></i>
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn btn-lg"
                      style={{ 
                        backgroundColor: '#0f0597',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        fontWeight: '600'
                      }}
                      disabled={loading || isLocked}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          {isLocked ? 'Account Locked' : 'Login to Admin Panel'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Information */}
                  <div className="alert alert-info border-0 bg-light" role="alert">
                    <div className="d-flex">
                      <i className="fas fa-info-circle text-info fs-5 me-2"></i>
                      <div>
                        <h6 className="alert-heading mb-2">
                          <i className="fas fa-user-shield me-1"></i>
                          Security Guidelines
                        </h6>
                        <ul className="small mb-0 ps-3">
                          <li>Never share your credentials</li>
                          <li>Always logout after session</li>
                          <li>Use institutional devices only</li>
                          <li>Report suspicious activities immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Back to Home Link */}
                <div className="text-center mt-4 pt-3 border-top">
                  <Link to="/" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Public Portal
                  </Link>
                </div>
              </div>

              {/* Card Footer - Audit Trail */}
              <div className="card-footer bg-light py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-history me-1"></i>
                    Last login attempt: {loginAttempts > 0 ? `${loginAttempts} attempts` : 'No recent attempts'}
                  </small>
                  <small className="text-muted">
                    <i className="fas fa-clock me-1"></i>
                    Session timeout: 30 minutes
                  </small>
                </div>
                <div className="text-center mt-2">
                  <small className="text-muted">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    All activities are monitored and logged
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - System Information */}
          <div className="col-xl-5 col-lg-6 col-md-8 mt-4 mt-xl-0">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-white border-0 py-4">
                <h5 className="mb-0 text-dark">
                  <i className="fas fa-cogs me-2 text-primary"></i>
                  System Information
                </h5>
              </div>
              
              <div className="card-body">
                {/* Demo Credentials */}
                <div className="alert alert-primary border-0 mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-key fa-lg me-3"></i>
                    <div>
                      <h6 className="alert-heading mb-1">Demo Credentials</h6>
                      <p className="mb-0 small">
                        <strong>Email:</strong> admin@iub.edu.pk<br/>
                        <strong>Password:</strong> Admin@123
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="fas fa-server me-1"></i>
                    System Status
                  </h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="text-success mb-1">
                          <i className="fas fa-database fa-lg"></i>
                        </div>
                        <div className="fw-bold">Database</div>
                        <small className="text-success">Online</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <div className="text-primary mb-1">
                          <i className="fas fa-shield-alt fa-lg"></i>
                        </div>
                        <div className="fw-bold">Security</div>
                        <small className="text-primary">Active</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Guidelines */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="fas fa-clipboard-check me-1"></i>
                    Administrator Responsibilities
                  </h6>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Monitor system performance</small>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Manage user accounts and permissions</small>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Handle emergency blood requests</small>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Generate system reports</small>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>Review audit logs</small>
                    </div>
                  </div>
                </div>

                {/* System Version */}
                <div className="text-center mt-4 pt-3 border-top">
                  <small className="text-muted">
                    <i className="fas fa-code-branch me-1"></i>
                    BDMS v2.0.1 | © 2024 IUB Computer Science
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;