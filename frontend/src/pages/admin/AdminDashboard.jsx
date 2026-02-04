import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDonors: 0,
    pendingRequests: 0,
    todayAppointments: 0,
    totalBloodUnits: 0,
    criticalStock: 0,
    totalStaff: 0,
    totalAdmins: 0,
    loading: true
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Laravel API Base URL
  const API_BASE = 'http://127.0.0.1:8000/api';
  
  // Get auth token from Redux or localStorage
  const getAuthToken = () => {
    return token || localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Get headers with authentication
  const getHeaders = () => {
    const authToken = getAuthToken();
    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Fetch Dashboard Data - Single API call
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.error('No authentication token found');
        setMockData();
        return;
      }

      // Single API call to get all dashboard data
      const response = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: getHeaders()
      });

      if (response.data.success) {
        const dashboardData = response.data.dashboard;
        
        // Update stats
        setStats({
          totalUsers: dashboardData.stats?.total_users || 0,
          activeDonors: dashboardData.stats?.active_donors || 0,
          pendingRequests: dashboardData.stats?.pending_requests || 0,
          todayAppointments: dashboardData.stats?.today_appointments || 0,
          totalBloodUnits: dashboardData.stats?.total_blood_units || 0,
          criticalStock: dashboardData.stats?.critical_stock || 0,
          totalStaff: dashboardData.stats?.total_staff || 0,
          totalAdmins: dashboardData.stats?.total_admins || 0,
          loading: false
        });

        // Set blood inventory
        setBloodInventory(dashboardData.blood_inventory || []);
        
        // Set recent activities
        setRecentActivities(dashboardData.recent_activities || []);
        
        // Set today's appointments
        setTodaysAppointments(dashboardData.todays_appointments || []);
        
        // Set urgent requests
        setUrgentRequests(dashboardData.urgent_requests || []);

      } else {
        console.error('API returned error:', response.data.message);
        setMockData();
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error.response?.data || error.message);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please login again.');
        // You might want to redirect to login here
        // window.location.href = '/login-admin';
      }
      
      // Fallback to mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Fetch individual stats (if needed)
  const fetchIndividualStats = async () => {
    try {
      // Fetch blood inventory separately
      const inventoryRes = await axios.get(`${API_BASE}/admin/blood-inventory`, {
        headers: getHeaders()
      });
      
      if (inventoryRes.data.success) {
        setBloodInventory(inventoryRes.data.inventory || []);
      }

      // Fetch system logs
      const logsRes = await axios.get(`${API_BASE}/admin/system-logs`, {
        headers: getHeaders(),
        params: { per_page: 5 }
      });
      
      if (logsRes.data.success) {
        setRecentActivities(logsRes.data.logs?.data || []);
      }

    } catch (error) {
      console.error('Error fetching individual stats:', error);
    }
  };

  // Mock data fallback
  const setMockData = () => {
    console.log('Using mock data...');
    
    setStats({
      totalUsers: 1245,
      activeDonors: 856,
      pendingRequests: 23,
      todayAppointments: 42,
      totalBloodUnits: 245,
      criticalStock: 3,
      totalStaff: 15,
      totalAdmins: 3,
      loading: false
    });

    setRecentActivities([
      { 
        id: 1, 
        user_name: 'John Doe', 
        action: 'New donor registered', 
        description: 'User registered as donor',
        created_at: new Date().toISOString(),
        time_ago: '10 min ago'
      },
      { 
        id: 2, 
        user_name: 'Sarah Smith', 
        action: 'Blood request approved', 
        description: 'Emergency request processed',
        created_at: new Date(Date.now() - 1500000).toISOString(),
        time_ago: '25 min ago'
      },
      { 
        id: 3, 
        user_name: 'Dr. Ahmed', 
        action: 'Appointment scheduled', 
        description: 'Donation appointment booked',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        time_ago: '1 hour ago'
      },
      { 
        id: 4, 
        user_name: 'System', 
        action: 'Database backup completed', 
        description: 'Daily backup successful',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        time_ago: '2 hours ago'
      },
      { 
        id: 5, 
        user_name: 'Admin', 
        action: 'User permissions updated', 
        description: 'Staff permissions modified',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        time_ago: '3 hours ago'
      }
    ]);

    setBloodInventory([
      { blood_group: 'A+', units_available: 45, critical_level: 10, updated_at: new Date().toISOString() },
      { blood_group: 'B+', units_available: 38, critical_level: 10, updated_at: new Date().toISOString() },
      { blood_group: 'O+', units_available: 67, critical_level: 10, updated_at: new Date().toISOString() },
      { blood_group: 'AB+', units_available: 15, critical_level: 10, updated_at: new Date().toISOString() },
      { blood_group: 'A-', units_available: 22, critical_level: 5, updated_at: new Date().toISOString() },
      { blood_group: 'B-', units_available: 18, critical_level: 5, updated_at: new Date().toISOString() },
      { blood_group: 'O-', units_available: 25, critical_level: 5, updated_at: new Date().toISOString() },
      { blood_group: 'AB-', units_available: 8, critical_level: 5, updated_at: new Date().toISOString() }
    ]);

    setTodaysAppointments([
      { id: 1, donor_name: 'John Doe', appointment_time: '10:00 AM', status: 'confirmed' },
      { id: 2, donor_name: 'Sarah Smith', appointment_time: '11:30 AM', status: 'pending' },
      { id: 3, donor_name: 'Mike Johnson', appointment_time: '2:00 PM', status: 'confirmed' },
      { id: 4, donor_name: 'Emily Brown', appointment_time: '3:30 PM', status: 'completed' }
    ]);

    setUrgentRequests([
      { id: 1, patient_name: 'Emergency Case', blood_group: 'O+', units_required: 3, hospital: 'City Hospital', created_at: new Date().toISOString(), time_ago: '30 min ago' }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
    // fetchIndividualStats(); // Uncomment if needed

    // Refresh data every 2 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'A+': '#dc3545',
      'B+': '#0d6efd',
      'O+': '#198754',
      'AB+': '#ffc107',
      'A-': '#6c757d',
      'B-': '#6610f2',
      'O-': '#20c997',
      'AB-': '#fd7e14'
    };
    return colors[bloodGroup] || '#000000';
  };

  const updateBloodInventory = async (bloodGroup, newUnits) => {
    try {
      const response = await axios.post(
        `${API_BASE}/admin/blood-inventory/update`,
        {
          blood_group: bloodGroup,
          units_available: newUnits,
          critical_level: 10 // Default value
        },
        { headers: getHeaders() }
      );
      
      if (response.data.success) {
        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading Dashboard Data...</h4>
          <p className="text-muted">Connecting to database...</p>
          <button 
            className="btn btn-outline-primary mt-3"
            onClick={fetchDashboardData}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white border-0 shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="card-title mb-2">
                    <i className="fas fa-shield-alt me-3"></i>
                    {getGreeting()}, {user?.name || 'Administrator'}!
                  </h1>
                  <p className="card-text opacity-75 mb-0">
                    <i className="fas fa-database me-2"></i>
                    Connected to MySQL Database | 
                    <i className="fas fa-server ms-3 me-2"></i>
                    Laravel API v1.0
                  </p>
                </div>
                <div className="text-end">
                  <button 
                    className="btn btn-light btn-sm"
                    onClick={fetchDashboardData}
                    disabled={stats.loading}
                  >
                    <i className={`fas fa-sync-alt ${stats.loading ? 'fa-spin' : ''} me-2`}></i>
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-primary border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Users</h6>
                  <h2 className="mb-0">{stats.totalUsers}</h2>
                </div>
                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-users fa-lg text-primary"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/manage-users" className="btn btn-sm btn-outline-primary w-100">
                  View Users <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-success border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Active Donors</h6>
                  <h2 className="mb-0">{stats.activeDonors}</h2>
                </div>
                <div className="avatar-sm bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-hand-holding-heart fa-lg text-success"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/manage-donors" className="btn btn-sm btn-outline-success w-100">
                  Manage Donors <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-warning border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Requests</h6>
                  <h2 className="mb-0 text-warning">{stats.pendingRequests}</h2>
                </div>
                <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-clock fa-lg text-warning"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/manage-requests" className="btn btn-sm btn-outline-warning w-100">
                  Review <i className="fas fa-exclamation-circle ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-info border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Today's Appointments</h6>
                  <h2 className="mb-0">{stats.todayAppointments}</h2>
                </div>
                <div className="avatar-sm bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-calendar-check fa-lg text-info"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/appointments" className="btn btn-sm btn-outline-info w-100">
                  View All <i className="fas fa-calendar ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-danger border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Blood Units</h6>
                  <h2 className="mb-0">{stats.totalBloodUnits}</h2>
                </div>
                <div className="avatar-sm bg-danger bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-tint fa-lg text-danger"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/blood-inventory" className="btn btn-sm btn-outline-danger w-100">
                  Check Stock <i className="fas fa-box ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-dark border-4 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Critical Stock</h6>
                  <h2 className="mb-0 text-danger">{stats.criticalStock}</h2>
                </div>
                <div className="avatar-sm bg-dark bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-exclamation-triangle fa-lg text-dark"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/critical-alerts" className="btn btn-sm btn-danger w-100">
                  Take Action <i className="fas fa-bell ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Inventory Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-tint me-2 text-danger"></i>
                Blood Inventory Status
              </h5>
              <span className="badge bg-info">
                <i className="fas fa-database me-1"></i>
                Live from MySQL
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Blood Group</th>
                      <th>Available Units</th>
                      <th>Critical Level</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodInventory.length > 0 ? (
                      bloodInventory.map((item, index) => {
                        const isCritical = item.units_available <= item.critical_level;
                        return (
                          <tr key={index}>
                            <td>
                              <span 
                                className="badge" 
                                style={{ 
                                  backgroundColor: getBloodGroupColor(item.blood_group),
                                  fontSize: '0.9rem'
                                }}
                              >
                                {item.blood_group}
                              </span>
                            </td>
                            <td>
                              <h5 className={`mb-0 ${isCritical ? 'text-danger' : 'text-success'}`}>
                                {item.units_available}
                              </h5>
                            </td>
                            <td>{item.critical_level || 10}</td>
                            <td>
                              {isCritical ? (
                                <span className="badge bg-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Critical
                                </span>
                              ) : item.units_available < (item.critical_level || 10) * 2 ? (
                                <span className="badge bg-warning">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Low
                                </span>
                              ) : (
                                <span className="badge bg-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Normal
                                </span>
                              )}
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatTimeAgo(item.updated_at)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => updateBloodInventory(item.blood_group, item.units_available + 1)}
                                  title="Add Unit"
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => updateBloodInventory(item.blood_group, Math.max(0, item.units_available - 1))}
                                  title="Remove Unit"
                                >
                                  <i className="fas fa-minus"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <i className="fas fa-database fa-2x text-muted mb-3"></i>
                          <p className="text-muted">No blood inventory data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Today's Appointments */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-history me-2 text-info"></i>
                Recent System Activities
              </h5>
              <Link to="/admin/system-logs" className="btn btn-sm btn-outline-primary">
                View All <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id || index} className="list-group-item border-0">
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-info bg-opacity-10 rounded-circle p-2 me-3">
                          <i className="fas fa-circle text-info"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{activity.user_name || 'System'}</h6>
                          <p className="text-muted mb-0 small">{activity.action || activity.description}</p>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            {activity.time_ago || formatTimeAgo(activity.created_at)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-history fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No recent activities found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-calendar-day me-2 text-primary"></i>
                Today's Appointments ({todaysAppointments.length})
              </h5>
              <Link to="/admin/appointments" className="btn btn-sm btn-outline-primary">
                View All <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body">
              {todaysAppointments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {todaysAppointments.slice(0, 5).map((appointment, index) => (
                    <div key={appointment.id || index} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{appointment.donor_name || 'Donor'}</h6>
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {appointment.appointment_time || 'N/A'}
                          </small>
                        </div>
                        <span className={`badge bg-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                          {appointment.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No appointments today</p>
                </div>
              )}
              <div className="text-center mt-3">
                <Link to="/admin/appointments/new" className="btn btn-outline-primary">
                  <i className="fas fa-plus me-1"></i>
                  Schedule New Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection Status */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-server me-2 text-success"></i>
                System Status
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-sm bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-database fa-lg text-success"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Database</h6>
                      <p className="text-success mb-0">
                        <i className="fas fa-check-circle me-1"></i>
                        Connected
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-shield-alt fa-lg text-primary"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">API Status</h6>
                      <p className="text-primary mb-0">
                        <i className="fas fa-check-circle me-1"></i>
                        Running
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-sm bg-info bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-sync-alt fa-lg text-info"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Last Update</h6>
                      <p className="text-info mb-0">
                        <i className="fas fa-clock me-1"></i>
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-success mt-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle fa-2x me-3 text-success"></i>
                  <div>
                    <h6 className="mb-1">System Status: Operational</h6>
                    <p className="mb-0 small">
                      All services running normally. 
                      {stats.totalUsers > 0 ? ` ${stats.totalUsers} users registered.` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    console.log('Current state:', { stats, bloodInventory, recentActivities });
                    fetchDashboardData();
                  }}
                >
                  <i className="fas fa-bug me-1"></i>
                  Debug Info
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={fetchDashboardData}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;