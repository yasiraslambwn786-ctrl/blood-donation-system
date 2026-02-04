import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ LOCAL STATE ONLY - NO Redux
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ Get data from AuthService
  const userData = AuthService.getCurrentUser();
  const staff = userData?.data || {};
  
  // ✅ Handle logout
  const handleLogout = async () => {
    await AuthService.logout('staff');
    navigate('/login-staff');
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/staff/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="staff-layout">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
        <div className="container-fluid">
          <button 
            className="btn btn-primary me-3 border-0" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'transparent' }}
          >
            <i className="fas fa-bars fa-lg"></i>
          </button>
          
          <Link className="navbar-brand fw-bold" to="/staff">
            <i className="fas fa-user-md me-2"></i>
            Blood Bank Staff Portal
          </Link>
          
          {/* Mobile Toggle */}
          <button 
            className="navbar-toggler d-md-none" 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Quick Search */}
          <form className="d-none d-md-flex mx-3 flex-grow-1" onSubmit={handleQuickSearch}>
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search donors, requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-light" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
          
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <div className="d-flex align-items-center ms-auto">
              {/* Notifications */}
              <div className="dropdown me-3">
                <button className="btn btn-light position-relative" type="button" data-bs-toggle="dropdown">
                  <i className="fas fa-bell"></i>
                  {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '300px' }}>
                  <li className="dropdown-header"><strong>Notifications</strong></li>
                  {notifications.slice(0, 3).map((notification) => (
                    <li key={notification.id}>
                      <a className="dropdown-item" href="#">
                        <div>
                          <small className="text-muted">{notification.time}</small>
                          <p className="mb-0">{notification.message}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item text-center" to="/staff/notifications">
                      View All Notifications
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Current Date */}
              <span className="text-light me-3 d-none d-lg-block">
                <i className="far fa-calendar me-1"></i>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              
              {/* Staff Profile Dropdown */}
              <div className="dropdown">
                <button className="btn btn-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                  <div className="avatar-sm me-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="fas fa-user-md text-primary"></i>
                    </div>
                  </div>
                  <div className="text-start">
                    <div className="fw-bold">{staff?.name || 'Staff Member'}</div>
                    <small className="text-muted">{staff?.designation || 'Staff Officer'}</small>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/staff/profile">
                      <i className="fas fa-user-circle me-2"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/staff/settings">
                      <i className="fas fa-cog me-2"></i> Settings
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/staff/reports">
                      <i className="fas fa-chart-bar me-2"></i> Reports
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-md-3 col-lg-2 ${sidebarOpen ? '' : 'd-none'} d-md-block`}>
            <div className="sidebar bg-white border-end vh-100 position-sticky top-0 shadow-sm" style={{ overflowY: 'auto', paddingTop: '20px' }}>
              {/* Staff Info */}
              <div className="text-center p-3 bg-gradient-primary text-white mb-3">
                <div className="avatar mb-3" style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <i className="fas fa-user-md fa-2x"></i>
                </div>
                <h6 className="mb-1">{staff?.name || 'Staff Name'}</h6>
                <small className="opacity-75">{staff?.designation || 'Blood Bank Officer'}</small>
                <div className="mt-2">
                  <small>
                    <i className="fas fa-id-badge me-1"></i>
                    ID: {staff?.staff_code || 'STF-001'}
                  </small>
                </div>
                <div className="mt-1">
                  <small>
                    <i className="fas fa-hospital me-1"></i>
                    {staff?.hospital_name || 'Civil Hospital'}
                  </small>
                </div>
              </div>

              {/* Main Menu */}
              <nav className="nav flex-column px-3 mb-3">
                <Link
                  to="/staff" 
                  className={`nav-link mb-2 rounded d-flex align-items-center ${location.pathname === '/staff' ? 'active bg-primary text-white' : 'text-dark'}`}
                >
                  <i className="fas fa-tachometer-alt me-3"></i>
                  Dashboard
                </Link>
                
                {/* Rest of your menu items... */}
                {/* Keep your existing menu code */}
              </nav>

              {/* Quick Actions */}
              <div className="px-3 mb-3">
                <h6 className="text-muted mb-2">
                  <i className="fas fa-bolt me-1"></i> Quick Actions
                </h6>
                <div className="d-grid gap-2">
                  <Link to="/staff/create-request" className="btn btn-danger btn-sm">
                    <i className="fas fa-plus me-1"></i> New Blood Request
                  </Link>
                  <Link to="/staff/emergency" className="btn btn-warning btn-sm">
                    <i className="fas fa-exclamation-triangle me-1"></i> Emergency Cases
                  </Link>
                  <Link to="/staff/donor-search" className="btn btn-success btn-sm">
                    <i className="fas fa-search me-1"></i> Find Donors
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${sidebarOpen ? 'col-md-9 col-lg-10' : 'col-12'}`}>
            <div className="p-3 p-md-4">
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb bg-light p-3 rounded shadow-sm">
                  <li className="breadcrumb-item">
                    <Link to="/staff" className="text-decoration-none">
                      <i className="fas fa-home me-1"></i> Home
                    </Link>
                  </li>
                  {location.pathname !== '/staff' && (
                    <li className="breadcrumb-item active" aria-current="page">
                      {location.pathname.split('/').pop().replace('-', ' ')}
                    </li>
                  )}
                </ol>
              </nav>
              
              <div className="bg-white rounded shadow-sm p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-auto">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <small className="text-muted">
                <i className="fas fa-hospital-alt me-1"></i>
                Blood Bank Management System © 2024 | Version 2.0
              </small>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <small className="text-muted">
                Logged in as: {staff?.name} • 
                Department: {staff?.department || 'Blood Bank'} • 
                Last Login: {new Date().toLocaleTimeString()}
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaffLayout;