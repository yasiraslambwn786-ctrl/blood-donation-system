import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { updateDonorProfile } from '../../redux/slices/donorSlice';
import '../../index.css'; // Custom CSS for this page

const EditProfileDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get donor data from Redux store
  const { donor, loading: reduxLoading, error: reduxError } = useSelector((state) => state.donor);
  
  // State for form data
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    gender: 'male',
    blood_type: 'A+',
    date_of_birth: '',
    cnic: '',
  });
  
  // State management
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  
  // City options (Pakistan cities)
  const pakistanCities = [
    'Islamabad', 'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 
    'Gujranwala', 'Peshawar', 'Quetta', 'Bahawalpur', 'Sargodha', 'Sialkot',
    'Bahawalnagar', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Mardan', 'Sahiwal',
    'Okara', 'Wah Cantonment', 'Dera Ghazi Khan', 'Mirpur Khas', 'Chiniot',
    'Kamoke', 'Mingora', 'Sheikhupura', 'Nawabshah', 'Jhang', 'Sukkur'
  ];

  // Fetch donor data on component mount - FIXED VERSION
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setIsLoading(true);
        setApiError('');
        const token = localStorage.getItem('donorToken');
        
        if (!token) {
          navigate('/login-donor');
          return;
        }

        console.log('Fetching donor profile with token:', token.substring(0, 20) + '...');

        // Fetch donor profile from API
        const response = await axios.get('/donor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);

        // Handle different response structures
        let donorData = null;
        
        if (response.data && response.data.success) {
          // Try multiple possible response structures
          donorData = response.data.donor || response.data.data || response.data;
        } else if (response.data) {
          // Maybe success flag is not present but data is
          donorData = response.data;
        }
        
        if (!donorData) {
          console.error('No donor data found in response:', response.data);
          setApiError('Invalid response format from server');
          return;
        }

        console.log('Extracted donor data:', donorData);
        
        // Format date for input field with safety checks
        let formattedDate = '';
        if (donorData.date_of_birth) {
          try {
            formattedDate = new Date(donorData.date_of_birth).toISOString().split('T')[0];
          } catch (dateError) {
            console.error('Error parsing date:', dateError);
          }
        }
        
        // Set form data with fallback values
        setFormData({
          full_name: donorData.full_name || '',
          phone_number: donorData.phone_number || '',
          email: donorData.email || '',
          address: donorData.address || '',
          city: donorData.city || '',
          gender: donorData.gender || 'male',
          blood_type: donorData.blood_type || 'A+',
          date_of_birth: formattedDate,
          cnic: donorData.cnic || '',
        });

        // Set profile image if exists
        if (donorData.profile_image) {
          const imageUrl = `http://127.0.0.1:8000/storage/${donorData.profile_image}`;
          console.log('Setting image URL:', imageUrl);
          setImagePreview(imageUrl);
        } else {
          console.log('No profile image found');
        }
        
      } catch (error) {
        console.error('Error fetching donor profile:', error);
        
        // Detailed error handling
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          
          if (error.response.status === 401) {
            setApiError('Session expired. Please login again.');
            localStorage.removeItem('donorToken');
            setTimeout(() => navigate('/login-donor'), 2000);
          } else {
            setApiError(error.response.data?.message || `Server error (${error.response.status})`);
          }
        } else if (error.request) {
          setApiError('No response from server. Please check your connection.');
        } else {
          setApiError(error.message || 'Failed to load profile data');
        }
        
        // Try to use Redux store data as fallback
        if (donor && donor.full_name) {
          console.log('Using Redux store data as fallback');
          let formattedDate = '';
          if (donor.date_of_birth) {
            try {
              formattedDate = new Date(donor.date_of_birth).toISOString().split('T')[0];
            } catch (dateError) {
              console.error('Error parsing date from Redux:', dateError);
            }
          }
          
          setFormData({
            full_name: donor.full_name || '',
            phone_number: donor.phone_number || '',
            email: donor.email || '',
            address: donor.address || '',
            city: donor.city || '',
            gender: donor.gender || 'male',
            blood_type: donor.blood_type || 'A+',
            date_of_birth: formattedDate,
            cnic: donor.cnic || '',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonorData();
  }, [navigate, donor]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success and API error messages
    if (successMessage) setSuccessMessage('');
    if (apiError) setApiError('');
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          profile_image: 'Please upload a valid image (JPEG, PNG, GIF)'
        }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          profile_image: 'Image size should be less than 2MB'
        }));
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any image errors
      if (formErrors.profile_image) {
        setFormErrors(prev => ({
          ...prev,
          profile_image: ''
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Full Name validation
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'Name must be at least 3 characters';
    }
    
    // Phone Number validation
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^[0-9]{11}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      errors.phone_number = 'Phone number must be 11 digits';
    }
    
    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }
    
    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    // Date of Birth validation
    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear(); // CHANGED: const → let
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        errors.date_of_birth = 'You must be at least 18 years old to donate';
      } else if (age > 65) {
        errors.date_of_birth = 'Maximum age for donation is 65';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setApiError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }
      
      // Get token
      const token = localStorage.getItem('donorToken');
      
      // Send update request
      const response = await axios.post('/donor/update-profile', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        
        // Update Redux store - handle different response structures
        const updatedDonor = response.data.donor || response.data.data || response.data;
        if (updatedDonor) {
          dispatch(updateDonorProfile(updatedDonor));
          
          // Update localStorage
          localStorage.setItem('donorData', JSON.stringify(updatedDonor));
        }
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/donor/profile');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;
        if (backendErrors) {
          const formattedErrors = {};
          Object.keys(backendErrors).forEach(key => {
            formattedErrors[key] = backendErrors[key][0];
          });
          setFormErrors(formattedErrors);
        }
      } else {
        setApiError(
          error.response?.data?.message || 
          error.message || 
          'Failed to update profile. Please try again.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/donor/profile');
  };

  // Calculate age from date of birth
  const calculateAge = (dateString) => {
    if (!dateString) return '';
    try {
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear(); // CHANGED: const → let
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return '';
    }
  };

  // Format CNIC for display
  const formatCNIC = (cnic) => {
    if (!cnic) return '';
    try {
      const cleanCNIC = cnic.replace(/\D/g, '');
      if (cleanCNIC.length === 13) {
        return `${cleanCNIC.substring(0, 5)}-${cleanCNIC.substring(5, 12)}-${cleanCNIC.substring(12)}`;
      }
      return cnic;
    } catch (error) {
      return cnic || '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an API error and form is empty, show error
  if (apiError && !formData.full_name) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">
              <div className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                <div>
                  <h5 className="alert-heading">Unable to Load Profile</h5>
                  <p className="mb-3">{apiError}</p>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Try Again
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/donor/profile')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Profile
                    </button>
                  </div>
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
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Page Header */}
          <div className="mb-4">
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/donor/home-donor" className="text-decoration-none text-muted">
                    <i className="fas fa-home me-1"></i> Dashboard
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/donor/profile" className="text-decoration-none text-muted">
                    <i className="fas fa-user me-1"></i> Profile
                  </a>
                </li>
                <li className="breadcrumb-item active text-primary" aria-current="page">
                  <i className="fas fa-edit me-1"></i> Edit Profile
                </li>
              </ol>
            </nav>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h1 className="h2 fw-bold text-primary mb-2">
                  <i className="fas fa-user-edit me-2"></i>
                  Edit Profile
                </h1>
                <p className="text-muted mb-0">Update your personal information and preferences</p>
              </div>
              <button 
                onClick={handleCancel}
                className="btn btn-outline-secondary"
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle me-3 fs-4"></i>
                <div>
                  <h6 className="alert-heading mb-1">Success!</h6>
                  <p className="mb-0">{successMessage}</p>
                  <small className="text-muted">Redirecting to profile page...</small>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
              ></button>
            </div>
          )}

          {/* Error Messages */}
          {apiError && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                <div>
                  <h6 className="alert-heading mb-1">Note</h6>
                  <p className="mb-0">{apiError}</p>
                  <small className="text-muted">You can still edit your profile below</small>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setApiError('')}
              ></button>
            </div>
          )}

          {/* Profile Image Section */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4 text-center">
                  <div className="position-relative mb-4">
                    <div className="profile-image-wrapper">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="rounded-circle border border-4 border-primary shadow-sm"
                          style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="rounded-circle border border-4 border-primary bg-light d-flex align-items-center justify-content-center shadow-sm mx-auto"
                             style={{ width: '180px', height: '180px' }}>
                          <i className="fas fa-user text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                      )}
                      
                      <label 
                        htmlFor="profileImageUpload"
                        className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle shadow"
                        style={{ width: '45px', height: '45px' }}
                        title="Change profile photo"
                      >
                        <i className="fas fa-camera"></i>
                      </label>
                      <input
                        type="file"
                        id="profileImageUpload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    
                    <div className="mt-3">
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setImagePreview(null);
                          setProfileImage(null);
                        }}
                        disabled={!imagePreview}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Remove Photo
                      </button>
                    </div>
                    
                    {formErrors.profile_image && (
                      <div className="text-danger small mt-2">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {formErrors.profile_image}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-8">
                  <div className="mb-4">
                    <h3 className="mb-2">{formData.full_name || 'Your Name'}</h3>
                    <p className="text-muted mb-3">
                      <i className="fas fa-id-card me-2"></i>
                      <strong>Donor ID:</strong> {donor?.id ? `DON${donor.id.toString().padStart(6, '0')}` : 'Loading...'}
                    </p>
                    
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <p className="mb-1">
                          <i className="fas fa-id-card me-2 text-primary"></i>
                          <strong>CNIC:</strong> {formatCNIC(formData.cnic)}
                        </p>
                      </div>
                      <div className="col-md-6 mb-2">
                        <p className="mb-1">
                          <i className="fas fa-phone me-2 text-primary"></i>
                          <strong>Phone:</strong> {formData.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-3">
                    <span className="badge bg-danger bg-opacity-10 text-danger px-4 py-3 rounded-pill border border-danger">
                      <i className="fas fa-tint me-2"></i>
                      <strong>Blood Type:</strong> {formData.blood_type}
                    </span>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-4 py-3 rounded-pill border border-primary">
                      <i className="fas fa-calendar-alt me-2"></i>
                      <strong>Age:</strong> {calculateAge(formData.date_of_birth) || 'N/A'} years
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success px-4 py-3 rounded-pill border border-success">
                      <i className="fas fa-venus-mars me-2"></i>
                      <strong>Gender:</strong> {formData.gender === 'male' ? 'Male' : formData.gender === 'female' ? 'Female' : 'Other'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Left Column - Personal Information */}
                  <div className="col-lg-6">
                    <div className="mb-4">
                      <h5 className="text-primary mb-3 border-bottom pb-2">
                        <i className="fas fa-user-circle me-2"></i>
                        Personal Information
                      </h5>
                      
                      {/* Full Name */}
                      <div className="mb-3">
                        <label htmlFor="full_name" className="form-label fw-semibold">
                          <i className="fas fa-user text-primary me-2"></i>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${formErrors.full_name ? 'is-invalid' : ''}`}
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                        />
                        {formErrors.full_name && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.full_name}
                          </div>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="mb-3">
                        <label htmlFor="phone_number" className="form-label fw-semibold">
                          <i className="fas fa-phone text-primary me-2"></i>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          className={`form-control form-control-lg ${formErrors.phone_number ? 'is-invalid' : ''}`}
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="03001234567"
                        />
                        {formErrors.phone_number && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.phone_number}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          11 digits without dashes
                        </div>
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="fas fa-envelope text-primary me-2"></i>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-lg ${formErrors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                        />
                        {formErrors.email && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.email}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          Optional - for notifications and recovery
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="mb-3">
                        <label htmlFor="date_of_birth" className="form-label fw-semibold">
                          <i className="fas fa-calendar-alt text-primary me-2"></i>
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          className={`form-control form-control-lg ${formErrors.date_of_birth ? 'is-invalid' : ''}`}
                          id="date_of_birth"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {formErrors.date_of_birth && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.date_of_birth}
                          </div>
                        )}
                        {formData.date_of_birth && (
                          <div className="form-text text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Age: {calculateAge(formData.date_of_birth)} years
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Additional Information */}
                  <div className="col-lg-6">
                    <div className="mb-4">
                      <h5 className="text-primary mb-3 border-bottom pb-2">
                        <i className="fas fa-info-circle me-2"></i>
                        Additional Information
                      </h5>
                      
                      {/* Gender */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-venus-mars text-primary me-2"></i>
                          Gender *
                        </label>
                        <div className="d-flex gap-3">
                          {[
                            { value: 'male', label: 'Male', icon: 'mars' },
                            { value: 'female', label: 'Female', icon: 'venus' },
                            { value: 'other', label: 'Other', icon: 'transgender' }
                          ].map((gender) => (
                            <div className="form-check" key={gender.value}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="gender"
                                id={`gender-${gender.value}`}
                                value={gender.value}
                                checked={formData.gender === gender.value}
                                onChange={handleChange}
                              />
                              <label className="form-check-label d-flex align-items-center" htmlFor={`gender-${gender.value}`}>
                                <i className={`fas fa-${gender.icon} me-2`}></i>
                                {gender.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Blood Type */}
                      <div className="mb-3">
                        <label htmlFor="blood_type" className="form-label fw-semibold">
                          <i className="fas fa-tint text-danger me-2"></i>
                          Blood Type *
                        </label>
                        <select
                          className="form-select form-select-lg"
                          id="blood_type"
                          name="blood_type"
                          value={formData.blood_type}
                          onChange={handleChange}
                        >
                          <option value="">Select Blood Type</option>
                          {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          This information is crucial for emergency blood matching
                        </div>
                      </div>

                      {/* City */}
                      <div className="mb-3">
                        <label htmlFor="city" className="form-label fw-semibold">
                          <i className="fas fa-city text-primary me-2"></i>
                          City *
                        </label>
                        <select
                          className={`form-select form-select-lg ${formErrors.city ? 'is-invalid' : ''}`}
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        >
                          <option value="">Select City</option>
                          {pakistanCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {formErrors.city && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.city}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="mb-4">
                        <label htmlFor="address" className="form-label fw-semibold">
                          <i className="fas fa-map-marker-alt text-primary me-2"></i>
                          Address *
                        </label>
                        <textarea
                          className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Enter your complete address including area, street, house number, etc."
                        />
                        {formErrors.address && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {formErrors.address}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="fas fa-info-circle me-1"></i>
                          This helps hospitals locate you for emergencies
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-3 border-top pt-4">
                      <button
                        type="button"
                        className="btn btn-lg btn-outline-secondary px-5"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-lg btn-primary px-5"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Information Card */}
          <div className="card border-info shadow-sm mt-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <i className="fas fa-info-circle fa-3x text-info"></i>
                </div>
                <div className="col-md-10">
                  <h6 className="text-info mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Important Notes
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Fields marked with * are required
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Accurate information saves lives
                        </li>
                        <li>
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Your data is secure and encrypted
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="fas fa-bell text-warning me-2"></i>
                          You'll be notified for matching requests
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-shield-alt text-primary me-2"></i>
                          Profile verified donors get priority
                        </li>
                        <li>
                          <i className="fas fa-heart text-danger me-2"></i>
                          Each donation can save up to 3 lives
                        </li>
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
  );
};

export default EditProfileDonor;