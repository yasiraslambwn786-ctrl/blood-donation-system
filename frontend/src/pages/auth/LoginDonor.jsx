import React, { useState, useEffect } from "react";
import { lable } from "../../assets/img";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginDonor } from "../../redux/slices/donorSlice";
import axios from "axios";

const LoginDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donor, loading: reduxLoading, error: reduxError, token } = useSelector((state) => state.donor);
  
  // ✅ API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  console.log("🌐 API Base URL:", API_URL);
  
  // ✅ Form states
  const [formData, setFormData] = useState({
    login_id: "", // Can be CNIC or Email
    password: "",
  });
  
  const [loginType, setLoginType] = useState("cnic"); // "cnic" or "email"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  // ✅ Load saved credentials
  useEffect(() => {
    const savedCredentials = JSON.parse(localStorage.getItem('donorCredentials') || '{}');
    if (savedCredentials.cnic) {
      const formattedCNIC = formatCNIC(savedCredentials.cnic);
      setFormData({
        login_id: formattedCNIC,
        password: savedCredentials.password || ""
      });
      setLoginType("cnic");
      console.log("📋 Loaded saved CNIC credentials");
    } else if (savedCredentials.email) {
      setFormData({
        login_id: savedCredentials.email,
        password: savedCredentials.password || ""
      });
      setLoginType("email");
      console.log("📋 Loaded saved email credentials");
    }
  }, []);

  // ✅ Detect login type (CNIC or Email)
  const detectLoginType = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnicDigits = value.replace(/\D/g, '');
    
    if (emailRegex.test(value)) {
      return "email";
    } else if (cnicDigits.length === 13 || /^\d{5}-\d{7}-\d$/.test(value)) {
      return "cnic";
    }
    return loginType; // Keep current type if not clear
  };

  // ✅ CNIC format function
  const formatCNIC = (cnic) => {
    const digits = cnic.replace(/\D/g, '');
    
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.substring(0, 5)}-${digits.substring(5)}`;
    } else {
      return `${digits.substring(0, 5)}-${digits.substring(5, 12)}-${digits.substring(12, 13)}`;
    }
  };

  // ✅ Handle login ID input
  const handleLoginIdInput = (e) => {
    const inputValue = e.target.value;
    const detectedType = detectLoginType(inputValue);
    
    let formattedValue = inputValue;
    if (detectedType === "cnic") {
      formattedValue = formatCNIC(inputValue);
    }
    
    setLoginType(detectedType);
    setFormData({ ...formData, login_id: formattedValue });
    
    // Show CNIC suggestions if CNIC input
    if (detectedType === "cnic" && inputValue.length >= 2) {
      const cnicHistory = JSON.parse(localStorage.getItem("donorCnicHistory") || "[]");
      const filtered = cnicHistory.filter(cnic => 
        cnic.replace(/\D/g, '').includes(inputValue.replace(/\D/g, ''))
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // ✅ CNIC select handler
  const handleCnicSelect = (selectedCnic) => {
    const digitsOnly = selectedCnic.replace(/\D/g, '');
    const formattedCnic = formatCNIC(selectedCnic);
    
    setFormData(prev => ({
      ...prev,
      login_id: formattedCnic
    }));
    setLoginType("cnic");
    
    const savedCredentials = JSON.parse(localStorage.getItem('donorCredentials') || '{}');
    const savedCnicDigits = savedCredentials.cnic ? savedCredentials.cnic.replace(/\D/g, '') : '';
    
    if (savedCnicDigits === digitsOnly && savedCredentials.password) {
      setFormData(prev => ({
        ...prev,
        password: savedCredentials.password
      }));
    }
    
    setShowSuggestions(false);
  };

  // ✅ Password handler
  const handlePasswordChange = (e) => {
    setFormData({ ...formData, password: e.target.value });
  };

  // ✅ Toggle login type
  const toggleLoginType = () => {
    const newType = loginType === "cnic" ? "email" : "cnic";
    setLoginType(newType);
    setFormData({ ...formData, login_id: "" });
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Update placeholder based on type
    console.log(`🔄 Switched to ${newType} login`);
  };

  // ✅ Validate input
  const validateInput = () => {
    if (!formData.login_id.trim()) {
      setApiError(`Please enter your ${loginType === "cnic" ? "CNIC" : "Email"}`);
      return false;
    }
    
    if (!formData.password) {
      setApiError("Please enter your password");
      return false;
    }
    
    if (loginType === "cnic") {
      const cnicDigits = formData.login_id.replace(/\D/g, '');
      if (cnicDigits.length !== 13) {
        setApiError("CNIC must be 13 digits");
        return false;
      }
    } else if (loginType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.login_id)) {
        setApiError("Please enter a valid email address");
        return false;
      }
    }
    
    return true;
  };

  // ✅ PROFESSIONAL LOGIN HANDLER
  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    setLocalLoading(true);
    
    console.log("🔍 Form Data:", formData);
    console.log("🔍 Login Type:", loginType);
    
    // Validate input
    if (!validateInput()) {
      setLocalLoading(false);
      return;
    }

    // Prepare payload based on login type
    let loginPayload = {
      password: formData.password
    };
    
    if (loginType === "cnic") {
      const cnicDigits = formData.login_id.replace(/\D/g, '');
      loginPayload.cnic = cnicDigits;
    } else {
      loginPayload.email = formData.login_id.trim();
    }

    console.log("📤 Sending login payload:", loginPayload);
    console.log("📤 Endpoint:", `${API_URL}/donor/login`);

    try {
      // Direct API call
      const response = await axios.post(
        `${API_URL}/donor/login`,
        loginPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("✅ API Response:", response.data);
      
      if (response.data.success) {
        // ✅ Save token and data
        const token = response.data.token;
        const donorData = response.data.donor;
        
        localStorage.setItem('donorToken', token);
        localStorage.setItem('donorData', JSON.stringify(donorData));
        localStorage.setItem('userRole', 'donor');
        localStorage.setItem('token', token);
        
        // ✅ Save credentials for auto-fill
        const credentialsToSave = {
          [loginType]: loginType === "cnic" ? loginPayload.cnic : loginPayload.email,
          password: formData.password,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('donorCredentials', JSON.stringify(credentialsToSave));
        
        // ✅ Update CNIC history if CNIC login
        if (loginType === "cnic") {
          let history = JSON.parse(localStorage.getItem("donorCnicHistory") || "[]");
          const formattedCnic = formData.login_id;
          if (!history.includes(formattedCnic)) {
            history.unshift(formattedCnic);
            if (history.length > 10) history = history.slice(0, 10);
            localStorage.setItem("donorCnicHistory", JSON.stringify(history));
          }
        }
        
        console.log("✅ Login successful!");
        
        // ✅ Dispatch to Redux
        try {
          const result = await dispatch(loginDonor(loginPayload)).unwrap();
          console.log("✅ Redux login successful:", result);
        } catch (reduxErr) {
          console.log("⚠️ Redux login error (but API worked):", reduxErr);
        }
        
        // ✅ Navigate to dashboard
        navigate("/donor/home-donor", { replace: true });
        
      } else {
        setApiError(response.data.message || "Login failed");
      }
      
    } catch (error) {
      console.error("❌ Login Error:", error);
      
      // Detailed error handling
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log("❌ Server Response:", {
          status: status,
          data: data,
          message: data?.message
        });
        
        if (status === 401) {
          setApiError("Invalid credentials. Please check and try again.");
        } else if (status === 404) {
          setApiError("Account not found. Please register first.");
        } else if (status === 422) {
          setApiError(data.message || "Validation error. Please check your input.");
        } else if (status === 500) {
          setApiError("Server error. Please try again later.");
        } else if (data?.message) {
          setApiError(data.message);
        } else {
          setApiError("Login failed. Please try again.");
        }
      } else if (error.request) {
        setApiError("No response from server. Please check your internet connection.");
      } else {
        setApiError(error.message || "Login request failed");
      }
      
      // Try Redux as fallback
      console.log("🔄 Trying Redux method as fallback...");
      try {
        const result = await dispatch(loginDonor(loginPayload)).unwrap();
        console.log("✅ Redux login successful:", result);
        navigate("/donor/home-donor", { replace: true });
      } catch (reduxError) {
        console.error("❌ Redux also failed:", reduxError);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // ✅ Clear saved credentials
  const clearSavedCredentials = () => {
    localStorage.removeItem('donorCredentials');
    localStorage.removeItem('donorCnicHistory');
    setFormData({ login_id: "", password: "" });
    setLoginType("cnic");
    console.log("🧹 Cleared all saved credentials");
  };

  // ✅ Test API Connection Button
  const testAPIConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      alert(`✅ API Connected: ${response.status} ${response.statusText}`);
    } catch (error) {
      alert(`❌ API Connection Failed: ${error.message}`);
    }
  };

  const isLoading = reduxLoading || localLoading;
  const errorMessage = apiError || reduxError;

  return (
    <div>
      <div className="text-center p-3 container-md">
        <Link to="/">
          {/* Home link */}
        </Link>
      </div>

      <div id="intro-example" className="text-center bg-image align-items-center">
        <section>
          <div className="container h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
              <div className="col-lg-12 col-xl-11">
                <div className="card text-black" style={{ borderRadius: "25px" }}>
                  <div className="card-body p-md-5">
                    <div className="row justify-content-center">
                      <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-4">
                          Welcome Back, Blood Donor!
                        </p>
                        <p className="text-center text-muted mb-5">
                          {loginType === "cnic" 
                            ? "Enter your CNIC and password to login" 
                            : "Enter your email and password to login"}
                        </p>
                        
                        {/* Debug buttons */}
                        <div className="d-flex justify-content-between mb-3">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={clearSavedCredentials}
                            title="Clear saved login details"
                            type="button"
                          >
                            <i className="fas fa-eraser me-1"></i> Clear Saved
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={testAPIConnection}
                            type="button"
                          >
                            <i className="fas fa-plug me-1"></i> Test API
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={toggleLoginType}
                            title={`Switch to ${loginType === "cnic" ? "Email" : "CNIC"} login`}
                            type="button"
                          >
                            <i className={`fas ${loginType === "cnic" ? "fa-envelope" : "fa-id-card"} me-1`}></i>
                            {loginType === "cnic" ? "Use Email" : "Use CNIC"}
                          </button>
                        </div>

                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                          {/* Login ID Field (CNIC or Email) */}
                          <div className="d-flex flex-row align-items-center mb-4 position-relative">
                            <i className={`fas ${loginType === "cnic" ? "fa-id-card" : "fa-envelope"} fa-lg me-3 fa-fw`}></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="text"
                                name="login_id"
                                className="form-control"
                                placeholder={loginType === "cnic" ? "XXXXX-XXXXXXX-X" : "you@example.com"}
                                value={formData.login_id}
                                onChange={handleLoginIdInput}
                                onFocus={() => loginType === "cnic" && formData.login_id.length >= 2 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                maxLength={loginType === "cnic" ? "15" : undefined}
                                required
                                autoComplete="off"
                              />
                              
                              {/* CNIC Suggestions Dropdown */}
                              {loginType === "cnic" && showSuggestions && suggestions.length > 0 && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 z-3"
                                     style={{ 
                                       maxHeight: '200px', 
                                       overflowY: 'auto',
                                       top: '100%',
                                       left: 0,
                                       zIndex: 1000
                                     }}>
                                  {suggestions.map((cnic, index) => (
                                    <div
                                      key={index}
                                      className="p-2 border-bottom hover-bg-light cursor-pointer"
                                      onClick={() => handleCnicSelect(cnic)}
                                      onMouseDown={(e) => e.preventDefault()}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-primary">{cnic}</span>
                                        <small className="text-muted">
                                          <i className="fas fa-history"></i>
                                        </small>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <label className="form-label" htmlFor="login_id">
                                {loginType === "cnic" ? "CNIC (13 digits)" : "Email Address"}
                              </label>
                              <small className="text-muted d-block">
                                <i className="fas fa-info-circle me-1"></i>
                                {loginType === "cnic" 
                                  ? "Format: XXXXX-XXXXXXX-X" 
                                  : "Enter your registered email address"}
                              </small>
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your Password"
                                value={formData.password}
                                onChange={handlePasswordChange}
                                required
                                autoComplete="current-password"
                              />
                              <label className="form-label" htmlFor="password">Password</label>
                            </div>
                          </div>

                          {/* Debug Info */}
                          <div className="alert alert-info mb-3">
                            <small>
                              <i className="fas fa-bug me-1"></i>
                              Debug: Login type: <code>{loginType}</code>, 
                              Will send: <code>
                                {loginType === "cnic" 
                                  ? formData.login_id.replace(/\D/g, '') 
                                  : formData.login_id}
                              </code>
                            </small>
                          </div>

                          {/* Remember Me Checkbox */}
                          <div className="d-flex justify-content-between align-items-center mb-4 px-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="rememberMe"
                                checked={true}
                                readOnly
                              />
                              <label className="form-check-label" htmlFor="rememberMe">
                                Remember my login
                              </label>
                            </div>
                            <Link to="/forgot-password" className="text-primary small">
                              Forgot password?
                            </Link>
                          </div>

                          {/* Error Messages */}
                          {errorMessage && (
                            <div className="alert alert-danger text-center mb-3" role="alert">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              <strong>Login Failed:</strong> {errorMessage}
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg px-5"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Logging in...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-sign-in-alt me-2"></i>
                                  {loginType === "cnic" ? "Login with CNIC" : "Login with Email"}
                                </>
                              )}
                            </button>
                          </div>

                          {/* Registration Link */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <p className="small mb-0">
                              Don't have an account?{" "}
                              <Link to="/register-donor" className="fw-bold text-primary">
                                Create an account
                              </Link>
                            </p>
                          </div>

                          {/* Security Info */}
                          <div className="text-center mt-4">
                            <p className="small text-muted">
                              <i className="fas fa-shield-alt me-1"></i>
                              Your credentials are saved securely in your browser
                            </p>
                          </div>
                        </form>
                      </div>

                      {/* Image Section */}
                      <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                        <img src={lable} className="img-fluid rounded-4" alt="Blood Donor Login" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .z-3 {
          z-index: 1030;
        }
      `}</style>
    </div>
  );
};

export default LoginDonor;