import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const HomeDonor = () => {
  const navigate = useNavigate();
  const { donor, token } = useSelector((state) => state.donor);
  
  // ✅ CORRECT API ENDPOINTS
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const DASHBOARD_ENDPOINT = `${API_BASE_URL}/donor/dashboard`;
  const ACCEPT_REQUEST_ENDPOINT = `${API_BASE_URL}/blood-requests`;
  const RESPOND_EMERGENCY_ENDPOINT = `${API_BASE_URL}/emergency-requests`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    livesSaved: 0,
    lastDonation: null,
    nextEligible: null
  });
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [quickStats, setQuickStats] = useState({
    pendingRequests: 0,
    confirmedAppointments: 0,
    daysSinceLastDonation: 0
  });
  
  // Get donor data from Redux or localStorage
  const getDonorData = () => {
    if (donor?.id) {
      return { id: donor.id, ...donor };
    }
    
    try {
      const storedDonor = localStorage.getItem('donorData');
      if (storedDonor) {
        return JSON.parse(storedDonor);
      }
    } catch (err) {
      console.log('Error parsing localStorage:', err);
    }
    
    return null;
  };
  
  // ✅ Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('donorToken');
      
      if (!storedToken && !token) {
        console.log('No token found, redirecting to login');
        navigate("/login-donor", { replace: true });
        return false;
      }
      
      return true;
    };
    
    if (checkAuth()) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError('Please login to view your dashboard');
    }
  }, [token, navigate]);
  
  // ✅ Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    const donorData = getDonorData();
    
    if (!donorData?.id) {
      setError('Unable to identify donor. Please login again.');
      setLoading(false);
      return;
    }
    
    console.log('Fetching dashboard data from:', DASHBOARD_ENDPOINT);
    
    try {
      // Get token for authorization
      const authToken = token || localStorage.getItem('donorToken');
      const config = {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      // Single API call for all dashboard data
      const response = await axios.get(DASHBOARD_ENDPOINT, config);
      console.log('Dashboard API response:', response.data);
      
      if (response.data.success) {
        const dashboardData = response.data.data;
        
        // Set stats
        setDonationStats({
          totalDonations: dashboardData.stats?.total_donations || 0,
          livesSaved: dashboardData.stats?.lives_saved || 0,
          lastDonation: dashboardData.stats?.last_donation || null,
          nextEligible: dashboardData.stats?.next_eligible_date || null
        });
        
        // Set matching requests
        setActiveRequests(dashboardData.matching_requests || []);
        
        // Set upcoming appointments
        setUpcomingAppointments(dashboardData.upcoming_appointments || []);
        
        // Set emergency requests
        setEmergencyRequests(dashboardData.emergency_requests || []);
        
        // Calculate quick stats
        const daysSinceLast = dashboardData.stats?.days_since_last_donation || 0;
        
        setQuickStats({
          pendingRequests: (dashboardData.matching_requests || []).filter(req => req.status === 'pending').length,
          confirmedAppointments: (dashboardData.upcoming_appointments || []).length,
          daysSinceLastDonation: daysSinceLast
        });
        
      } else {
        setError(response.data.message || 'Failed to load dashboard data');
        loadEssentialMockData(donorData);
      }
      
    } catch (err) {
      console.error("Dashboard data error:", err);
      
      // Show specific error message
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        localStorage.removeItem('donorToken');
        localStorage.removeItem('donorData');
        navigate('/login-donor');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check backend routes.');
      } else if (err.message === "Network Error") {
        setError('Cannot connect to backend server. Make sure Laravel is running on http://127.0.0.1:8000');
      } else if (err.response?.status === 500) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Server error. Please try again later.';
        setError('Server error: ' + errorMsg);
      } else {
        setError('Failed to load dashboard data: ' + err.message);
      }
      
      // Load minimal mock data for essential functionality
      loadEssentialMockData(donorData);
    } finally {
      setLoading(false);
    }
  };
  
  // Load essential mock data when API fails
  const loadEssentialMockData = (donorData) => {
    const bloodType = donorData?.blood_type || 'O+';
    
    // Essential mock data only
    const mockStats = {
      totalDonations: 0,
      livesSaved: 0,
      lastDonation: null,
      nextEligible: null
    };
    
    const mockRequests = [];
    const mockAppointments = [];
    const mockEmergency = [];
    
    setDonationStats(mockStats);
    setActiveRequests(mockRequests);
    setUpcomingAppointments(mockAppointments);
    setEmergencyRequests(mockEmergency);
    setQuickStats({
      pendingRequests: 0,
      confirmedAppointments: 0,
      daysSinceLastDonation: 0
    });
  };
  
  // Calculate days since last donation
  const calculateDaysSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return 0;
    try {
      const lastDonation = new Date(lastDonationDate);
      const today = new Date();
      const diffTime = today - lastDonation;
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };
  
  // Calculate days until eligible
  const getDaysUntilEligible = () => {
    if (!donationStats.nextEligible) return 0;
    try {
      const today = new Date();
      const eligibleDate = new Date(donationStats.nextEligible);
      
      // If next eligible date is in past, return 0
      if (eligibleDate <= today) return 0;
      
      const diffTime = eligibleDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };
  
  // ✅ Handle Accept Blood Request
  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this blood request?')) {
      return;
    }
    
    const donorData = getDonorData();
    if (!donorData?.id) {
      alert('Please login first');
      return;
    }
    
    try {
      const authToken = token || localStorage.getItem('donorToken');
      const config = {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      // API call to accept request
      const response = await axios.post(
        `${ACCEPT_REQUEST_ENDPOINT}/${requestId}/accept`, 
        {},
        config
      );
      
      if (response.data.success) {
        alert('Request accepted successfully! An appointment will be scheduled.');
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(response.data.message || 'Failed to accept request.');
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      
      if (err.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login-donor');
      } else if (err.response?.status === 404) {
        alert('Request not found or already accepted.');
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to accept request. Please try again.');
      }
    }
  };
  
  // ✅ Handle emergency request
  const handleEmergencyHelp = async (requestId) => {
    if (!window.confirm('Are you available to help with this emergency?')) {
      return;
    }
    
    const donorData = getDonorData();
    if (!donorData?.id) {
      alert('Please login first');
      return;
    }
    
    try {
      const authToken = token || localStorage.getItem('donorToken');
      const config = {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      // API call to respond to emergency
      const response = await axios.post(
        `${RESPOND_EMERGENCY_ENDPOINT}/${requestId}/respond`,
        {},
        config
      );
      
      if (response.data.success) {
        alert('Thank you for responding to the emergency! The hospital will contact you shortly.');
        // Remove from list
        setEmergencyRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        alert(response.data.message || 'Failed to respond to emergency.');
      }
    } catch (err) {
      console.error('Error responding to emergency:', err);
      
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to respond to emergency. Please try again.');
      }
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="donor-dashboard-content">
        <div className="text-center py-5">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your dashboard...</p>
          <small className="text-muted">Fetching data from server...</small>
        </div>
      </div>
    );
  }
  
  // Get donor data for display
  const donorData = getDonorData();
  
  return (
    <div className="donor-dashboard-content">
      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i> Retry
            </button>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}
      
      {/* Welcome Banner */}
      <div className="card border-0 bg-gradient-danger text-white mb-4">
        <div className="card-body py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="mb-2">
                <i className="fas fa-heart me-2"></i>
                Welcome back, {donorData?.full_name?.split(' ')[0] || "Donor"}!
              </h2>
              <p className="mb-0">
                {donorData?.blood_type ? (
                  <>Your blood type is <span className="badge bg-light text-dark fs-6">{donorData.blood_type}</span> </>
                ) : (
                  'Please update your blood type in profile'
                )}
                {donationStats.livesSaved > 0 ? (
                  <>and you have saved <strong>{donationStats.livesSaved} lives</strong> through your donations.</>
                ) : (
                  '. Start your donation journey today!'
                )}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex gap-2 justify-content-md-end">
                <button 
                  className="btn btn-light"
                  onClick={fetchDashboardData}
                  title="Refresh dashboard data"
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                <button 
                  className="btn btn-light btn-lg" 
                  onClick={() => navigate('/donor/appointments-donor')}
                >
                  <i className="fas fa-plus me-2"></i>Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="fas fa-tint text-danger fa-2x"></i>
              </div>
              <h3 className="text-danger mb-1">{donationStats.totalDonations}</h3>
              <h6 className="mb-0">Total Donations</h6>
              <small className="text-muted">Your lifetime donations</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="fas fa-heart text-success fa-2x"></i>
              </div>
              <h3 className="text-success mb-1">{donationStats.livesSaved}</h3>
              <h6 className="mb-0">Lives Saved</h6>
              <small className="text-muted">Through your donations</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="fas fa-calendar-check text-primary fa-2x"></i>
              </div>
              <h3 className="text-primary mb-1">{quickStats.confirmedAppointments}</h3>
              <h6 className="mb-0">Upcoming</h6>
              <small className="text-muted">Scheduled appointments</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="fas fa-clock text-warning fa-2x"></i>
              </div>
              <h3 className="text-warning mb-1">{getDaysUntilEligible()}</h3>
              <h6 className="mb-0">Days to Next</h6>
              <small className="text-muted">Until you can donate again</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="row">
        {/* Left Column: Active Requests & Emergency */}
        <div className="col-lg-8">
          {/* Active Blood Requests */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-bell text-danger me-2"></i>
                Blood Requests Matching Your Type
              </h5>
              <span className="badge bg-danger">{activeRequests.length} requests</span>
            </div>
            <div className="card-body">
              {activeRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Hospital</th>
                        <th>Details</th>
                        <th>Urgency</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRequests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <div className="fw-bold">{request.hospital_name || 'Hospital'}</div>
                            <small className="text-muted">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {request.distance_km || 'N/A'} km away
                            </small>
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <span className="badge bg-danger">{request.units_needed || 1} unit(s)</span>
                              </div>
                              <div className="text-muted">
                                Deadline: {formatDate(request.required_date)}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${(request.urgency === 'High' || request.urgency === 'Critical') ? 'bg-danger' : 'bg-warning'}`}>
                              <i className="fas fa-exclamation-circle me-1"></i>
                              {request.urgency || 'Medium'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={request.status === 'accepted'}
                            >
                              {request.status === 'accepted' ? (
                                <>
                                  <i className="fas fa-check me-1"></i> Accepted
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check me-1"></i> Accept
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
                  <h5>No Matching Requests</h5>
                  <p className="text-muted">
                    There are no active blood requests matching your blood type at the moment.
                  </p>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={fetchDashboardData}
                    disabled={loading}
                  >
                    <i className="fas fa-sync-alt me-1"></i> Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Emergency Requests */}
          {emergencyRequests.length > 0 && (
            <div className="card border-0 shadow-sm border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="fas fa-ambulance me-2"></i>
                  Emergency Blood Requests
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Urgent:</strong> These patients need immediate help
                </div>
                
                <div className="row">
                  {emergencyRequests.map(emergency => (
                    <div key={emergency.id} className="col-md-6 mb-3">
                      <div className="card border-danger">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              <i className="fas fa-user-injured me-2"></i>
                              {emergency.patient_name || 'Emergency Case'}
                            </h6>
                            <span className="badge bg-danger">CRITICAL</span>
                          </div>
                          <p className="mb-2">
                            <strong>Blood Type:</strong>{' '}
                            <span className="badge bg-dark">{emergency.blood_type}</span>
                          </p>
                          <p className="mb-2">
                            <strong>Hospital:</strong> {emergency.hospital || emergency.hospital_name}
                          </p>
                          <p className="mb-3 text-danger small">
                            <i className="fas fa-clock me-1"></i>
                            {emergency.time_ago || 'Recently'}
                          </p>
                          <button 
                            className="btn btn-danger btn-sm w-100"
                            onClick={() => handleEmergencyHelp(emergency.id)}
                          >
                            <i className="fas fa-handshake me-1"></i> I Can Help
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Appointments & Quick Actions */}
        <div className="col-lg-4">
          {/* Upcoming Appointments */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt text-primary me-2"></i>
                Your Appointments
              </h5>
              <Link to="/donor/appointments-donor" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="border-start border-primary border-3 ps-3 mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="mb-0">Blood Donation</h6>
                      <span className={`badge bg-${appointment.status === 'confirmed' ? 'success' : 'primary'}`}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Scheduled'}
                      </span>
                    </div>
                    <p className="mb-2">
                      <i className="far fa-calendar me-1"></i>
                      {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                    </p>
                    <p className="mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {appointment.location || 'Blood Donation Center'}
                    </p>
                    {appointment.preparation_notes && (
                      <div className="alert alert-light p-2 small mb-2">
                        <i className="fas fa-info-circle text-info me-1"></i>
                        {appointment.preparation_notes}
                      </div>
                    )}
                    <div className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-primary">
                        <i className="fas fa-edit me-1"></i> Reschedule
                      </button>
                      <button className="btn btn-outline-danger">
                        <i className="fas fa-times me-1"></i> Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="far fa-calendar text-muted fa-3x mb-3"></i>
                  <h6>No Upcoming Appointments</h6>
                  <p className="text-muted">Schedule your next donation appointment</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/donor/appointments-donor')}
                  >
                    <i className="fas fa-calendar-plus me-1"></i> Schedule Now
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-bolt text-warning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => navigate('/donor/appointments-donor')}
                >
                  <i className="fas fa-calendar-plus me-2"></i> Schedule Donation
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/donor/donation-history')}
                >
                  <i className="fas fa-history me-2"></i> View Donation History
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => navigate('/donor/profile-donor')}
                >
                  <i className="fas fa-user me-2"></i> Update Profile
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => navigate('/emergency-request')}
                >
                  <i className="fas fa-ambulance me-2"></i> Emergency Request
                </button>
              </div>
              
              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">Your Donation Status</h6>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Last Donation</small>
                    <small className={quickStats.daysSinceLastDonation >= 56 ? 'text-success' : 'text-warning'}>
                      {quickStats.daysSinceLastDonation > 0 ? `${quickStats.daysSinceLastDonation} days ago` : 'Never'}
                    </small>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ 
                        width: `${Math.min((quickStats.daysSinceLastDonation / 56) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <small className="text-muted d-block mt-1">
                    {quickStats.daysSinceLastDonation >= 56 
                      ? '✅ You are eligible to donate again!' 
                      : quickStats.daysSinceLastDonation > 0
                      ? `⏳ ${56 - quickStats.daysSinceLastDonation} more days until eligible`
                      : '🎯 You can donate anytime!'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation Goals & Motivation */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                <i className="fas fa-bullseye me-2"></i>Your Donation Goals
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="display-6 text-danger">{donationStats.totalDonations}</div>
                    <small className="text-muted">Current Donations</small>
                    <div className="progress mt-2" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${Math.min((donationStats.totalDonations / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <small>Goal: 10 donations</small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="display-6 text-success">{donationStats.livesSaved}</div>
                    <small className="text-muted">Lives Impacted</small>
                    <div className="progress mt-2" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${Math.min((donationStats.livesSaved / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <small>Goal: 30 lives saved</small>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="display-6 text-primary">
                      {getDaysUntilEligible() <= 0 ? 'Now!' : getDaysUntilEligible()}
                    </div>
                    <small className="text-muted">
                      {getDaysUntilEligible() <= 0 ? 'Ready to donate' : 'Days until next donation'}
                    </small>
                    <div className="mt-3">
                      <button 
                        className="btn btn-primary"
                        disabled={getDaysUntilEligible() > 0}
                        onClick={() => navigate('/donor/appointments-donor')}
                      >
                        {getDaysUntilEligible() <= 0 
                          ? 'Schedule Next Donation' 
                          : `Eligible in ${getDaysUntilEligible()} days`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  <i className="fas fa-quote-left me-2 text-primary"></i>
                  Your blood donation can save up to 3 lives. Thank you for being a hero!
                  <i className="fas fa-quote-right ms-2 text-primary"></i>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDonor;