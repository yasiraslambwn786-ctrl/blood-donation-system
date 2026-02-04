import React, { useState } from 'react';
import { logo1, lable } from '../../assets/img';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useDispatch } from 'react-redux';
import { setAccepter } from '../../redux/slices/accepterSlice';

const RegisterAccepter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    designation: '',
    blood_bank_name: '',
    contact_number: '',
    address: '',
    joining_date: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.employee_id) {
      setError('Employee ID is required');
      return;
    }

    const requiredFields = ['name', 'employee_id', 'designation', 'blood_bank_name', 'contact_number', 'email', 'password'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      setLoading(true);
      
      // ✅ FIX: Send password_confirmation instead of confirm_password
      const submitData = {
        ...formData,
        password_confirmation: formData.confirm_password // Rename field
      };
      
      // Remove confirm_password
      delete submitData.confirm_password;

      console.log("Sending data:", submitData); // Debug

      const response = await axios.post('/register-accepter', submitData);

      // ✅ ADDED: Success handling code
      console.log("Registration successful:", response.data);
      
      if (response.data.success) {
        // Save to Redux store
        dispatch(setAccepter({
          accepter: response.data.accepter,
          token: response.data.token,
        }));

        // Save to localStorage
        localStorage.setItem('accepterToken', response.data.token);
        localStorage.setItem('accepterData', JSON.stringify(response.data.accepter));

        // Show success message
        alert('Registration successful! You will be redirected to dashboard.');

        // ✅ FIX: Redirect to accepter dashboard
        navigate('/accepter/dashboard', { replace: true });
      } else {
        setError(response.data.message || 'Registration failed');
      }
      
    } catch (err) {
      console.error('Registration Error:', err);
      
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join("\n");
        setError(messages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center p-3 container-md">
        <Link to="/">
          <img src={logo1} className="h-25 w-75 rounded" alt="Logo" />
        </Link>
      </div>

      <div id="intro-example" className="text-center bg-image align-items-center">
        <section>
          <div className="container h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
              <div className="col-lg-12 col-xl-11">
                <div className="card text-black" style={{ borderRadius: '25px' }}>
                  <div className="card-body p-md-5">
                    <div className="row justify-content-center">
                      <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                          <i className="fas fa-user-md me-2"></i>
                          Accepter Registration
                        </p>
                        <p className="text-center text-muted mb-4">
                          Register as Blood Bank Verification Staff
                        </p>

                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                          {/* Error Message */}
                          {error && (
                            <div className="alert alert-danger text-center" role="alert">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              {error}
                            </div>
                          )}

                          {/* Personal Information */}
                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-id-badge fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="text"
                                name="employee_id"
                                className="form-control"
                                placeholder="Employee ID"
                                value={formData.employee_id}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-briefcase fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <select
                                name="designation"
                                className="form-control"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select Designation</option>
                                <option value="Lab Technician">Lab Technician</option>
                                <option value="Blood Bank Officer">Blood Bank Officer</option>
                                <option value="Verification Staff">Verification Staff</option>
                                <option value="Medical Technologist">Medical Technologist</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-hospital fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="text"
                                name="blood_bank_name"
                                className="form-control"
                                placeholder="Blood Bank / Hospital Name"
                                value={formData.blood_bank_name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-phone fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="tel"
                                name="contact_number"
                                className="form-control"
                                placeholder="Contact Number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                pattern="[0-9]{11}"
                                title="11 digit phone number"
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-map-marker-alt fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <textarea
                                name="address"
                                className="form-control"
                                placeholder="Address"
                                rows="2"
                                value={formData.address}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-calendar-alt fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="date"
                                name="joining_date"
                                className="form-control"
                                value={formData.joining_date}
                                onChange={handleChange}
                              />
                              <small className="text-muted">Joining Date (Optional)</small>
                            </div>
                          </div>

                          {/* Password Fields */}
                          <div className="d-flex flex-row align-items-center mb-3">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="password"
                                name="confirm_password"
                                className="form-control"
                                placeholder="Confirm Password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          {/* Terms Agreement */}
                          <div className="form-check d-flex justify-content-center mb-4">
                            <input 
                              className="form-check-input me-2" 
                              type="checkbox" 
                              id="termsCheck" 
                              required 
                            />
                            <label className="form-check-label" htmlFor="termsCheck">
                              I agree to all statements in <a href="#!">Terms of Service</a>
                            </label>
                          </div>

                          {/* Submit Button */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button 
                              type="submit" 
                              className="btn btn-primary btn-lg px-5"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-user-plus me-2"></i>
                                  Register as Accepter
                                </>
                              )}
                            </button>
                          </div>

                          {/* Login Link */}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <p className="small mb-0">
                              Already registered?{' '}
                              <Link to="/login-accepter" className="fw-bold">
                                Login here
                              </Link>
                            </p>
                          </div>

                          {/* Security Note */}
                          <div className="text-center mt-4">
                            <p className="small text-muted">
                              <i className="fas fa-shield-alt me-1"></i>
                              Your registration will be verified by admin before activation
                            </p>
                          </div>
                        </form>
                      </div>

                      {/* Image Section */}
                      <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                        <img src={lable} className="img-fluid rounded-4" alt="Accepter Registration" />
                        <div className="position-absolute bottom-0 start-0 m-4">
                          <div className="bg-dark text-white p-3 rounded opacity-75">
                            <h5 className="mb-2">
                              <i className="fas fa-user-md me-2"></i>
                              Accepter Role
                            </h5>
                            <ul className="small mb-0">
                              <li>Verify blood donations</li>
                              <li>Manage blood inventory</li>
                              <li>Issue blood to receivers</li>
                              <li>Maintain donation records</li>
                            </ul>
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

export default RegisterAccepter;