import React, { useState, useEffect } from "react";
import { logo1, lable } from "../../assets/img";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerDonor } from "../../redux/slices/donorSlice";
import axios from "../../api/axiosInstance";

const RegisterDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.donor);

  const [formData, setFormData] = useState({
    full_name: "",
    cnic: "",
    blood_type: "A+",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    gender: "male",
    address: "",
    city: "Bahawalnagar",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // ✅ Check if already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('donorToken');
    const justRegistered = localStorage.getItem('justRegistered');
    
    if (storedToken && justRegistered === 'true') {
      console.log("✅ Auto-redirecting newly registered donor to dashboard");
      localStorage.removeItem('justRegistered');
       navigate("/donor", { replace: true });
    }
  }, [navigate]);

  // CNIC formatting
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

  const handleCnicChange = (e) => {
    const formattedCNIC = formatCNIC(e.target.value);
    setFormData({ ...formData, cnic: formattedCNIC });
    if (errors.cnic) setErrors({ ...errors, cnic: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // Clear API error when user types
    if (apiError) setApiError("");
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    // CNIC validation - accept both formats
    const cnicDigits = formData.cnic.replace(/\D/g, '');
    if (cnicDigits.length !== 13) {
      newErrors.cnic = "CNIC must be 13 digits";
    }
    
    // Phone validation
    const phoneDigits = formData.phone_number.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      newErrors.phone_number = "Phone number must be 11 digits";
    }
    
    // Email validation (optional)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter valid email";
    }
    
    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (adjustedAge < 18) {
        newErrors.date_of_birth = "You must be at least 18 years old";
      } else if (adjustedAge > 65) {
        newErrors.date_of_birth = "Maximum age for donation is 65";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    
    // ✅ FIRST: Frontend validation
    if (!validateForm()) {
      return;
    }

    try {
      // ✅ Prepare data for Laravel backend
      const registrationData = {
        full_name: formData.full_name.trim(),
        cnic: formData.cnic.replace(/\D/g, ''), // Remove dashes for backend
        blood_type: formData.blood_type,
        phone_number: formData.phone_number.replace(/\D/g, ''), // Remove non-digits
        email: formData.email || null,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address.trim(),
        city: formData.city.trim(),
      };

      console.log("📤 Prepared registration data:", registrationData);
      
      // ✅ Make API call through Redux
      const result = await dispatch(registerDonor(registrationData)).unwrap();
      
      console.log("✅ Registration success:", result);
      
      // Show success message
      alert("🎉 Registration successful! Welcome to your dashboard.");
      
      // ✅ Redirect to donor dashboard
      navigate("/donor", { replace: true });
      
    } catch (err) {
      console.error("❌ Registration failed:", err);
      
      // ✅ IMPROVED ERROR HANDLING
      if (typeof err === 'string') {
        setApiError(err);
      } else if (err && typeof err === 'object') {
        if (err.message) {
          setApiError(err.message);
        } else {
          setApiError("Registration failed. Please check your input.");
        }
      } else {
        setApiError("Registration failed. Please try again.");
      }
      
      // Scroll to top to show error
      window.scrollTo(0, 0);
    }
  };

  // ✅ Test API function
  const testAPI = async () => {
    try {
      console.log("🧪 Testing API endpoints...");
      
      // Test 1: Basic GET test
      const testResponse = await axios.get('/test');
      console.log("✅ Test endpoint:", testResponse.data);
      
      alert("API is working! Check console for details.");
      
    } catch (error) {
      console.error("🧪 API Test failed:", error);
      alert("API test failed: " + error.message);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="container-md pt-4">
        <div className="text-center">
          <Link to="/" className="d-inline-block">
            <img 
              src={logo1} 
              className="img-fluid" 
              style={{ maxHeight: '80px', width: 'auto' }} 
              alt="Blood Donation Logo" 
            />
          </Link>
          <button 
            onClick={testAPI}
            className="btn btn-sm btn-outline-primary mt-2"
            style={{ position: 'absolute', right: '20px', top: '20px' }}
          >
            🧪 Test API
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="row g-0">
                {/* Form Section */}
                <div className="col-lg-7 p-4 p-md-5">
                  <div className="mb-4">
                    <h1 className="h2 fw-bold text-primary mb-3">Become a Blood Donor</h1>
                    <p className="text-muted mb-0">
                      Join our community of life-savers. Register now to make a difference.
                    </p>
                  </div>

                  {/* Error Messages */}
                  {(apiError || error) && (
                    <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        <span>{apiError || error}</span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => { setApiError(""); }}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Form Grid */}
                    <div className="row g-3">
                      {/* Full Name */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Full Name *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-user text-muted"></i>
                          </span>
                          <input
                            type="text"
                            name="full_name"
                            className={`form-control border-start-0 ${errors.full_name ? 'is-invalid' : ''}`}
                            placeholder="Enter your full name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                          />
                          {errors.full_name && (
                            <div className="invalid-feedback">{errors.full_name}</div>
                          )}
                        </div>
                      </div>

                      {/* CNIC */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">CNIC Number *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-id-card text-muted"></i>
                          </span>
                          <input
                            type="text"
                            name="cnic"
                            className={`form-control border-start-0 ${errors.cnic ? 'is-invalid' : ''}`}
                            placeholder="35202-1234567-1"
                            value={formData.cnic}
                            onChange={handleCnicChange}
                            maxLength="15"
                            required
                          />
                          {errors.cnic && (
                            <div className="invalid-feedback">{errors.cnic}</div>
                          )}
                        </div>
                      
                      </div>

                      {/* Blood Type */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Blood Type *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-tint text-danger"></i>
                          </span>
                          <select
                            name="blood_type"
                            className="form-select border-start-0"
                            value={formData.blood_type}
                            onChange={handleChange}
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Phone Number *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-phone text-muted"></i>
                          </span>
                          <input
                            type="tel"
                            name="phone_number"
                            className={`form-control border-start-0 ${errors.phone_number ? 'is-invalid' : ''}`}
                            placeholder=""
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                          />
                          {errors.phone_number && (
                            <div className="invalid-feedback">{errors.phone_number}</div>
                          )}
                        </div>
                        <small className="form-text text-muted">11 digits without dashes</small>
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Email (Optional)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-envelope text-muted"></i>
                          </span>
                          <input
                            type="email"
                            name="email"
                            className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Date of Birth *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-calendar text-muted"></i>
                          </span>
                          <input
                            type="date"
                            name="date_of_birth"
                            className={`form-control border-start-0 ${errors.date_of_birth ? 'is-invalid' : ''}`}
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                          />
                          {errors.date_of_birth && (
                            <div className="invalid-feedback">{errors.date_of_birth}</div>
                          )}
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Gender *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-venus-mars text-muted"></i>
                          </span>
                          <select
                            name="gender"
                            className="form-select border-start-0"
                            value={formData.gender}
                            onChange={handleChange}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* City */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">City *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-city text-muted"></i>
                          </span>
                          <input
                            type="text"
                            name="city"
                            className="form-control border-start-0"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="col-12">
                        <label className="form-label fw-medium">Address *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-home text-muted"></i>
                          </span>
                          <input
                            type="text"
                            name="address"
                            className="form-control border-start-0"
                            placeholder="Enter your complete address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Password *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-lock text-muted"></i>
                          </span>
                          <input
                            type="password"
                            name="password"
                            className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Minimum 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="col-md-6">
                        <label className="form-label fw-medium">Confirm Password *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-lock text-muted"></i>
                          </span>
                          <input
                            type="password"
                            name="confirmPassword"
                            className={`form-control border-start-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="form-check mt-4 mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="termsCheckbox" 
                        required 
                      />
                      <label className="form-check-label text-muted" htmlFor="termsCheckbox">
                        I agree to the <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-4 py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Processing Registration...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-heartbeat me-2"></i>
                            Register as Donor
                          </>
                        )}
                      </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-4 pt-3 border-top">
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link to="/login-donor" className="fw-semibold text-decoration-none">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>

                {/* Image Section */}
                <div className="col-lg-5 d-none d-lg-flex bg-primary">
                  <div className="position-relative h-100 p-5 text-white">
                    <div className="position-relative z-1">
                      <h2 className="display-6 fw-bold mb-4">Why Donate Blood?</h2>
                      <ul className="list-unstyled fs-5 mb-5">
                        <li className="mb-3">
                          <i className="fas fa-check-circle me-2"></i>
                          Save up to 3 lives with one donation
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-check-circle me-2"></i>
                          Free health check-up
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-check-circle me-2"></i>
                          Regular donor benefits
                        </li>
                        <li className="mb-3">
                          <i className="fas fa-check-circle me-2"></i>
                          Community recognition
                        </li>
                      </ul>
                      <div className="bg-white bg-opacity-10 p-4 rounded-3">
                        <p className="mb-0">
                          <i className="fas fa-quote-left me-2"></i>
                          Your single donation can be the miracle someone is praying for.
                        </p>
                      </div>
                    </div>
                    <img 
                      src={lable} 
                      className="position-absolute bottom-0 end-0 img-fluid opacity-25"
                      style={{ maxHeight: '50%' }}
                      alt="Blood Donation" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDonor;