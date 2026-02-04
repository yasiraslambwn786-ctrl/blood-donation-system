import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { splash1 } from "../../assets/img";
import { fetchDonorProfile } from "../../redux/slices/donorSlice";

const ProfileDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { donor, token } = useSelector((state) => state.donor);
  const [donorData, setDonorData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const storedToken = localStorage.getItem('donorToken');

  // Fetch donor data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get token from localStorage or Redux
        const authToken = token || storedToken;
        
        if (!authToken) {
          navigate("/login-donor");
          return;
        }

        // Fetch donor profile
        const profileResponse = await axios.get('/donor/profile', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (profileResponse.data.success) {
          setDonorData(profileResponse.data.donor);
          
          // Update Redux store if needed
          if (!donor) {
            dispatch(fetchDonorProfile());
          }
          
          // Fetch stats if available
          try {
            const statsResponse = await axios.get('/donor/stats', {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            
            if (statsResponse.data.success) {
              setStats(statsResponse.data.data);
            }
          } catch (statsError) {
            console.log("Stats endpoint not available, using default stats");
            setStats({
              totalDonations: donorData?.total_donations || 0,
              livesSaved: (donorData?.total_donations || 0) * 3,
              lastDonation: donorData?.last_donation_date || null,
              status: donorData?.status || "Active",
              bloodType: donorData?.blood_type || "Not Set"
            });
          }
        } else {
          throw new Error(profileResponse.data.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || error.message || "Failed to load profile");
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('donorToken');
          localStorage.removeItem('donorData');
          navigate("/login-donor");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [dispatch, navigate, token, storedToken, donor]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCNIC = (cnic) => {
    if (!cnic) return "—";
    const cleanCNIC = cnic.replace(/\D/g, '');
    if (cleanCNIC.length === 13) {
      return `${cleanCNIC.substring(0, 5)}-${cleanCNIC.substring(5, 12)}-${cleanCNIC.substring(12)}`;
    }
    return cnic;
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'active': 'success',
      'pending': 'warning',
      'inactive': 'secondary',
      'blocked': 'danger'
    };
    
    const color = statusColors[status?.toLowerCase()] || 'secondary';
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    
    return (
      <span className={`badge bg-${color} fs-6 px-3 py-2`}>
        {label}
      </span>
    );
  };

  // Use donor data from state or Redux
  const profile = donorData || donor;

  return (
    <div>
      {/* Loading State */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fs-5">Loading your profile...</p>
          </div>
        </div>
      ) : error ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-4x text-danger mb-4"></i>
            <h3 className="text-danger mb-3">Oops! Something went wrong</h3>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-redo me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      ) : !profile ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <i className="fas fa-user-slash fa-4x text-muted mb-4"></i>
            <h3 className="text-muted mb-3">No Profile Found</h3>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/login-donor")}
            >
              <i className="fas fa-sign-in-alt me-2"></i>
              Login Again
            </button>
          </div>
        </div>
      ) : (
        <div className="container py-4">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="h2 fw-bold text-danger mb-2">
              <i className="fas fa-user-circle me-2"></i>
              My Profile
            </h1>
            <p className="text-muted">
              Welcome back, {profile.full_name}! Here's your complete donor profile.
            </p>
          </div>

          <div className="row">
            {/* Left: Profile Card */}
            <div className="col-lg-4 mb-4">
              <div className="card text-center p-4 shadow-sm border-0 h-100">
                <div className="position-relative d-inline-block mb-4">
                  <img
                    src={profile.profile_image_url || splash1}
                    alt="Profile"
                    className="rounded-circle img-fluid border-4 border-danger"
                    style={{ 
                      width: "180px", 
                      height: "180px", 
                      objectFit: "cover" 
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = splash1;
                    }}
                  />
                  <div className="position-absolute bottom-0 end-0 bg-danger rounded-circle p-2 shadow">
                    <i className="fas fa-heart text-white"></i>
                  </div>
                </div>
                
                <h3 className="mb-3">{profile.full_name}</h3>
                
                <div className="mb-4">
                  <span className="badge bg-danger fs-6 px-4 py-3 rounded-pill">
                    <i className="fas fa-tint me-2"></i>
                    {profile.blood_type || "Blood Type Not Set"}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i className="fas fa-id-card text-muted me-3"></i>
                    <span className="text-muted">CNIC: {formatCNIC(profile.cnic)}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-map-marker-alt text-muted me-3"></i>
                    <span className="text-muted">
                      {profile.city || "City not specified"}
                    </span>
                  </div>
                </div>

                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-danger btn-lg"
                    onClick={() => navigate("/donor/edit-profile-donor")}
                  >
                    <i className="fas fa-edit me-2"></i>Edit Profile
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-lg"
                    onClick={() => navigate("/donor/donation-history")}
                  >
                    <i className="fas fa-history me-2"></i>Donation History
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => navigate("/donor/request-blood")}
                  >
                    <i className="fas fa-hand-holding-heart me-2"></i>Request Blood
                  </button>
                </div>

                {/* Quick Info */}
                <div className="mt-5 pt-4 border-top">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Quick Info
                  </h5>
                  <div className="row text-start">
                    <div className="col-6 mb-2">
                      <small className="text-muted">Donor ID</small>
                      <p className="fw-bold mb-0">DON{profile.id?.toString().padStart(6, '0') || '000000'}</p>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted">Status</small>
                      {getStatusBadge(profile.status)}
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted">Age</small>
                      <p className="fw-bold mb-0">{calculateAge(profile.date_of_birth) || "—"} years</p>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted">Registered</small>
                      <p className="fw-bold mb-0">{formatDate(profile.registration_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="col-lg-8">
              <div className="card p-4 shadow-sm border-0 h-100">
                {/* Personal Information Section */}
                <div className="mb-5">
                  <h3 className="mb-4 text-primary border-bottom pb-3">
                    <i className="fas fa-user-circle me-2"></i>
                    Personal Information
                  </h3>
                  
                  <div className="row">
                    {/* Full Name */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-user text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Full Name</h6>
                          <p className="fw-bold fs-5 mb-0">{profile.full_name || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* CNIC */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-id-card text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">CNIC</h6>
                          <p className="fw-bold fs-5 mb-0">{formatCNIC(profile.cnic)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-envelope text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Email Address</h6>
                          <p className="fw-bold fs-5 mb-0">{profile.email || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-phone text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Phone Number</h6>
                          <p className="fw-bold fs-5 mb-0">{profile.phone_number || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-venus-mars text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Gender</h6>
                          <p className="fw-bold fs-5 mb-0">
                            {profile.gender === 'male' ? 'Male' : 
                             profile.gender === 'female' ? 'Female' : 
                             profile.gender || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-birthday-cake text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Date of Birth</h6>
                          <p className="fw-bold fs-5 mb-0">{formatDate(profile.date_of_birth)}</p>
                          {calculateAge(profile.date_of_birth) && (
                            <small className="text-success">
                              <i className="fas fa-check-circle me-1"></i>
                              {calculateAge(profile.date_of_birth)} years old
                            </small>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Blood Type */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-tint text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Blood Type</h6>
                          <p className="fw-bold fs-5 mb-0">{profile.blood_type || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* City */}
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-3 rounded-circle me-3">
                          <i className="fas fa-city text-danger fa-lg"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">City</h6>
                          <p className="fw-bold fs-5 mb-0">{profile.city || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <div className="d-flex align-items-start">
                      <div className="bg-light p-3 rounded-circle me-3 mt-1">
                        <i className="fas fa-map-marker-alt text-danger fa-lg"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="text-muted mb-2">Address</h6>
                        <p className="fw-bold fs-5 mb-0">{profile.address || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="mt-5 pt-4 border-top">
                  <h3 className="mb-4 text-primary">
                    <i className="fas fa-chart-line me-2"></i>
                    Donation Statistics
                  </h3>
                  
                  <div className="row">
                    <div className="col-md-3 col-6 mb-4">
                      <div className="card bg-danger bg-opacity-10 border-danger border-2 text-center p-4 h-100">
                        <div className="mb-3">
                          <i className="fas fa-tint fa-2x text-danger"></i>
                        </div>
                        <h2 className="text-danger mb-2">
                          {stats?.totalDonations || profile.total_donations || 0}
                        </h2>
                        <p className="text-muted mb-0">Total Donations</p>
                        <small className="text-success">
                          <i className="fas fa-arrow-up me-1"></i>
                          Registered donor
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-md-3 col-6 mb-4">
                      <div className="card bg-primary bg-opacity-10 border-primary border-2 text-center p-4 h-100">
                        <div className="mb-3">
                          <i className="fas fa-heart fa-2x text-primary"></i>
                        </div>
                        <h2 className="text-primary mb-2">
                          {stats?.livesSaved || ((profile.total_donations || 0) * 3)}
                        </h2>
                        <p className="text-muted mb-0">Lives Saved</p>
                        <small className="text-success">
                          <i className="fas fa-star me-1"></i>
                          Real hero!
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-md-3 col-6 mb-4">
                      <div className="card bg-success bg-opacity-10 border-success border-2 text-center p-4 h-100">
                        <div className="mb-3">
                          <i className="fas fa-calendar-check fa-2x text-success"></i>
                        </div>
                        <h2 className="text-success mb-2">
                          {stats?.lastDonation ? "Yes" : "—"}
                        </h2>
                        <p className="text-muted mb-0">Last Donation</p>
                        <small className="text-muted">
                          {formatDate(stats?.lastDonation || profile.last_donation_date)}
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-md-3 col-6 mb-4">
                      <div className="card bg-warning bg-opacity-10 border-warning border-2 text-center p-4 h-100">
                        <div className="mb-3">
                          <i className="fas fa-bolt fa-2x text-warning"></i>
                        </div>
                        <h2 className="text-warning mb-2">
                          {profile.status ? "Active" : "—"}
                        </h2>
                        <p className="text-muted mb-0">Status</p>
                        <small className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Ready to donate
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Bottom Section */}
                <div className="mt-5 pt-4 border-top">
                  <h3 className="mb-4 text-primary">
                    <i className="fas fa-rocket me-2"></i>
                    Quick Actions
                  </h3>
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <button 
                        className="btn btn-outline-danger w-100 py-3"
                        onClick={() => navigate("/donor/schedule-appointment")}
                      >
                        <i className="fas fa-calendar-plus me-2"></i>
                        Schedule Donation
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button 
                        className="btn btn-outline-primary w-100 py-3"
                        onClick={() => navigate("/donor/emergency-contacts")}
                      >
                        <i className="fas fa-phone-alt me-2"></i>
                        Emergency Contacts
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button 
                        className="btn btn-outline-success w-100 py-3"
                        onClick={() => navigate("/donor/achievements")}
                      >
                        <i className="fas fa-trophy me-2"></i>
                        View Achievements
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDonor;