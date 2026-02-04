import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo1, lable } from "../../assets/img";
import axios from '../../api/axiosInstance'; // Use your axios instance
import { useDispatch } from 'react-redux';
import { setAccepter } from '../../redux/slices/accepterSlice';
import AuthService  from '../../services/authService'; // If using AuthBridge

const LoginAccepter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user types
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  
  if (!formData.email || !formData.password) {
    setError("Please enter both email and password");
    return;
  }

  setLoading(true);

  try {
    // ✅ FIX: Correct endpoint is '/accepter/login' NOT '/login-accepter'
    const response = await axios.post('/accepter/login', {
      email: formData.email,
      password: formData.password
      // Remove device_name as it's not in your controller
    });

    console.log("Login response:", response.data);

    if (response.data.success) {
      const { accepter, token } = response.data;
      
      // ✅ Store in Redux
      dispatch(setAccepter({
        accepter: accepter,
        token: token,
      }));

      // ✅ Store in localStorage
      localStorage.setItem('accepterToken', token);
      localStorage.setItem('accepterData', JSON.stringify(accepter));
      localStorage.setItem('userRole', 'accepter');

      // ✅ Navigate to dashboard
      navigate("/accepter/dashboard");
      
      console.log('✅ Login successful!');
      
    } else {
      setError(response.data.message || "Login failed");
    }
    
  } catch (err) {
    console.error('Login Error:', err);
    
    // Handle specific error cases
    if (err.response?.status === 401) {
      setError("Invalid email or password. Please try again.");
    } else if (err.response?.status === 405) {
      setError("Please use the correct login endpoint: /accepter/login");
    } else if (err.response?.data?.errors) {
      const messages = Object.values(err.response.data.errors).flat().join("\n");
      setError(messages);
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
    } else {
      setError("Login failed. Please try again later.");
    }
  } finally {
    setLoading(false);
  }
};

  // ... Rest of your JSX remains the same ...
  return (
    <div>
      <div className="text-center p-3 container-md">
        <Link to="/">
          <img src={logo1} className="h-25 w-75 rounded" alt="Blood Donation System" />
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
                          <i className="fas fa-user-md me-2 text-warning"></i>
                          Accepter Login
                        </p>
                        <p className="text-center text-muted mb-5">
                          Hospital staff access for donation verification
                        </p>

                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                          {/* Email Field */}
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-envelope fa-lg me-3 fa-fw text-warning"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter hospital email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                              <label className="form-label">Email Address</label>
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-lock fa-lg me-3 fa-fw text-warning"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                              />
                              <label className="form-label">Password</label>
                            </div>
                          </div>

                          {/* Remember Me & Forgot Password */}
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="rememberMe"
                              />
                              <label className="form-check-label" htmlFor="rememberMe">
                                Remember me
                              </label>
                            </div>
                            <Link to="/forgot-password-accepter" className="text-warning">
                              Forgot password?
                            </Link>
                          </div>

                          {/* Error Message */}
                          {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              {error}
                              <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                              type="submit"
                              className="btn btn-warning btn-lg px-5"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Authenticating...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-sign-in-alt me-2"></i>
                                  Login as Accepter
                                </>
                              )}
                            </button>
                          </div>

                          {/* Registration Link */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <p className="small mb-0">
                              Don't have an accepter account?{" "}
                              <Link to="/register-accepter" className="text-warning fw-bold">
                                Register here
                              </Link>
                            </p>
                          </div>

                          {/* Security Note */}
                          <div className="text-center mt-4">
                            <div className="alert alert-warning border-warning" role="alert">
                              <i className="fas fa-shield-alt me-2"></i>
                              <small>
                                Access restricted to authorized hospital staff only. 
                                All login activities are monitored and logged.
                              </small>
                            </div>
                          </div>

                          {/* Other Login Options */}
                          <div className="text-center">
                            <p className="text-muted small mb-2">Need other access?</p>
                            <div className="d-flex justify-content-center gap-2">
                              <Link to="/login-admin" className="btn btn-sm btn-outline-danger">
                                Admin
                              </Link>
                              <Link to="/login-staff" className="btn btn-sm btn-outline-success">
                                Staff
                              </Link>
                              <Link to="/login-donor" className="btn btn-sm btn-outline-primary">
                                Donor
                              </Link>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Image/Info Section */}
                      <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                        <div className="text-center w-100">
                          <img src={lable} className="img-fluid rounded-4 mb-4" alt="Hospital Staff" />
                          <h5 className="text-dark mb-3">
                            <i className="fas fa-tasks me-2 text-warning"></i>
                            Accepter Responsibilities
                          </h5>
                          <div className="text-start">
                            <p className="mb-2">
                              <i className="fas fa-check text-success me-2"></i>
                              Verify donor identity and documents
                            </p>
                            <p className="mb-2">
                              <i className="fas fa-check text-success me-2"></i>
                              Confirm blood donation completion
                            </p>
                            <p className="mb-2">
                              <i className="fas fa-check text-success me-2"></i>
                              Update blood inventory records
                            </p>
                            <p className="mb-2">
                              <i className="fas fa-check text-success me-2"></i>
                              Issue blood units to authorized receivers
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginAccepter;