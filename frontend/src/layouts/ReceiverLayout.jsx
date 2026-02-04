// FILE: src/layouts/ReceiverLayout.jsx - FIXED WITH OUTLET
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const ReceiverLayout = () => { // ✅ No children prop needed
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [receiver, setReceiver] = useState({});
  const [loading, setLoading] = useState(true);
  
  // ✅ Get data from AuthService on component mount
  useEffect(() => {
    const fetchReceiverData = () => {
      console.log('🔍 Fetching receiver data for layout...');
      
      const userData = AuthService.getCurrentUser();
      console.log('AuthService userData:', userData);
      
      if (userData?.data) {
        console.log('✅ Data from AuthService:', userData.data);
        setReceiver(userData.data);
      } else {
        // Try to get from localStorage directly
        const storedData = localStorage.getItem('receiver_data');
        console.log('LocalStorage data key:', storedData);
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log('✅ Data from localStorage:', parsedData);
            setReceiver(parsedData);
          } catch (error) {
            console.error('❌ Error parsing localStorage data:', error);
          }
        }
      }
      setLoading(false);
    };

    fetchReceiverData();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'receiver_data') {
        fetchReceiverData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // ✅ Handle logout
  const handleLogout = async () => {
    console.log('🚪 Logging out receiver...');
    await AuthService.logout('receiver');
    navigate('/login-receiver');
  };

  // ✅ Get page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('new-request')) return 'New Blood Request';
    if (path.includes('requests')) return 'My Requests';
    if (path.includes('emergency')) return 'Emergency';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('verify')) return 'Verification';
    return 'Receiver Portal';
  };

  // ✅ Get verification badge
  const getVerificationBadge = () => {
    if (!receiver || Object.keys(receiver).length === 0) {
      return <span className="badge bg-secondary">Loading...</span>;
    }
    
    const isVerified = receiver.mobile_verified && 
                      receiver.email_verified && 
                      receiver.hospital_verified;
    
    return isVerified ? 
      <span className="badge bg-success">
        <i className="fas fa-check-circle me-1"></i>Verified
      </span> : 
      <span className="badge bg-warning">
        <i className="fas fa-clock me-1"></i>Verification Pending
      </span>;
  };

  // Navigation items array (like DonorLayout)
  const navItems = [
    { path: '/receiver/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/receiver/new-request', icon: 'fas fa-plus-circle', label: 'New Blood Request' },
    { path: '/receiver/requests', icon: 'fas fa-list', label: 'My Requests' },
    { path: '/receiver/emergency', icon: 'fas fa-ambulance', label: 'Emergency' },
    { path: '/receiver/profile', icon: 'fas fa-user', label: 'My Profile' },
    { path: '/receiver/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  // If still loading data
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading receiver portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="receiver-layout">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/receiver/dashboard">
            <i className="fas fa-hospital-user me-2"></i>
            <span>Receiver Portal</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" 
                   href="#" role="button" data-bs-toggle="dropdown">
                  <i className="fas fa-user-circle me-2"></i>
                  <span>{receiver?.contact_name || 'Receiver'}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/receiver/profile">
                      <i className="fas fa-user me-2"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/receiver/settings">
                      <i className="fas fa-cog me-2"></i>Settings
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
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 px-0">
            <div className="sidebar bg-light vh-100 sticky-top">
              <div className="p-3 border-bottom text-center">
                <div className="mb-3">
                  <i className="fas fa-user-circle fa-3x text-secondary"></i>
                </div>
                <h6 className="mb-1">{receiver?.contact_name || 'Receiver'}</h6>
                <p className="small text-muted mb-2">
                  <i className="fas fa-user me-1"></i>
                  {receiver?.relationship || 'Contact Person'}
                </p>
                <div className="mb-2">
                  {getVerificationBadge()}
                </div>
                <small className="text-muted">
                  <i className="fas fa-hospital me-1"></i>
                  {receiver?.hospital_name || 'No hospital specified'}
                </small>
              </div>
              
              {/* Navigation Menu */}
              <nav className="nav flex-column p-3">
                {navItems.map((item, index) => (
                  <Link 
                    key={index}
                    to={item.path} 
                    className={`nav-link d-flex align-items-center py-2 px-3 mb-2 ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                ))}
                
                {/* Add verification link if not verified */}
                {(!receiver?.mobile_verified || !receiver?.email_verified || !receiver?.hospital_verified) && (
                  <Link 
                    to="/receiver/verify" 
                    className={`nav-link d-flex align-items-center py-2 px-3 mb-2 ${location.pathname.includes('verify') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-check-circle me-2 text-info"></i>
                    Verification
                  </Link>
                )}
                
                <div className="mt-3 pt-3 border-top">
                  <button 
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="col-md-9 col-lg-10 px-0">
            {/* Page Header */}
            <div className="bg-white border-bottom py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-tint me-2 text-danger"></i>
                  {getPageTitle()}
                </h4>
                <div className="d-flex align-items-center">
                  <div className="text-end me-3">
                    <small className="text-muted d-block">Patient</small>
                    <strong>{receiver?.patient_name || 'N/A'}</strong>
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-block">Blood Group</small>
                    <strong className="text-danger">{receiver?.blood_group_needed || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ✅ Page Content - OUTLET HERE */}
            <div className="p-4">
              {/* This is where ReceiverDashboard will render */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0 small text-muted">
                <i className="fas fa-heartbeat me-1 text-danger"></i>
                Receiver Portal • Blood Donation Management System
              </p>
            </div>
            <div className="col-md-6 text-end">
              <p className="mb-0 small text-muted">
                © {new Date().getFullYear()} • Need help? Call: <strong>115</strong>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReceiverLayout;