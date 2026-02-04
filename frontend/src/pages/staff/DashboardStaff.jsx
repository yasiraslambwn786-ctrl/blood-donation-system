import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchStaffStats, 
  fetchBloodInventory, 
  fetchRecentActivities,
  fetchTodayAppointments 
} from '../../redux/slices/staffOperationsSlice';

const DashboardStaff = () => {
  const dispatch = useDispatch();
  
  // ✅ Safely access Redux state with defaults
  const staffState = useSelector((state) => state.staff || {});
  const { staffData, isLoading: staffLoading = false } = staffState;
  
  const staffOperationsState = useSelector((state) => state.staffOperations || {});
  const { 
    stats = {}, 
    inventory = [], 
    activities = [], 
    appointments = [],
    isLoading: operationsLoading = false 
  } = staffOperationsState;
  
  const [notifications] = useState([
    { id: 1, type: 'critical', message: 'B- blood group out of stock (0 units)', time: '10:30 AM' },
    { id: 2, type: 'emergency', message: 'New emergency request from Civil Hospital', time: '11:15 AM' },
    { id: 3, type: 'info', message: '2 donors confirmed for today', time: '9:00 AM' }
  ]);

  // ✅ Fetch dashboard data
  useEffect(() => {
    if (staffData?.staff?.id) {
      dispatch(fetchStaffStats());
      dispatch(fetchBloodInventory());
      dispatch(fetchRecentActivities());
      dispatch(fetchTodayAppointments());
    }
  }, [dispatch, staffData]);

  // ✅ Safely access staff data
  const staffUser = staffData?.user || {};
  const staffDetails = staffData?.staff || {};

  // ✅ Default stats structure
  const defaultStats = {
    totalRequests: 0,
    pendingRequests: 0,
    emergencyRequests: 0,
    eligibleDonors: 0,
    activeDonors: 0,
    totalUnits: 0,
    criticalGroups: 0,
    todayAppointments: 0,
    completedAppointments: 0
  };

  const statsData = { ...defaultStats, ...stats };

  // Loading state
  if (staffLoading || operationsLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Welcome Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            <i className="fas fa-tachometer-alt me-2 text-primary"></i>
            Staff Operations Center
          </h1>
          <p className="text-muted mb-0">
            Welcome back, <strong>{staffUser?.name || 'Staff Member'}</strong> | 
            <span className="text-primary ms-2">
              {staffDetails?.designation || 'Staff Officer'}
            </span>
          </p>
        </div>
        <div className="text-end">
          <span className="badge bg-primary fs-6">
            <i className="fas fa-hospital me-1"></i>
            {staffDetails?.hospital_name || 'Civil Hospital'}
          </span>
          <p className="text-muted mb-0 mt-1">
            <small>Staff ID: {staffDetails?.staff_code || 'STF-001'} | Shift: {staffDetails?.shift_timing || '9AM-5PM'}</small>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-primary border-2 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Blood Requests</h6>
                  <h2 className="mb-0">{statsData.totalRequests}</h2>
                  <div className="mt-2 small">
                    <span className="text-danger me-2">
                      <i className="fas fa-clock"></i> {statsData.pendingRequests} Pending
                    </span>
                    <span className="text-warning">
                      <i className="fas fa-exclamation"></i> {statsData.emergencyRequests} Emergency
                    </span>
                  </div>
                </div>
                <div className="avatar bg-primary bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-file-medical fa-2x text-primary"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/staff/blood-requests" className="btn btn-primary btn-sm">
                  <i className="fas fa-eye me-1"></i> View All
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-success border-2 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Eligible Donors</h6>
                  <h2 className="mb-0">{statsData.eligibleDonors}</h2>
                  <div className="mt-2">
                    <span className="badge bg-success">
                      <i className="fas fa-user-check me-1"></i> 
                      {statsData.activeDonors} Active Today
                    </span>
                  </div>
                </div>
                <div className="avatar bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-users fa-2x text-success"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/staff/donor-management" className="btn btn-success btn-sm">
                  <i className="fas fa-search me-1"></i> Search Donors
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-danger border-2 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Blood Inventory</h6>
                  <h2 className="mb-0">{statsData.totalUnits}</h2>
                  <div className="mt-2">
                    <span className={`badge ${statsData.criticalGroups > 0 ? 'bg-danger' : 'bg-success'}`}>
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      {statsData.criticalGroups} Critical
                    </span>
                  </div>
                </div>
                <div className="avatar bg-danger bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-tint fa-2x text-danger"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/staff/inventory" className="btn btn-danger btn-sm">
                  <i className="fas fa-boxes me-1"></i> Check Stock
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-info border-2 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Today's Appointments</h6>
                  <h2 className="mb-0">{statsData.todayAppointments}</h2>
                  <div className="mt-2">
                    <span className="badge bg-info">
                      <i className="fas fa-user-clock me-1"></i>
                      {statsData.completedAppointments} Completed
                    </span>
                  </div>
                </div>
                <div className="avatar bg-info bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-calendar-check fa-2x text-info"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/staff/appointments" className="btn btn-info btn-sm text-white">
                  <i className="fas fa-calendar me-1"></i> Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2 text-warning"></i>
                Quick Operations
              </h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="fas fa-cog"></i> Options
                </button>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/staff/reports">Generate Report</Link></li>
                  <li><Link className="dropdown-item" to="/staff/settings">Settings</Link></li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3 col-sm-6">
                  <Link to="/staff/create-request" className="card action-card text-decoration-none h-100 hover-shadow">
                    <div className="card-body text-center">
                      <div className="avatar bg-danger bg-opacity-10 p-3 rounded-circle mb-3">
                        <i className="fas fa-plus fa-2x text-danger"></i>
                      </div>
                      <h6>Create Blood Request</h6>
                      <small className="text-muted">Emergency/Normal request</small>
                    </div>
                  </Link>
                </div>
                
                <div className="col-md-3 col-sm-6">
                  <Link to="/staff/donor-management" className="card action-card text-decoration-none h-100 hover-shadow">
                    <div className="card-body text-center">
                      <div className="avatar bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                        <i className="fas fa-search fa-2x text-success"></i>
                      </div>
                      <h6>Find Donors</h6>
                      <small className="text-muted">Advanced donor search</small>
                    </div>
                  </Link>
                </div>
                
                <div className="col-md-3 col-sm-6">
                  <Link to="/staff/inventory" className="card action-card text-decoration-none h-100 hover-shadow">
                    <div className="card-body text-center">
                      <div className="avatar bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                        <i className="fas fa-boxes fa-2x text-primary"></i>
                      </div>
                      <h6>Inventory Management</h6>
                      <small className="text-muted">Update stock levels</small>
                    </div>
                  </Link>
                </div>
                
                <div className="col-md-3 col-sm-6">
                  <Link to="/staff/appointments/schedule" className="card action-card text-decoration-none h-100 hover-shadow">
                    <div className="card-body text-center">
                      <div className="avatar bg-warning bg-opacity-10 p-3 rounded-circle mb-3">
                        <i className="fas fa-calendar-plus fa-2x text-warning"></i>
                      </div>
                      <h6>Schedule Appointment</h6>
                      <small className="text-muted">Book donor appointment</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts, Schedule & Blood Status */}
      <div className="row">
        {/* Active Alerts */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2 text-danger"></i>
                Active Alerts
              </h5>
              <span className="badge bg-danger">{notifications.length}</span>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {notifications.map((alert) => (
                  <div key={alert.id} className="list-group-item border-0">
                    <div className="d-flex">
                      <div className={`me-3 ${alert.type === 'critical' ? 'text-danger' : alert.type === 'emergency' ? 'text-warning' : 'text-info'}`}>
                        <i className={`fas fa-${alert.type === 'critical' ? 'exclamation-circle' : alert.type === 'emergency' ? 'exclamation-triangle' : 'info-circle'} fa-lg`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-bold">{alert.message}</p>
                        <small className="text-muted d-block">
                          <i className="far fa-clock me-1"></i> {alert.time}
                        </small>
                      </div>
                      <div>
                        {alert.type === 'critical' && (
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="fas fa-user-plus"></i> Find Donors
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-calendar-day me-2 text-info"></i>
                Today's Schedule
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Time</th>
                      <th>Donor</th>
                      <th>Blood Group</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <tr key={appointment.id || index}>
                        <td>{appointment.time}</td>
                        <td>{appointment.donorName}</td>
                        <td>
                          <span className={`badge bg-${appointment.bloodGroup === 'B-' || appointment.bloodGroup === 'AB-' ? 'danger' : 'primary'}`}>
                            {appointment.bloodGroup}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {appointments.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-calendar-times fa-2x mb-2"></i>
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blood Inventory Status */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-tint me-2 text-danger"></i>
                Blood Inventory Status
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {inventory.map((item, index) => (
                  <div key={item.id || index} className="col-6">
                    <div className={`p-3 mb-2 rounded text-center ${
                      item.status === 'critical' ? 'bg-danger text-white' : 
                      item.status === 'low' ? 'bg-warning' : 'bg-light'
                    }`}>
                      <h5 className="mb-1">{item.bloodGroup}</h5>
                      <p className="mb-0 fw-bold">{item.units} units</p>
                      <small className={`${item.status === 'critical' ? 'text-white' : 'text-muted'}`}>
                        {item.status === 'critical' ? 'CRITICAL' : item.status === 'low' ? 'LOW' : 'SAFE'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link to="/staff/inventory" className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-chart-bar me-1"></i> View Detailed Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-history me-2 text-secondary"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr>
                      <th>Time</th>
                      <th>Activity</th>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr key={activity.id || index}>
                        <td>{activity.time}</td>
                        <td>
                          <i className={`fas fa-${activity.icon} me-2 text-${activity.color}`}></i>
                          {activity.action}
                        </td>
                        <td>
                          <span className={`badge bg-${activity.type === 'request' ? 'primary' : activity.type === 'donation' ? 'success' : 'info'}`}>
                            {activity.type}
                          </span>
                        </td>
                        <td>{activity.details}</td>
                        <td>
                          <span className={`badge bg-${activity.status === 'completed' ? 'success' : 'warning'}`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStaff;