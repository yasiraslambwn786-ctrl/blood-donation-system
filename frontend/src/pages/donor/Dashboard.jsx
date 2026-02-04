// FILE: src/pages/donor/HomeDonor.jsx - DASHBOARD CONTENT
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

const HomeDonor = () => {
  const navigate = useNavigate();
  const [donorStats, setDonorStats] = useState({
    totalDonations: 0,
    livesSaved: 0,
    lastDonation: null,
    upcomingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch donor stats
  useEffect(() => {
    const fetchDonorStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('donorToken');
        
        if (!token) {
          setDonorStats({
            totalDonations: 0,
            livesSaved: 0,
            lastDonation: null,
            upcomingAppointments: 0
          });
          setLoading(false);
          return;
        }
        
        try {
          const response = await axios.get('/donor/stats', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.data.success) {
            setDonorStats(response.data.data);
          }
        } catch (statsError) {
          console.log("Stats API failed, using defaults");
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching donor stats:", err);
        setLoading(false);
      }
    };

    fetchDonorStats();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get donor data from localStorage
  const donorData = JSON.parse(localStorage.getItem('donorData')) || {};

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}>
            <div className="card-body text-white">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="display-6 fw-bold">🎉 Welcome Back, {donorData.full_name?.split(' ')[0] || 'Donor'}!</h1>
                  <p className="mb-0">Thank you for being a life-saver. Your contributions make a difference.</p>
                </div>
                <div className="col-md-4 text-end">
                  <span className="badge bg-light text-dark fs-5 px-4 py-2">
                    <i className="fas fa-tint me-2"></i>
                    {donorData.blood_type || 'Blood Type'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-heartbeat fa-2x text-primary"></i>
              </div>
              <h2 className="fw-bold text-primary">{donorStats.totalDonations}</h2>
              <h6 className="text-muted">Total Donations</h6>
              <p className="small text-muted mb-0">Lifetime donations made</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-life-ring fa-2x text-success"></i>
              </div>
              <h2 className="fw-bold text-success">{donorStats.livesSaved}</h2>
              <h6 className="text-muted">Lives Saved</h6>
              <p className="small text-muted mb-0">People you've helped</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-calendar-check fa-2x text-warning"></i>
              </div>
              <h2 className="fw-bold text-warning">{donorStats.upcomingAppointments}</h2>
              <h6 className="text-muted">Upcoming Appointments</h6>
              <p className="small text-muted mb-0">Scheduled donations</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-history fa-2x text-info"></i>
              </div>
              <h6 className="text-muted">Last Donation</h6>
              <h5 className="fw-bold text-dark">{formatDate(donorStats.lastDonation)}</h5>
              <p className="small text-muted mb-0">Most recent donation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="fas fa-bolt me-2 text-warning"></i>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <button className="btn btn-outline-primary w-100 h-100 py-3" onClick={() => navigate("/donor/appointments-donor")}>
                    <i className="fas fa-calendar-plus fa-2x mb-2"></i><br/>
                    Book Appointment
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button className="btn btn-outline-success w-100 h-100 py-3" onClick={() => navigate("/donor/find-donors")}>
                    <i className="fas fa-search fa-2x mb-2"></i><br/>
                    Find Donors
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button className="btn btn-outline-info w-100 h-100 py-3" onClick={() => navigate("/donor/donation-history")}>
                    <i className="fas fa-history fa-2x mb-2"></i><br/>
                    Donation History
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button className="btn btn-outline-warning w-100 h-100 py-3" onClick={() => navigate("/donor/profile-donor")}>
                    <i className="fas fa-user fa-2x mb-2"></i><br/>
                    My Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Blood Info */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="fas fa-chart-line me-2 text-primary"></i>Your Impact</h5>
            </div>
            <div className="card-body">
              <p>Your blood type <strong>{donorData.blood_type}</strong> is one of the most needed types.</p>
              <div className="progress mb-3" style={{ height: '25px' }}>
                <div className="progress-bar bg-danger" style={{ width: '75%' }}>75% Needed</div>
              </div>
              <p>Next eligible donation date: <strong>In 2 weeks</strong></p>
              <p>Your contributions are helping hospitals in your area save lives every day.</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="fas fa-info-circle me-2 text-info"></i>Quick Info</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Last donation: {formatDate(donorStats.lastDonation)}</li>
                <li className="mb-2"><i className="fas fa-user text-primary me-2"></i>Donor ID: {donorData.id || 'N/A'}</li>
                <li className="mb-2"><i className="fas fa-phone text-warning me-2"></i>Phone: {donorData.phone_number || 'N/A'}</li>
                <li className="mb-2"><i className="fas fa-map-marker-alt text-danger me-2"></i>Location: {donorData.city || 'N/A'}</li>
              </ul>
              <button className="btn btn-sm btn-outline-primary w-100 mt-2" onClick={() => navigate("/donor/edit-profile-donor")}>
                <i className="fas fa-edit me-1"></i> Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDonor;