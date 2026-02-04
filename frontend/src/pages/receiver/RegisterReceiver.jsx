import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../index.css';

const RegisterReceiver = () => {
  const navigate = useNavigate();
  
  // ✅ **VITE COMPATIBLE API URL**
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // ✅ **Form States**
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  // ✅ **Form Data**
  const [formData, setFormData] = useState({
    // Patient Information
    patient_name: '',
    patient_age: '',
    patient_gender: 'Male',
    blood_group_needed: '',
    medical_condition: '',
    
    // Contact Person Information
    contact_name: '',
    relationship: 'Self',
    mobile_number: '',
    email: '',
    alternate_contact: '',
    alternate_relationship: '',
    
    // Hospital Information
    hospital_name: '',
    doctor_name: '',
    ward_room: '',
    city: 'Bahawalnagar',
    urgency_level: 'Normal',
    
    // Account Information
    account_email: '',
    password: '',
    confirm_password: '',
    verification_method: 'sms',
    communication_sms: true,
    communication_email: true,
    communication_whatsapp: false,
    communication_calls: true,
    
    // Medical Information (Optional)
    previous_transfusions: 'No',
    known_allergies: '',
    current_medications: '',
    chronic_conditions: [],
    
    // Terms
    terms_accepted: false
  });

  // ✅ **Hospitals List**
  const hospitals = [
    'Civil Hospital, Bahawalnagar',
    'Red Cross Blood Center',
    'Al-Shifa Hospital',
    'IUB Medical Center',
    'District Headquarters Hospital',
    'Bahawal Victoria Hospital',
    'Shifa International',
    'Other (Please specify)'
  ];

  // ✅ **Cities List**
  const cities = [
    'Bahawalnagar',
    'Bahawalpur',
    'Lahore',
    'Multan',
    'Faisalabad',
    'Rawalpindi',
    'Karachi',
    'Other'
  ];

  // ✅ **Blood Groups**
  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 
    'O+', 'O-', 'AB+', 'AB-',
    'Don\'t Know'
  ];

  // ✅ **Relationships**
  const relationships = [
    'Self (I am the patient)',
    'Spouse/Husband/Wife',
    'Parent/Father/Mother',
    'Child/Son/Daughter',
    'Sibling/Brother/Sister',
    'Other Relative',
    'Friend',
    'Hospital Staff'
  ];

  // ✅ **Handle Input Change**
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'chronic_conditions') {
        let updatedConditions = [...formData.chronic_conditions];
        if (checked) {
          updatedConditions.push(value);
        } else {
          updatedConditions = updatedConditions.filter(condition => condition !== value);
        }
        setFormData(prev => ({ ...prev, chronic_conditions: updatedConditions }));
      } else if (name === 'terms_accepted') {
        setFormData(prev => ({ ...prev, [name]: checked }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ **Handle Step Navigation**
  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1 && !validatePatientInfo()) return;
    if (step === 2 && !validateContactInfo()) return;
    if (step === 3 && !validateHospitalInfo()) return;
    if (step === 4 && !validateAccountInfo()) return;
    
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // ✅ **Validation Functions**
  const validatePatientInfo = () => {
    const { patient_name, patient_age, patient_gender, blood_group_needed } = formData;
    
    if (!patient_name.trim()) {
      alert('Please enter patient name');
      return false;
    }
    
    if (!patient_age || patient_age < 0 || patient_age > 120) {
      alert('Please enter a valid age (0-120)');
      return false;
    }
    
    if (!patient_gender) {
      alert('Please select patient gender');
      return false;
    }
    
    if (!blood_group_needed) {
      alert('Please select blood group needed');
      return false;
    }
    
    return true;
  };

  const validateContactInfo = () => {
    const { contact_name, relationship, mobile_number } = formData;
    
    if (!contact_name.trim()) {
      alert('Please enter contact person name');
      return false;
    }
    
    if (!relationship) {
      alert('Please select relationship to patient');
      return false;
    }
    
    if (!mobile_number || mobile_number.length < 11) {
      alert('Please enter a valid mobile number (11 digits)');
      return false;
    }
    
    return true;
  };

  const validateHospitalInfo = () => {
    const { hospital_name, city } = formData;
    
    if (!hospital_name.trim()) {
      alert('Please select hospital name');
      return false;
    }
    
    if (!city) {
      alert('Please select city');
      return false;
    }
    
    return true;
  };

  const validateAccountInfo = () => {
    const { account_email, password, confirm_password } = formData;
    
    if (!account_email || !/\S+@\S+\.\S+/.test(account_email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirm_password) {
      alert('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // ✅ **Handle Emergency Registration**
  const handleEmergencyRegistration = () => {
    const emergencyData = {
      patient_name: formData.patient_name,
      blood_group_needed: formData.blood_group_needed,
      contact_name: formData.contact_name,
      mobile_number: formData.mobile_number,
      hospital_name: formData.hospital_name,
      emergency: true
    };
    
    // Validate emergency data
    if (!emergencyData.patient_name || !emergencyData.blood_group_needed || 
        !emergencyData.contact_name || !emergencyData.mobile_number || 
        !emergencyData.hospital_name) {
      alert('Please fill all required fields for emergency registration');
      return;
    }
    
    setLoading(true);
    
    // Send emergency request
    axios.post(`${API_BASE_URL}/receiver/emergency-register`, emergencyData)
      .then(response => {
        if (response.data.success) {
          alert('Emergency registration successful! Our team will contact you immediately.');
          navigate('/login-receiver');
        } else {
          alert(response.data.message || 'Emergency registration failed');
        }
      })
      .catch(error => {
        console.error('Emergency registration error:', error);
        alert('Error in emergency registration. Please try again or call emergency helpline.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ✅ **Handle Complete Registration**
 // ✅ **Handle Complete Registration**
// ✅ **Handle Complete Registration**
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.terms_accepted) {
    alert('Please accept the terms and conditions');
    return;
  }
  
  if (!validatePatientInfo() || !validateContactInfo() || 
      !validateHospitalInfo() || !validateAccountInfo()) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Prepare data for API
    const registrationData = {
      // Patient Information
      patient_name: formData.patient_name,
      patient_age: formData.patient_age,
      patient_gender: formData.patient_gender,
      blood_group_needed: formData.blood_group_needed,
      medical_condition: formData.medical_condition || '',
      
      // Contact Information
      contact_name: formData.contact_name,
      relationship: formData.relationship,
      mobile_number: formData.mobile_number,
      email: formData.email || '',
      alternate_contact: formData.alternate_contact || '',
      alternate_relationship: formData.alternate_relationship || '',
      
      // Hospital Information
      hospital_name: formData.hospital_name,
      doctor_name: formData.doctor_name || '',
      ward_room: formData.ward_room || '',
      city: formData.city,
      urgency_level: formData.urgency_level,
      
      // Account Information
      account_email: formData.account_email,
      password: formData.password,
      password_confirmation: formData.confirm_password, // ✅ CHANGED to password_confirmation
      verification_method: formData.verification_method,
      communication_sms: formData.communication_sms,
      communication_email: formData.communication_email,
      communication_whatsapp: formData.communication_whatsapp,
      communication_calls: formData.communication_calls,
      
      // Medical Information
      previous_transfusions: formData.previous_transfusions || 'No',
      known_allergies: formData.known_allergies || '',
      current_medications: formData.current_medications || '',
      chronic_conditions: formData.chronic_conditions || [],
      
      // Terms
      terms_accepted: formData.terms_accepted
    };
    
    console.log('📤 Sending registration data:', registrationData);
    console.log('🌐 API URL:', `${API_BASE_URL}/receiver/register`);
    
    const response = await axios.post(`${API_BASE_URL}/receiver/register`, registrationData);
    
    console.log('✅ API Response:', response.data);
    
    if (response.data.success) {
      // Store token and user data
      localStorage.setItem('receiverToken', response.data.token);
      localStorage.setItem('userRole', 'receiver');
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Show success message
      alert('Registration successful! Please verify your contact information.');
      setVerificationSent(true);
      
      // Redirect to verification page or dashboard
      setTimeout(() => {
        navigate('/receiver/verify');
      }, 2000);
    } else {
      console.error('❌ API returned failure:', response.data);
      alert(response.data.message || 'Registration failed. Check console for details.');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Detailed error logging
    if (error.response) {
      // Server responded with error status
      console.error('📡 Server response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Show validation errors if any
      if (error.response.status === 422 && error.response.data.errors) {
        const errors = error.response.data.errors;
        let errorMessage = 'Validation errors:\n';
        for (const field in errors) {
          errorMessage += `• ${errors[field].join(', ')}\n`;
        }
        alert(errorMessage);
      } else {
        alert(`Server Error (${error.response.status}): ${error.response.data?.message || 'Registration failed'}`);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('📡 No response received:', error.request);
      alert('No response from server. Check if backend is running.');
    } else {
      // Something else happened
      console.error('❌ Request setup error:', error.message);
      alert('Error: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  // ✅ **Password Strength Calculator**
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getStrengthLabel = (strength) => {
    if (strength >= 75) return 'Strong';
    if (strength >= 50) return 'Medium';
    if (strength >= 25) return 'Weak';
    return 'Very Weak';
  };

  const getStrengthColor = (strength) => {
    if (strength >= 75) return 'success';
    if (strength >= 50) return 'warning';
    return 'danger';
  };

  // ✅ **Step 1: Patient Information**
  const renderStep1 = () => (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-primary text-white py-3">
        <h5 className="mb-0">
          <i className="fas fa-user-injured me-2"></i>
          Patient Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              <strong>Patient Full Name *</strong>
              <small className="text-muted ms-1">(As per hospital records)</small>
            </label>
            <input
              type="text"
              className="form-control"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="Enter patient's full name"
              required
            />
          </div>
          
          <div className="col-md-3">
            <label className="form-label">
              <strong>Patient Age *</strong>
              <small className="text-muted ms-1">(Years)</small>
            </label>
            <input
              type="number"
              className="form-control"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleChange}
              min="0"
              max="120"
              placeholder="Age"
              required
            />
          </div>
          
          <div className="col-md-3">
            <label className="form-label">
              <strong>Patient Gender *</strong>
            </label>
            <select
              className="form-select"
              name="patient_gender"
              value={formData.patient_gender}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Blood Group Needed *</strong>
            </label>
            <select
              className="form-select"
              name="blood_group_needed"
              value={formData.blood_group_needed}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Medical Condition</strong>
              <small className="text-muted ms-1">(Optional)</small>
            </label>
            <input
              type="text"
              className="form-control"
              name="medical_condition"
              value={formData.medical_condition}
              onChange={handleChange}
              placeholder="e.g., Surgery, Accident, Cancer, etc."
            />
          </div>
        </div>
        
        <div className="alert alert-info mt-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Important:</strong> Patient name must match hospital records exactly. 
          If blood group is unknown, select "Don't Know" - hospital will perform testing.
        </div>
      </div>
    </div>
  );

  // ✅ **Step 2: Contact Person Information**
  const renderStep2 = () => (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-info text-white py-3">
        <h5 className="mb-0">
          <i className="fas fa-address-book me-2"></i>
          Contact Person Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              <strong>Your Name *</strong>
              <small className="text-muted ms-1">(Person filling this form)</small>
            </label>
            <input
              type="text"
              className="form-control"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Relationship to Patient *</strong>
            </label>
            <select
              className="form-select"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
            >
              <option value="">Select Relationship</option>
              {relationships.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Mobile Number *</strong>
              <small className="text-muted ms-1">(Will receive SMS updates)</small>
            </label>
            <div className="input-group">
              <span className="input-group-text">+92</span>
              <input
                type="tel"
                className="form-control"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="3XX XXXXXXX"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Email Address</strong>
              <small className="text-muted ms-1">(Optional - for detailed updates)</small>
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>
          
          <div className="col-12">
            <div className="card border mt-3">
              <div className="card-header bg-light py-2">
                <h6 className="mb-0">
                  <i className="fas fa-user-friends me-2"></i>
                  Alternate Contact Person (Optional)
                </h6>
              </div>
              <div className="card-body py-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      name="alternate_contact"
                      value={formData.alternate_contact}
                      onChange={handleChange}
                      placeholder="Alternate contact name"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      name="alternate_relationship"
                      value={formData.alternate_relationship}
                      onChange={handleChange}
                      placeholder="Relationship"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="tel"
                      className="form-control"
                      name="alternate_contact_number"
                      value={formData.alternate_contact_number}
                      onChange={handleChange}
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert alert-warning mt-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Important:</strong> Use an active mobile number. SMS verification will be sent. 
          Contact person should be available 24/7 during emergency.
        </div>
      </div>
    </div>
  );

  // ✅ **Step 3: Hospital Information**
  const renderStep3 = () => (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-success text-white py-3">
        <h5 className="mb-0">
          <i className="fas fa-hospital me-2"></i>
          Hospital Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              <strong>Hospital Name *</strong>
            </label>
            <select
              className="form-select"
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleChange}
              required
            >
              <option value="">Select Hospital</option>
              {hospitals.map(hospital => (
                <option key={hospital} value={hospital}>{hospital}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>City *</strong>
            </label>
            <select
              className="form-select"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Doctor In-Charge</strong>
              <small className="text-muted ms-1">(Optional - helps with verification)</small>
            </label>
            <input
              type="text"
              className="form-control"
              name="doctor_name"
              value={formData.doctor_name}
              onChange={handleChange}
              placeholder="Doctor's name"
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label">
              <strong>Ward/Room Number</strong>
              <small className="text-muted ms-1">(Optional - for delivery reference)</small>
            </label>
            <input
              type="text"
              className="form-control"
              name="ward_room"
              value={formData.ward_room}
              onChange={handleChange}
              placeholder="e.g., Ward 5, Room 12"
            />
          </div>
          
          <div className="col-12">
            <label className="form-label">
              <strong>Urgency Level *</strong>
            </label>
            <div className="row g-3">
              <div className="col-md-4">
                <div className={`card ${formData.urgency_level === 'Normal' ? 'border-primary' : ''}`}>
                  <div className="card-body text-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="urgency_level"
                        id="normal"
                        value="Normal"
                        checked={formData.urgency_level === 'Normal'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="normal">
                        <h6 className="mb-1">Normal</h6>
                        <small className="text-muted">Blood needed in 2-7 days</small>
                        <div className="mt-2">
                          <small>
                            <i className="fas fa-calendar me-1"></i>
                            Scheduled surgeries
                          </small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className={`card ${formData.urgency_level === 'Urgent' ? 'border-warning' : ''}`}>
                  <div className="card-body text-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="urgency_level"
                        id="urgent"
                        value="Urgent"
                        checked={formData.urgency_level === 'Urgent'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="urgent">
                        <h6 className="mb-1 text-warning">⚠️ Urgent</h6>
                        <small className="text-muted">Blood needed in 24-48 hours</small>
                        <div className="mt-2">
                          <small>
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Critical but stable
                          </small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className={`card ${formData.urgency_level === 'Emergency' ? 'border-danger' : ''}`}>
                  <div className="card-body text-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="urgency_level"
                        id="emergency"
                        value="Emergency"
                        checked={formData.urgency_level === 'Emergency'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="emergency">
                        <h6 className="mb-1 text-danger">🚨 Emergency</h6>
                        <small className="text-muted">Blood needed immediately</small>
                        <div className="mt-2">
                          <small>
                            <i className="fas fa-ambulance me-1"></i>
                            Life-threatening
                          </small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ **Step 4: Account Setup**
  const renderStep4 = () => {
    const passwordStrength = calculatePasswordStrength(formData.password);
    const strengthLabel = getStrengthLabel(passwordStrength);
    const strengthColor = getStrengthColor(passwordStrength);
    
    return (
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            <i className="fas fa-user-lock me-2"></i>
            Account Setup
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                <strong>Email Address *</strong>
                <small className="text-muted ms-1">(For account login and updates)</small>
              </label>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  name="account_email"
                  value={formData.account_email}
                  onChange={handleChange}
                  placeholder="Enter email for account"
                  required
                />
                <button className="btn btn-outline-secondary" type="button">
                  Check Availability
                </button>
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">
                <strong>Verification Method *</strong>
              </label>
              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="verification_method"
                    id="sms"
                    value="sms"
                    checked={formData.verification_method === 'sms'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="sms">
                    <i className="fas fa-sms me-1 text-success"></i>
                    Verify via SMS (OTP sent to mobile number)
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="verification_method"
                    id="email"
                    value="email"
                    checked={formData.verification_method === 'email'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="email">
                    <i className="fas fa-envelope me-1 text-primary"></i>
                    Verify via Email (Link sent to email address)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">
                <strong>Password *</strong>
                <small className="text-muted ms-1">(Minimum 8 characters)</small>
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              <div className="mt-2">
                <div className="progress" style={{ height: '5px' }}>
                  <div 
                    className={`progress-bar bg-${strengthColor}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <small className={`text-${strengthColor}`}>
                  Strength: {strengthLabel}
                </small>
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">
                <strong>Confirm Password *</strong>
              </label>
              <input
                type="password"
                className="form-control"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
              {formData.password && formData.confirm_password && (
                <small className={formData.password === formData.confirm_password ? 'text-success' : 'text-danger'}>
                  <i className={`fas fa-${formData.password === formData.confirm_password ? 'check' : 'times'}-circle me-1`}></i>
                  {formData.password === formData.confirm_password ? 'Passwords match' : 'Passwords do not match'}
                </small>
              )}
            </div>
            
            <div className="col-12">
              <label className="form-label">
                <strong>Communication Preferences</strong>
              </label>
              <div className="row">
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="communication_sms"
                      id="sms_updates"
                      checked={formData.communication_sms}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="sms_updates">
                      <i className="fas fa-sms me-1 text-success"></i>
                      SMS Updates
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="communication_email"
                      id="email_updates"
                      checked={formData.communication_email}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="email_updates">
                      <i className="fas fa-envelope me-1 text-primary"></i>
                      Email Updates
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="communication_whatsapp"
                      id="whatsapp_updates"
                      checked={formData.communication_whatsapp}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="whatsapp_updates">
                      <i className="fab fa-whatsapp me-1 text-success"></i>
                      WhatsApp Messages
                    </label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="communication_calls"
                      id="calls_updates"
                      checked={formData.communication_calls}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="calls_updates">
                      <i className="fas fa-phone me-1 text-info"></i>
                      Phone Calls (Emergency only)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ **Step 5: Medical Information (Optional)**
  const renderStep5 = () => (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-secondary text-white py-3">
        <h5 className="mb-0">
          <i className="fas fa-file-medical me-2"></i>
          Additional Medical Information (Optional)
        </h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-4">
          <i className="fas fa-info-circle me-1"></i>
          This information helps in better blood matching and medical care.
        </p>
        
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">
              <strong>Previous Transfusions</strong>
            </label>
            <select
              className="form-select"
              name="previous_transfusions"
              value={formData.previous_transfusions}
              onChange={handleChange}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="Don't Know">Don't Know</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label">
              <strong>Known Allergies</strong>
            </label>
            <input
              type="text"
              className="form-control"
              name="known_allergies"
              value={formData.known_allergies}
              onChange={handleChange}
              placeholder="e.g., Penicillin, Latex, etc."
            />
          </div>
          
          <div className="col-md-4">
            <label className="form-label">
              <strong>Current Medications</strong>
            </label>
            <input
              type="text"
              className="form-control"
              name="current_medications"
              value={formData.current_medications}
              onChange={handleChange}
              placeholder="e.g., Insulin, Blood thinners, etc."
            />
          </div>
          
          <div className="col-12">
            <label className="form-label">
              <strong>Chronic Conditions (Check all that apply)</strong>
            </label>
            <div className="row">
              <div className="col-md-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chronic_conditions"
                    id="diabetes"
                    value="Diabetes"
                    checked={formData.chronic_conditions.includes('Diabetes')}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="diabetes">
                    Diabetes
                  </label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chronic_conditions"
                    id="hypertension"
                    value="Hypertension"
                    checked={formData.chronic_conditions.includes('Hypertension')}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="hypertension">
                    Hypertension
                  </label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chronic_conditions"
                    id="heart_disease"
                    value="Heart Disease"
                    checked={formData.chronic_conditions.includes('Heart Disease')}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="heart_disease">
                    Heart Disease
                  </label>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chronic_conditions"
                    id="none"
                    value="None"
                    checked={formData.chronic_conditions.includes('None')}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="none">
                    None
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label">
              <strong>Upload Documents (Optional)</strong>
            </label>
            <div className="border rounded p-3">
              <div className="text-center">
                <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                <p className="text-muted mb-2">Maximum 3 files, 5MB each</p>
                <button className="btn btn-outline-primary">
                  <i className="fas fa-paperclip me-2"></i>
                  Attach Files
                </button>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-check-circle me-1 text-success"></i>
                  Recommended: Doctor's prescription, Hospital admission slip, Medical reports
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert alert-info mt-4">
          <i className="fas fa-shield-alt me-2"></i>
          <strong>Privacy Note:</strong> Medical information is encrypted and shared only with assigned medical staff. 
          Automatically deleted after 6 months.
        </div>
      </div>
    </div>
  );

  // ✅ **Step 6: Terms & Verification**
  const renderStep6 = () => (
    <div className="card border-0 shadow-lg">
      <div className="card-header bg-danger text-white py-3">
        <h5 className="mb-0">
          <i className="fas fa-clipboard-check me-2"></i>
          Final Steps
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <h6 className="mb-3">Terms & Conditions</h6>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="terms_accepted"
                  id="terms1"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms1">
                  I confirm that all information provided is accurate and true
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="terms_accepted2"
                  id="terms2"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms2">
                  I understand that providing false information is illegal
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="terms_accepted3"
                  id="terms3"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms3">
                  I agree to hospital verification of medical need
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="terms_accepted4"
                  id="terms4"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms4">
                  I consent to contact by blood bank staff for coordination
                </label>
              </div>
            </div>
            <div className="mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="terms_accepted5"
                  id="terms5"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms5">
                  I agree to the Privacy Policy and Terms of Service
                </label>
              </div>
            </div>
            
            <div className="d-flex gap-2 mb-4">
              <button className="btn btn-outline-primary btn-sm">
                <i className="fas fa-file me-1"></i>View Complete Terms
              </button>
              <button className="btn btn-outline-primary btn-sm">
                <i className="fas fa-file-alt me-1"></i>Privacy Policy
              </button>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="alert alert-warning">
              <h6>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Verification Reminder
              </h6>
              <ul className="small mb-0">
                <li>Hospital may contact you for verification</li>
                <li>Blood release requires proper documentation</li>
                <li>Emergency requests get priority verification</li>
                <li>Fake requests will be reported to authorities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ **Render Progress Bar**
  const renderProgressBar = () => (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">
              <i className="fas fa-hospital-user me-2 text-primary"></i>
              Receiver Registration
            </h5>
            <p className="text-muted mb-0">Step {step} of 6</p>
          </div>
          <div className="text-end">
            <div className="progress" style={{ width: '200px', height: '10px' }}>
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
            <small className="text-muted">{Math.round((step / 6) * 100)}% Complete</small>
          </div>
        </div>
        
        <div className="row mt-3">
          {[1, 2, 3, 4, 5, 6].map((stepNum) => (
            <div key={stepNum} className="col text-center">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= stepNum ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                   style={{ width: '30px', height: '30px' }}>
                {stepNum}
              </div>
              <div className="small mt-1">
                {stepNum === 1 && 'Patient'}
                {stepNum === 2 && 'Contact'}
                {stepNum === 3 && 'Hospital'}
                {stepNum === 4 && 'Account'}
                {stepNum === 5 && 'Medical'}
                {stepNum === 6 && 'Terms'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ **Render Step Content**
  const renderStepContent = () => {
    switch(step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  // ✅ **Render Registration Options**
  const renderRegistrationOptions = () => (
    <div className="row mb-4">
      <div className="col-md-4 mb-3">
        <div className="card border-success h-100">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">
              <i className="fas fa-check-circle me-2"></i>
              Complete Registration
            </h6>
          </div>
          <div className="card-body">
            <p className="card-text">
              <strong>Recommended for:</strong>
            </p>
            <ul className="small">
              <li>Scheduled surgeries (next 2-7 days)</li>
              <li>Regular transfusion patients</li>
              <li>Non-emergency cases</li>
              <li>Patients with chronic needs</li>
            </ul>
            <button 
              className="btn btn-success w-100"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-3">
        <div className="card border-danger h-100">
          <div className="card-header bg-danger text-white">
            <h6 className="mb-0">
              <i className="fas fa-ambulance me-2"></i>
              Emergency Registration
            </h6>
          </div>
          <div className="card-body">
            <p className="card-text">
              <strong>For immediate need:</strong>
            </p>
            <ul className="small">
              <li>Accident victims</li>
              <li>Critical surgeries</li>
              <li>Life-threatening situations</li>
              <li>Active bleeding cases</li>
            </ul>
            <button 
              className="btn btn-danger w-100"
              onClick={handleEmergencyRegistration}
              disabled={loading}
            >
              <i className="fas fa-bell me-2"></i>
              Emergency Request
            </button>
          </div>
        </div>
      </div>
      
      <div className="col-md-4 mb-3">
        <div className="card border-info h-100">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">
              <i className="fas fa-phone-alt me-2"></i>
              Guest Request
            </h6>
          </div>
          <div className="card-body">
            <p className="card-text">
              <strong>When to use:</strong>
            </p>
            <ul className="small">
              <li>No internet access</li>
              <li>Immediate verbal request needed</li>
              <li>One-time need only</li>
              <li>Prefer phone communication</li>
            </ul>
            <div className="text-center">
              <h5 className="text-danger mb-2">Emergency Helpline</h5>
              <h4 className="mb-3">
                <i className="fas fa-phone me-2"></i>
                115
              </h4>
              <button className="btn btn-outline-info btn-sm">
                <i className="fas fa-phone me-1"></i>
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ **Success Message**
  if (verificationSent) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-success shadow-lg">
              <div className="card-header bg-success text-white text-center py-4">
                <i className="fas fa-check-circle fa-4x mb-3"></i>
                <h3 className="mb-0">Registration Successful!</h3>
              </div>
              <div className="card-body p-5">
                <h5 className="text-success mb-4">
                  <i className="fas fa-check me-2"></i>
                  What's Next?
                </h5>
                
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <i className="fas fa-mobile-alt fa-2x text-primary mb-3"></i>
                        <h6>Verify Mobile Number</h6>
                        <p className="small text-muted">Check SMS for OTP code</p>
                        <button className="btn btn-primary btn-sm">
                          Enter OTP Now
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <i className="fas fa-envelope fa-2x text-primary mb-3"></i>
                        <h6>Verify Email</h6>
                        <p className="small text-muted">Check email for verification link</p>
                        <button className="btn btn-primary btn-sm">
                          Check Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-info">
                  <h6>
                    <i className="fas fa-clock me-2"></i>
                    Next Steps Timeline
                  </h6>
                  <ul className="mb-0">
                    <li><strong>Mobile verification:</strong> Now (OTP sent)</li>
                    <li><strong>Email verification:</strong> Within 1 hour</li>
                    <li><strong>Hospital verification:</strong> 2-24 hours</li>
                    <li><strong>First blood request:</strong> Whenever needed</li>
                  </ul>
                </div>
                
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-outline-primary">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Go to Dashboard
                  </button>
                  <button className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>
                    Create First Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              <i className="fas fa-home me-1"></i>Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <i className="fas fa-hospital-user me-1"></i>
            Receiver Registration
          </li>
        </ol>
      </nav>

      {/* Main Header */}
      <div className="text-center mb-5">
        <h1 className="text-danger mb-3">
          <i className="fas fa-hospital-user me-2"></i>
          Blood Receiver Registration
        </h1>
        <p className="lead text-muted">
          For Patients & Families Needing Blood Transfusion
        </p>
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-circle me-2"></i>
          <strong>Important:</strong> This registration is for PATIENTS needing blood or their FAMILY MEMBERS. 
          All information is kept confidential and used only for blood arrangement.
        </div>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        
        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <div>
            {step > 1 && (
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={prevStep}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Previous
              </button>
            )}
          </div>
          
          <div>
            {step < 6 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextStep}
              >
                Next Step
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing Registration...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Registration Options (Only show on last step) */}
      {step === 6 && (
        <>
          <hr className="my-5" />
          <h4 className="text-center mb-4">
            <i className="fas fa-route me-2"></i>
            Registration Options
          </h4>
          {renderRegistrationOptions()}
        </>
      )}

      {/* Support Section */}
      <div className="card border-0 shadow-sm mt-5">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="fas fa-life-ring me-2"></i>
            Need Assistance?
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>
                <i className="fas fa-phone me-2"></i>
                Contact Support
              </h6>
              <ul className="list-unstyled">
                <li><i className="fas fa-circle text-success me-2"></i>Phone: 061-XXXXXXX (9 AM - 5 PM)</li>
                <li><i className="fas fa-circle text-success me-2"></i>WhatsApp: +92-300-XXXXXXX</li>
                <li><i className="fas fa-circle text-success me-2"></i>Email: support@bloodportal.iub.edu.pk</li>
                <li><i className="fas fa-circle text-success me-2"></i>In-person: CS Department, IUB Bahawalnagar Campus</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>
                <i className="fas fa-walking me-2"></i>
                Walk-in Support
              </h6>
              <ul className="list-unstyled">
                <li><i className="fas fa-hospital me-2 text-danger"></i>Civil Hospital Blood Bank (24/7)</li>
                <li><i className="fas fa-plus-circle me-2 text-danger"></i>Red Cross Center (8 AM - 8 PM)</li>
                <li><i className="fas fa-university me-2 text-primary"></i>IUB Medical Center (9 AM - 5 PM)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterReceiver;