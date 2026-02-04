import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReceiverProfile } from '../../redux/slices/receiverSlice';
import { logoutReceiver } from '../../redux/slices/receiverSlice';

const ReceiverProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ **VITE COMPATIBLE API URL**
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // ✅ **Get receiver data from Redux store**
  const { receiver, loading: reduxLoading, error: reduxError } = useSelector((state) => state.receiver);
  
  // ✅ **Local States**
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [localProfile, setLocalProfile] = useState(null);
  
  // ✅ **Form Data - Initialize with empty data**
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
    
    // Communication Preferences
    communication_sms: true,
    communication_email: true,
    communication_whatsapp: false,
    communication_calls: true,
    
    // Medical Information
    previous_transfusions: 'No',
    known_allergies: '',
    current_medications: '',
    chronic_conditions: [],
  });

  // ✅ **Helper function to parse chronic conditions**
  const parseChronicConditions = (conditions) => {
    if (!conditions) return [];
    
    // If it's already an array, return it
    if (Array.isArray(conditions)) return conditions;
    
    // If it's a string, try to parse it
    if (typeof conditions === 'string') {
      try {
        // Try to parse as JSON (might be JSON string)
        const parsed = JSON.parse(conditions);
        return Array.isArray(parsed) ? parsed : [conditions];
      } catch {
        // If not valid JSON, treat as comma-separated string
        return conditions.split(',').map(item => item.trim()).filter(item => item);
      }
    }
    
    return [];
  };

  // ✅ **Helper function to format chronic conditions for display**
  const formatChronicConditions = (conditions) => {
    if (!conditions) return 'None reported';
    
    const parsed = parseChronicConditions(conditions);
    if (parsed.length === 0) return 'None reported';
    
    return parsed.join(', ');
  };

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

  // ✅ **Load from localStorage if Redux fails**
  useEffect(() => {
    const storedData = localStorage.getItem('receiverData');
    if (storedData) {
      try {
        setLocalProfile(JSON.parse(storedData));
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
  }, []);

  // ✅ **Fetch receiver data on component mount**
  useEffect(() => {
    if (!receiver) {
      dispatch(fetchReceiverProfile());
    }
  }, [dispatch, receiver]);

  // ✅ **Populate form data when receiver data is available**
  useEffect(() => {
    const profileData = receiver || localProfile;
    
    if (profileData) {
      console.log('📊 Populating form with receiver data:', profileData);
      console.log('📊 Chronic conditions:', profileData.chronic_conditions);
      console.log('📊 Chronic conditions type:', typeof profileData.chronic_conditions);
      
      setFormData({
        // Patient Information
        patient_name: profileData.patient_name || '',
        patient_age: profileData.patient_age || '',
        patient_gender: profileData.patient_gender || 'Male',
        blood_group_needed: profileData.blood_group_needed || '',
        medical_condition: profileData.medical_condition || '',
        
        // Contact Person Information
        contact_name: profileData.contact_name || '',
        relationship: profileData.relationship || 'Self',
        mobile_number: profileData.mobile_number || '',
        email: profileData.email || '',
        alternate_contact: profileData.alternate_contact || '',
        alternate_relationship: profileData.alternate_relationship || '',
        
        // Hospital Information
        hospital_name: profileData.hospital_name || '',
        doctor_name: profileData.doctor_name || '',
        ward_room: profileData.ward_room || '',
        city: profileData.city || 'Bahawalnagar',
        urgency_level: profileData.urgency_level || 'Normal',
        
        // Communication Preferences
        communication_sms: profileData.communication_sms !== undefined ? profileData.communication_sms : true,
        communication_email: profileData.communication_email !== undefined ? profileData.communication_email : true,
        communication_whatsapp: profileData.communication_whatsapp || false,
        communication_calls: profileData.communication_calls !== undefined ? profileData.communication_calls : true,
        
        // Medical Information
        previous_transfusions: profileData.previous_transfusions || 'No',
        known_allergies: profileData.known_allergies || '',
        current_medications: profileData.current_medications || '',
        chronic_conditions: parseChronicConditions(profileData.chronic_conditions),
      });
    }
  }, [receiver, localProfile]);

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
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ **Handle Profile Update**
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('receiverToken');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
        return;
      }

      // Prepare update data
      const updateData = {
        // Patient Information
        patient_name: formData.patient_name,
        patient_age: formData.patient_age,
        patient_gender: formData.patient_gender,
        blood_group_needed: formData.blood_group_needed,
        medical_condition: formData.medical_condition,
        
        // Contact Information
        contact_name: formData.contact_name,
        relationship: formData.relationship,
        mobile_number: formData.mobile_number,
        email: formData.email,
        alternate_contact: formData.alternate_contact,
        alternate_relationship: formData.alternate_relationship,
        
        // Hospital Information
        hospital_name: formData.hospital_name,
        doctor_name: formData.doctor_name,
        ward_room: formData.ward_room,
        city: formData.city,
        urgency_level: formData.urgency_level,
        
        // Communication Preferences
        communication_sms: formData.communication_sms,
        communication_email: formData.communication_email,
        communication_whatsapp: formData.communication_whatsapp,
        communication_calls: formData.communication_calls,
        
        // Medical Information
        previous_transfusions: formData.previous_transfusions,
        known_allergies: formData.known_allergies,
        current_medications: formData.current_medications,
        chronic_conditions: formData.chronic_conditions,
      };

      console.log('📤 Sending update data:', updateData);

      const response = await axios.put(`${API_BASE_URL}/receiver/profile`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Update Response:', response.data);

      if (response.data.success) {
        // Update local storage
        const updatedReceiver = { ...receiver, ...updateData };
        localStorage.setItem('receiverData', JSON.stringify(updatedReceiver));
        
        // Update Redux store
        dispatch(fetchReceiverProfile());
        
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        
        // Exit edit mode after successful update
        setTimeout(() => {
          setEditMode(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: response.data.message || 'Failed to update profile' 
        });
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setMessage({ 
            type: 'error', 
            text: 'Session expired. Please login again.' 
          });
          setTimeout(() => {
            dispatch(logoutReceiver());
            navigate('/login-receiver');
          }, 2000);
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          let errorMessage = 'Validation errors:\n';
          for (const field in errors) {
            errorMessage += `• ${errors[field].join(', ')}\n`;
          }
          setMessage({ type: 'error', text: errorMessage });
        } else {
          setMessage({ 
            type: 'error', 
            text: `Server Error: ${error.response.data?.message || 'Update failed'}` 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Network error. Please check your connection.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ **Verification Status Badge**
  const getVerificationBadge = () => {
    const profileData = receiver || localProfile;
    if (!profileData) return null;
    
    const isVerified = profileData.mobile_verified && 
                      profileData.email_verified && 
                      profileData.hospital_verified;
    
    if (isVerified) {
      return (
        <span className="badge bg-success">
          <i className="fas fa-check-circle me-1"></i>
          Fully Verified
        </span>
      );
    } else {
      return (
        <span className="badge bg-warning">
          <i className="fas fa-clock me-1"></i>
          Verification Pending
        </span>
      );
    }
  };

  // ✅ **Use profileData as fallback**
  const profileData = receiver || localProfile;

  // ✅ **Show error if both Redux and localStorage fail**
  if (reduxError && !profileData) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4><i className="fas fa-exclamation-triangle me-2"></i>Failed to Load Profile</h4>
          <p className="mb-3">{reduxError}</p>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={() => dispatch(fetchReceiverProfile())}
            >
              <i className="fas fa-redo me-2"></i>Retry
            </button>
            <Link to="/receiver/dashboard" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ **Show loading**
  if (reduxLoading && !profileData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="lead">Loading profile information...</p>
        </div>
      </div>
    );
  }

  // ✅ **If no data at all**
  if (!profileData) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4><i className="fas fa-user-slash me-2"></i>No Profile Data</h4>
          <p>Unable to load profile information. Please try logging in again.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              dispatch(logoutReceiver());
              navigate('/login?role=receiver');
            }}
          >
            <i className="fas fa-sign-in-alt me-2"></i>Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="fas fa-user-circle me-2 text-primary"></i>
            My Profile
          </h2>
          <p className="text-muted">
            {reduxError ? 'Using cached data. Some features may be limited.' : 'Manage your receiver profile'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className={`btn ${editMode ? 'btn-warning' : 'btn-primary'}`}
            onClick={() => setEditMode(!editMode)}
          >
            <i className={`fas fa-${editMode ? 'times' : 'edit'} me-2`}></i>
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <Link to="/receiver/dashboard" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Left Column - Account Summary */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Account Summary
              </h5>
            </div>
            <div className="card-body text-center">
              {/* Profile Picture */}
              <div className="mb-3">
                <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '100px', height: '100px' }}>
                  <i className="fas fa-user-circle fa-4x text-secondary"></i>
                </div>
              </div>
              
              {/* User Info */}
              <h4 className="mb-2">{profileData.contact_name || 'Receiver'}</h4>
              <p className="text-muted mb-1">
                <i className="fas fa-user-tag me-1"></i>
                {profileData.relationship || 'Contact Person'}
              </p>
              
              {/* Verification Status */}
              <div className="mb-3">
                {getVerificationBadge()}
              </div>
              
              {/* Account Details */}
              <div className="list-group list-group-flush text-start">
                <div className="list-group-item border-0 px-0 py-2">
                  <small className="text-muted d-block">Registration Date</small>
                  <strong>
                    {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <small className="text-muted d-block">Account Status</small>
                  <strong className="text-success">
                    <i className="fas fa-circle me-1"></i>
                    Active
                  </strong>
                </div>
                <div className="list-group-item border-0 px-0 py-2">
                  <small className="text-muted d-block">Last Updated</small>
                  <strong>
                    {profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Verification Status
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Mobile Verification</span>
                <span className={`badge ${profileData.mobile_verified ? 'bg-success' : 'bg-warning'}`}>
                  {profileData.mobile_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Email Verification</span>
                <span className={`badge ${profileData.email_verified ? 'bg-success' : 'bg-warning'}`}>
                  {profileData.email_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Hospital Verification</span>
                <span className={`badge ${profileData.hospital_verified ? 'bg-success' : 'bg-warning'}`}>
                  {profileData.hospital_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              
              {!(profileData.mobile_verified && profileData.email_verified && profileData.hospital_verified) && (
                <div className="mt-3">
                  <Link to="/receiver/verify" className="btn btn-sm btn-outline-info w-100">
                    <i className="fas fa-check-circle me-2"></i>
                    Complete Verification
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="col-md-8">
          <form onSubmit={handleUpdateProfile}>
            {/* Patient Information Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-user-injured me-2"></i>
                  Patient Information
                </h5>
                <span className="badge bg-light text-primary">Required</span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Patient Full Name *</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="patient_name"
                        value={formData.patient_name}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.patient_name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label">
                      <strong>Patient Age *</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        className="form-control"
                        name="patient_age"
                        value={formData.patient_age}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        required
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.patient_age || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label">
                      <strong>Patient Gender *</strong>
                    </label>
                    {editMode ? (
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
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.patient_gender || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Blood Group Needed *</strong>
                    </label>
                    {editMode ? (
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
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.blood_group_needed ? (
                          <span className="badge bg-danger fs-6">{profileData.blood_group_needed}</span>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Medical Condition</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="medical_condition"
                        value={formData.medical_condition}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.medical_condition || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-address-book me-2"></i>
                  Contact Person Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Contact Person Name *</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.contact_name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Relationship to Patient *</strong>
                    </label>
                    {editMode ? (
                      <select
                        className="form-select"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        required
                      >
                        {relationships.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.relationship || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Mobile Number *</strong>
                    </label>
                    {editMode ? (
                      <div className="input-group">
                        <span className="input-group-text">+92</span>
                        <input
                          type="tel"
                          className="form-control"
                          name="mobile_number"
                          value={formData.mobile_number}
                          onChange={handleChange}
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.mobile_number || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Email Address</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.email || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Alternate Contact</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="alternate_contact"
                        value={formData.alternate_contact}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.alternate_contact || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Alternate Relationship</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="alternate_relationship"
                        value={formData.alternate_relationship}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.alternate_relationship || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Information Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-success text-white">
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
                    {editMode ? (
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
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.hospital_name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>City *</strong>
                    </label>
                    {editMode ? (
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
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.city || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Doctor In-Charge</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="doctor_name"
                        value={formData.doctor_name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.doctor_name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Ward/Room Number</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="ward_room"
                        value={formData.ward_room}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.ward_room || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Urgency Level</strong>
                    </label>
                    {editMode ? (
                      <select
                        className="form-select"
                        name="urgency_level"
                        value={formData.urgency_level}
                        onChange={handleChange}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.urgency_level || 'Normal'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-comment-dots me-2"></i>
                  Communication Preferences
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <div className="form-check">
                      {editMode ? (
                        <>
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
                        </>
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-sms me-2 text-success"></i>
                          <span>SMS Updates: {profileData.communication_sms ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-2">
                    <div className="form-check">
                      {editMode ? (
                        <>
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
                        </>
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-envelope me-2 text-primary"></i>
                          <span>Email Updates: {profileData.communication_email ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-2">
                    <div className="form-check">
                      {editMode ? (
                        <>
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
                            WhatsApp
                          </label>
                        </>
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="fab fa-whatsapp me-2 text-success"></i>
                          <span>WhatsApp: {profileData.communication_whatsapp ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-2">
                    <div className="form-check">
                      {editMode ? (
                        <>
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
                            Phone Calls
                          </label>
                        </>
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-phone me-2 text-info"></i>
                          <span>Phone Calls: {profileData.communication_calls ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Card - FIXED SECTION */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-file-medical me-2"></i>
                  Medical Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      <strong>Previous Transfusions</strong>
                    </label>
                    {editMode ? (
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
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.previous_transfusions || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">
                      <strong>Known Allergies</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="known_allergies"
                        value={formData.known_allergies}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.known_allergies || 'None reported'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">
                      <strong>Current Medications</strong>
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        className="form-control"
                        name="current_medications"
                        value={formData.current_medications}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {profileData.current_medications || 'None reported'}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">
                      <strong>Chronic Conditions</strong>
                    </label>
                    {editMode ? (
                      <div className="row">
                        {['Diabetes', 'Hypertension', 'Heart Disease', 'None'].map(condition => (
                          <div key={condition} className="col-md-3 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="chronic_conditions"
                                id={condition.toLowerCase()}
                                value={condition}
                                checked={formData.chronic_conditions.includes(condition)}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor={condition.toLowerCase()}>
                                {condition}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="form-control-plaintext border-bottom pb-2">
                        {formatChronicConditions(profileData.chronic_conditions)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Update Button (Only in edit mode) */}
            {editMode && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body text-center">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => setEditMode(false)}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiverProfile;