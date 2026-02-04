// FILE: src/pages/accepter/AccepterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance';

const AccepterDashboard = () => {
  const [stats, setStats] = useState({
    verified_today: 0,
    issued_today: 0,
    pending_verification: 5,
    pending_issuance: 3,
    total_verified: 124,
    total_issued: 89,
    success_rate: 95.5
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'verification',
      title: 'Donation Verified',
      message: 'Verified blood donation from John Doe (A+)',
      time: '2 hours ago',
      blood_group: 'A+',
      units: 1,
      icon: 'check-circle',
      color: 'success'
    },
    {
      id: 2,
      type: 'issuance',
      title: 'Blood Issued',
      message: 'Issued 2 units of O+ to Civil Hospital',
      time: '4 hours ago',
      blood_group: 'O+',
      units: 2,
      icon: 'syringe',
      color: 'primary'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Low Stock Alert',
      message: 'B- blood group is below minimum threshold',
      time: '6 hours ago',
      blood_group: 'B-',
      units: 2,
      icon: 'exclamation-triangle',
      color: 'warning'
    }
  ]);

  const [bloodInventory, setBloodInventory] = useState([
    { group: 'A+', units: 45, status: 'Available' },
    { group: 'A-', units: 8, status: 'Low' },
    { group: 'B+', units: 67, status: 'Available' },
    { group: 'B-', units: 0, status: 'Urgent' },
    { group: 'O+', units: 89, status: 'Available' },
    { group: 'O-', units: 23, status: 'Available' },
    { group: 'AB+', units: 12, status: 'Low' },
    { group: 'AB-', units: 0, status: 'Urgent' }
  ]);

  useEffect(() => {
    // Fetch real data from API
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accepterToken');
        const response = await axios.get('/accepter/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setStats(response.data.data.stats || stats);
        }
      } catch (error) {
        console.log('Using mock data for dashboard');
      }
    };
    
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      'Available': 'success',
      'Low': 'warning',
      'Urgent': 'danger',
      'Critical': 'dark'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="container-fluid">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="h3 mb-0">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Accepter Dashboard
                  </h1>
                  <p className="mb-0 opacity-75">Welcome back! Manage blood donations and issuances</p>
                </div>
                <div className="text-end">
                  <p className="mb-0">
                    <i className="fas fa-calendar-alt me-1"></i>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Verified Today
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.verified_today}
                  </div>
                  <div className="mt-2">
                    <Link to="/accepter/verification-history" className="small text-primary">
                      View History <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Issued Today
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.issued_today}
                  </div>
                  <div className="mt-2">
                    <Link to="/accepter/issuance-history" className="small text-success">
                      View History <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-syringe fa-2x text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Verification
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.pending_verification}
                  </div>
                  <div className="mt-2">
                    <Link to="/accepter/verify-donations" className="small text-warning">
                      Verify Now <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Success Rate
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.success_rate}%
                  </div>
                  <div className="mt-2">
                    <Link to="/accepter/reports" className="small text-info">
                      View Reports <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chart-line fa-2x text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Activities */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="fas fa-history me-2"></i>
                Recent Activities
              </h6>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <div>
                        <h6 className="mb-1">
                          <i className={`fas fa-${activity.icon} text-${activity.color} me-2`}></i>
                          {activity.title}
                        </h6>
                        <p className="mb-1 small">{activity.message}</p>
                        <small className="text-muted">
                          <span className={`badge bg-${activity.blood_group === 'B-' ? 'danger' : 'primary'} me-2`}>
                            {activity.blood_group}
                          </span>
                          {activity.units} units
                        </small>
                      </div>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <Link to="/accepter/verification-history" className="btn btn-sm btn-outline-primary">
                  View All Activities
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Inventory Status */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <h6 className="m-0 font-weight-bold text-danger">
                <i className="fas fa-tint me-2"></i>
                Blood Inventory Status
              </h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Available Units</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodInventory.map(item => (
                      <tr key={item.group}>
                        <td>
                          <span className="badge bg-danger">
                            {item.group}
                          </span>
                        </td>
                        <td>
                          <strong>{item.units}</strong>
                        </td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {item.status === 'Urgent' ? (
                            <button className="btn btn-sm btn-danger">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Alert
                            </button>
                          ) : item.status === 'Low' ? (
                            <button className="btn btn-sm btn-warning">
                              <i className="fas fa-bell me-1"></i>
                              Monitor
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-success">
                              <i className="fas fa-check me-1"></i>
                              OK
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-3">
                <Link to="/accepter/inventory" className="btn btn-sm btn-outline-danger">
                  <i className="fas fa-boxes me-1"></i>
                  Manage Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <h6 className="m-0 font-weight-bold text-dark">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <Link to="/accepter/verify-donations" className="btn btn-warning btn-block py-3">
                    <i className="fas fa-user-check fa-2x mb-2"></i>
                    <br />
                    Verify Donations
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/accepter/issue-blood" className="btn btn-success btn-block py-3">
                    <i className="fas fa-syringe fa-2x mb-2"></i>
                    <br />
                    Issue Blood
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/accepter/inventory" className="btn btn-info btn-block py-3">
                    <i className="fas fa-boxes fa-2x mb-2"></i>
                    <br />
                    View Inventory
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/accepter/reports" className="btn btn-primary btn-block py-3">
                    <i className="fas fa-chart-bar fa-2x mb-2"></i>
                    <br />
                    Generate Report
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccepterDashboard;