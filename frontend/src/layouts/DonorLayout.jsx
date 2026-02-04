// FILE: src/layouts/DonorLayout.jsx - CLEAN LAYOUT
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutDonor } from "../redux/slices/donorSlice";
import axios from "../api/axiosInstance";

// Components
import LoadingSpinner from "../components/common/LoadingSpinner";

const DonorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { donor, token } = useSelector((state) => state.donor);
  
  // Local state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Authentication check
  useEffect(() => {
    const storedToken = localStorage.getItem('donorToken');
    console.log("🔍 DonorLayout Auth Check");
    
    if (!storedToken) {
      console.log("❌ No token, redirecting to login");
      navigate("/login-donor", { replace: true });
      return;
    }
    
    console.log("✅ Authentication passed");
  }, [navigate]);

  // ✅ Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('donorToken');
        if (!token) return;
        
        const response = await axios.get('/donor/notifications', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data.success) {
          setNotifications(response.data.data.notifications || []);
          setUnreadNotifications(response.data.data.unread_count || 0);
        }
      } catch (error) {
        console.log("Notifications API failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('donorToken');
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutDonor());
    navigate("/login-donor");
  };

  // Navigation items
  const navItems = [
    { path: "home-donor", icon: "fas fa-home", label: "Dashboard" },
    { path: "profile-donor", icon: "fas fa-user", label: "My Profile" },
    { path: "edit-profile-donor", icon: "fas fa-edit", label: "Edit Profile" },
    { path: "appointments-donor", icon: "fas fa-calendar-check", label: "Appointments" },
    { path: "donation-history", icon: "fas fa-history", label: "Donation History" },
    { path: "find-donors", icon: "fas fa-search", label: "Find Donors" },
    { path: "about-us", icon: "fas fa-info-circle", label: "About Us" },
    { path: "contact-us", icon: "fas fa-phone", label: "Contact Us" },
  ];

  // Get page title
  const getPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => 
      currentPath === `/donor/${item.path}` || currentPath.endsWith(`/${item.path}`)
    );
    return currentItem ? currentItem.label : "Donor Dashboard";
  };

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return (
    <div className="donor-layout">
      {/* Top Header/Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top" 
           style={{ backgroundColor: '#0f0597' }}>
        <div className="container-fluid">
          {/* Logo/Brand */}
          <Link className="navbar-brand d-flex align-items-center" to="/donor/home-donor">
            <i className="fas fa-heartbeat fa-lg me-2"></i>
            <span className="fw-bold">BloodDonor Portal</span>
          </Link>

          {/* Mobile Toggle */}
          <button className="navbar-toggler" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Items */}
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              
              {/* Notification Bell */}
              <li className="nav-item dropdown mx-2">
                <a className="nav-link position-relative" href="#!" data-bs-toggle="dropdown">
                  <i className="fas fa-bell fa-lg"></i>
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadNotifications}
                    </span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: '300px' }}>
                  <li><h6 className="dropdown-header">Notifications</h6></li>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif, idx) => (
                      <li key={idx}>
                        <a className="dropdown-item d-flex align-items-start" href="#!">
                          <div className={`me-2 p-1 rounded ${notif.read ? 'bg-light' : 'bg-warning'}`}>
                            <i className={`fas ${notif.type === 'request' ? 'fa-tint' : 'fa-calendar'}`}></i>
                          </div>
                          <div>
                            <small className="d-block text-truncate">{notif.message}</small>
                            <small className="text-muted">{formatDate(notif.created_at)}</small>
                          </div>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li><span className="dropdown-item text-muted">No notifications</span></li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item text-center text-primary" to="/donor/notifications">
                      View All
                    </Link>
                  </li>
                </ul>
              </li>

              {/* User Profile */}
              <li className="nav-item dropdown mx-2">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#!" data-bs-toggle="dropdown">
                  <div className="d-flex align-items-center">
                    <div className="bg-white rounded-circle p-1 me-2">
                      <i className="fas fa-user text-danger"></i>
                    </div>
                    <div className="d-none d-md-block">
                      <div className="fw-bold small">
                        {donor?.full_name?.split(' ')[0] || 
                         JSON.parse(localStorage.getItem('donorData'))?.full_name?.split(' ')[0] || 
                         'Donor'}
                      </div>
                      <div className="text-light small">
                        <span className="badge bg-danger">
                          {donor?.blood_type || 
                           JSON.parse(localStorage.getItem('donorData'))?.blood_type || 
                           'Blood Type'}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/donor/profile-donor">
                      <i className="fas fa-user me-2"></i>My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/donor/edit-profile-donor">
                      <i className="fas fa-edit me-2"></i>Edit Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>

              {/* Emergency Button */}
              <li className="nav-item ms-2">
                <button className="btn btn-danger btn-sm" onClick={() => navigate("/emergency-request")}>
                  <i className="fas fa-ambulance me-1"></i> Emergency
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-md-3 col-lg-2 d-none d-md-block p-0 ${sidebarCollapsed ? 'collapsed' : ''}`}
               style={{ backgroundColor: '#f8f9fa', borderRight: '1px solid #dee2e6', minHeight: 'calc(100vh - 56px)' }}>
            
            {/* Donor Profile */}
            <div className="text-center p-3 border-bottom">
              <div className="position-relative d-inline-block mb-3">
                <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                     style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-user fa-2x text-white"></i>
                </div>
              </div>
              <h5 className="mb-1">
                {donor?.full_name || JSON.parse(localStorage.getItem('donorData'))?.full_name || 'Donor Name'}
              </h5>
              <div className="mb-2">
                <span className="badge bg-danger fs-6 px-3 py-2">
                  <i className="fas fa-tint me-1"></i>
                  {donor?.blood_type || JSON.parse(localStorage.getItem('donorData'))?.blood_type || 'Blood Type'}
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3">
              <ul className="nav flex-column">
                {navItems.map((item, index) => (
                  <li className="nav-item mb-2" key={index}>
                    <Link 
                      className={`nav-link d-flex align-items-center py-2 px-3 rounded ${location.pathname === item.path ? 'active' : ''}`}
                      to={item.path}
                      style={{
                        backgroundColor: location.pathname === item.path ? '#c21807' : 'transparent',
                        color: location.pathname === item.path ? 'white' : '#495057'
                      }}
                    >
                      <i className={`${item.icon} me-3`}></i>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
                <li className="nav-item mt-4">
                  <button className="nav-link d-flex align-items-center py-2 px-3 rounded border text-danger w-100" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-3"></i>
                    {!sidebarCollapsed && <span>Logout</span>}
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className={`${sidebarCollapsed ? 'col-md-12' : 'col-md-9 col-lg-10'} p-0`} style={{ minHeight: 'calc(100vh - 56px)' }}>
            
            {/* Page Header */}
            <div className="bg-light py-3 px-4 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0 text-dark">
                    <i className="fas fa-chevron-right me-2 text-danger"></i>
                    {getPageTitle()}
                  </h4>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => navigate("/donor/appointments-donor")}>
                    <i className="fas fa-calendar-plus me-1"></i> New Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Page Content - OUTLET HERE */}
            <div className="p-3 p-md-4">
              {/* This is where HomeDonor.jsx will render */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-2"><i className="fas fa-heartbeat me-2 text-danger"></i>Blood Donation Portal</h6>
              <p className="small mb-0">Saving lives one donation at a time.</p>
            </div>
            <div className="col-md-6 text-end">
              <p className="small mb-0">© {new Date().getFullYear()} BloodDonor. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DonorLayout;