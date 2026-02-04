import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ReceiverDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      fulfilledRequests: 0,
      emergencyRequests: 0
    },
    recentRequests: [],
    upcomingRequirements: [],
    quickStats: {
      donorsAvailable: 0,
      hospitalsNearby: 0,
      lastDonation: 'N/A'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('receiver_token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/receiver/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return badges[urgency] || 'secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      approved: 'primary',
      matched: 'info',
      fulfilled: 'success',
      cancelled: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h3 className="text-primary">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Welcome to Receiver Dashboard
                  </h3>
                  <p className="text-muted mb-0">
                    Track your blood requests, manage emergencies, and find donors quickly.
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <Link to="/receiver/new-request" className="btn btn-danger btn-lg">
                    <i className="fas fa-plus me-2"></i>New Blood Request
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-left-primary border-left-3 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Requests</h6>
                  <h3 className="mb-0">{dashboardData.stats.totalRequests}</h3>
                </div>
                <div className="text-primary">
                  <i className="fas fa-file-medical fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-left-warning border-left-3 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Pending</h6>
                  <h3 className="mb-0">{dashboardData.stats.pendingRequests}</h3>
                </div>
                <div className="text-warning">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-left-info border-left-3 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Approved</h6>
                  <h3 className="mb-0">{dashboardData.stats.approvedRequests}</h3>
                </div>
                <div className="text-info">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-left-success border-left-3 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Fulfilled</h6>
                  <h3 className="mb-0">{dashboardData.stats.fulfilledRequests}</h3>
                </div>
                <div className="text-success">
                  <i className="fas fa-heart fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests & Quick Stats */}
      <div className="row">
        {/* Recent Requests */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>Recent Requests
              </h5>
              <Link to="/receiver/requests" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.recentRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Blood Group</th>
                        <th>Units</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentRequests.map(request => (
                        <tr key={request.id}>
                          <td>#{request.request_id}</td>
                          <td>
                            <span className="badge bg-danger">{request.blood_group}</span>
                          </td>
                          <td>{request.units_needed}</td>
                          <td>
                            <span className={`badge bg-${getUrgencyBadge(request.urgency)}`}>
                              {request.urgency}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>{new Date(request.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link 
                              to={`/receiver/requests/${request.id}`}
                              className="btn btn-sm btn-outline-info"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No requests yet</p>
                  <Link to="/receiver/new-request" className="btn btn-primary">
                    Create Your First Request
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>Quick Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between">
                  <span>Donors Available</span>
                  <span className="badge bg-primary">
                    {dashboardData.quickStats.donorsAvailable}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Hospitals Nearby</span>
                  <span className="badge bg-info">
                    {dashboardData.quickStats.hospitalsNearby}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Last Blood Donation</span>
                  <span>{dashboardData.quickStats.lastDonation}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4">
                <h6 className="mb-3">
                  <i className="fas fa-bolt me-2 text-warning"></i>Quick Actions
                </h6>
                <div className="d-grid gap-2">
                  <Link 
                    to="/receiver/emergency" 
                    className="btn btn-outline-danger"
                  >
                    <i className="fas fa-ambulance me-2"></i>Emergency Request
                  </Link>
                  <Link 
                    to="/receiver/new-request" 
                    className="btn btn-outline-primary"
                  >
                    <i className="fas fa-plus me-2"></i>New Regular Request
                  </Link>
                  <Link 
                    to="/receiver/profile" 
                    className="btn btn-outline-success"
                  >
                    <i className="fas fa-user-edit me-2"></i>Update Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Requirements */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>Upcoming Blood Requirements
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.upcomingRequirements.length > 0 ? (
                <div className="row">
                  {dashboardData.upcomingRequirements.map(req => (
                    <div className="col-md-4 mb-3" key={req.id}>
                      <div className="card border border-warning">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <h6 className="text-warning">
                              <i className="fas fa-calendar-day me-2"></i>
                              {new Date(req.required_by).toLocaleDateString()}
                            </h6>
                            <span className="badge bg-danger">{req.blood_group}</span>
                          </div>
                          <p className="mb-1">
                            <strong>Units:</strong> {req.units_needed}
                          </p>
                          <p className="mb-2 text-muted small">
                            <i className="fas fa-hospital me-1"></i>
                            {req.hospital_name}
                          </p>
                          <div className="d-flex justify-content-between">
                            <span className={`badge bg-${getUrgencyBadge(req.urgency)}`}>
                              {req.urgency}
                            </span>
                            <Link 
                              to={`/receiver/requests/${req.request_id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times fa-2x text-muted mb-3"></i>
                  <p className="text-muted">No upcoming requirements</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;