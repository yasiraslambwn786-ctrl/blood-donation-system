
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { logo1 } from '../assets/img';
import '../index.css';
import axios from 'axios';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, role, token } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); // ✅ ADDED
  
  // ✅ **VITE COMPATIBLE: Use import.meta.env instead of process.env**
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // ✅ Blood Inventory State (Connected to Backend)
  const [bloodInventory, setBloodInventory] = useState([
    { id: 1, blood_group: 'A+', units: 45, status: 'Available', last_updated: 'Today, 10:30 AM' },
    { id: 2, blood_group: 'A-', units: 8, status: 'Low', last_updated: 'Today, 10:30 AM' },
    { id: 3, blood_group: 'B+', units: 67, status: 'Available', last_updated: 'Today, 10:30 AM' },
    { id: 4, blood_group: 'B-', units: 0, status: 'Urgent', last_updated: 'Today, 10:30 AM' },
    { id: 5, blood_group: 'O+', units: 89, status: 'Available', last_updated: 'Today, 10:30 AM' },
    { id: 6, blood_group: 'O-', units: 23, status: 'Available', last_updated: 'Today, 10:30 AM' },
    { id: 7, blood_group: 'AB+', units: 12, status: 'Low', last_updated: 'Today, 10:30 AM' },
    { id: 8, blood_group: 'AB-', units: 0, status: 'Urgent', last_updated: 'Today, 10:30 AM' }
  ]);

  // ✅ System Stats State (Connected to Backend)
  const [systemStats, setSystemStats] = useState({
    total_donors: 1250,
    blood_units: 342,
    lives_saved: 2890,
    total_donations: 1567,
    active_requests: 25
  });

  // ✅ News & Updates State
  const [newsUpdates, setNewsUpdates] = useState([
    { id: 1, title: "Blood Donation Camp", date: "Dec 15, 2024", location: "IUB Campus" },
    { id: 2, title: "Emergency Blood Request", date: "Dec 10, 2024", location: "Civil Hospital" },
    { id: 3, title: "New Donor Registration Drive", date: "Dec 5, 2024", location: "City Center" }
  ]);

  // ✅ Fetch real-time data from backend (CONDITIONAL - Professional Version)
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        setLoading(true);
        
        // ✅ CONDITION 1: Sirf public homepage par
        // ✅ CONDITION 2: Sirf jab user logged in na ho
        if (!activeRole && location.pathname === '/') {
          // ✅ Fetch blood inventory from backend
          const bloodRes = await axios.get(`${API_BASE_URL}/blood-inventory`, {
            timeout: 5000
          });
          
          if (bloodRes.data && bloodRes.data.success) {
            setBloodInventory(bloodRes.data.data);
          }

          // ✅ Fetch system stats from backend
          const statsRes = await axios.get(`${API_BASE_URL}/dashboard-stats`, {
            timeout: 5000
          });
          
          if (statsRes.data && statsRes.data.success) {
            setSystemStats(statsRes.data.data);
          }

          // ✅ Fetch news & updates
          const newsRes = await axios.get(`${API_BASE_URL}/news-updates`, {
            timeout: 5000
          });
          
          if (newsRes.data && newsRes.data.success) {
            setNewsUpdates(newsRes.data.data);
          }
          
          setLastUpdated(new Date()); // ✅ Update time
        }
      } catch (error) {
        console.log('Using mock data for demonstration');
        // Continue with mock data
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeData();
    
    // ✅ CONDITIONAL AUTO-REFRESH:
    // Sirf public homepage par aur jab user logged in na ho
    let interval;
    if (!activeRole && location.pathname === '/') {
      interval = setInterval(fetchRealTimeData, 30000);
    }
    
    // ✅ Cleanup function
    return () => {
      if (interval) clearInterval(interval);
    };
    
  }, [activeRole, location.pathname]); // ✅ Dependencies add karo

  // ✅ Check authentication and user profile
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedToken && storedRole) {
        setActiveRole(storedRole);
        
        // ✅ Fetch user profile based on role
        try {
          const profileRes = await axios.get(`${API_BASE_URL}/${storedRole}/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            timeout: 5000
          });
          
          if (profileRes.data && profileRes.data.success) {
            setUserProfile(profileRes.data.data);
          }
        } catch (error) {
          console.log('Profile fetch skipped, using mock data');
          // Set mock profile for demonstration
          setUserProfile({
            name: storedRole.charAt(0).toUpperCase() + storedRole.slice(1) + ' User',
            email: `${storedRole}@example.com`
          });
        }
      } else {
        setActiveRole(null);
        setUserProfile(null);
      }
    };
    
    checkAuthAndProfile();
  }, [location.pathname, token, role]);

  // ✅ Handle manual refresh
  const handleManualRefresh = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // ✅ Sirf public data refresh karo
      if (!activeRole && location.pathname === '/') {
        const [bloodRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/blood-inventory`),
          axios.get(`${API_BASE_URL}/dashboard-stats`)
        ]);
        
        if (bloodRes.data?.success) setBloodInventory(bloodRes.data.data);
        if (statsRes.data?.success) setSystemStats(statsRes.data.data);
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.log('Manual refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Admin Login Click
  const handleAdminLoginClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/login-admin');
  };

  // ✅ Handle Dashboard Access based on role
  const handleDashboardAccess = () => {
    const userRole = localStorage.getItem('userRole');
    
    switch(userRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'donor':
        navigate('/donor/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      case 'receiver':
        navigate('/receiver/dashboard');
        break;
      case 'accepter':
        navigate('/accepter/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000
        });
      }
    } catch (error) {
      console.log('Logout API call skipped');
    } finally {
      // Clear all local storage
      localStorage.clear();
      dispatch(logout());
      
      // Clear all specific tokens
      ['token', 'adminToken', 'donorToken', 'staffToken', 'receiverToken', 'accepterToken', 'userRole', 'userData'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      navigate('/');
      setIsMobileMenuOpen(false);
      // Removed window.location.reload() to avoid flash
    }
  };

  // ✅ Get status badge color
  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    
    switch(status.toLowerCase()) {
      case 'available': return 'success';
      case 'low': return 'warning';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  // ✅ Render Profile Dropdown
  const renderProfileDropdown = () => {
    if (!activeRole || !userProfile) return null;

    return (
      <div className="dropdown">
        <button 
          className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
          type="button" 
          id="profileDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fas fa-user-circle me-2"></i>
          <span className="d-none d-md-inline">
            {userProfile?.name?.split(' ')[0] || 'Profile'}
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
          <li className="dropdown-header">
            <div className="text-center">
              <div className="mb-2">
                <i className="fas fa-user-circle fa-2x text-primary"></i>
              </div>
              <strong>{userProfile?.name || 'User'}</strong><br/>
              <small className="text-muted">{activeRole?.toUpperCase()}</small>
            </div>
          </li>
          <li><hr className="dropdown-divider"/></li>
          <li>
            <button className="dropdown-item" onClick={handleDashboardAccess}>
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </button>
          </li>
          <li>
            <Link 
              className="dropdown-item" 
              to={`/${activeRole}/profile`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-user me-2"></i>
              My Profile
            </Link>
          </li>
          <li>
            <Link 
              className="dropdown-item" 
              to={`/${activeRole}/settings`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-cog me-2"></i>
              Settings
            </Link>
          </li>
          <li><hr className="dropdown-divider"/></li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>
    );
  };

  // ✅ Render public homepage
  const renderPublicHomePage = () => (
    <div className="public-home-page">
      {/* Hero Section */}
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold text-danger mb-3">
              <i className="fas fa-tint me-2"></i>
              Blood Donation Management System
            </h1>
            <p className="lead text-muted mb-4">
              A comprehensive digital platform connecting donors, hospitals, and blood banks at The Islamia University of Bahawalpur.
            </p>
            
            <div className="d-flex flex-wrap gap-3 mb-4">
              <Link to="/register-donor" className="btn btn-danger btn-lg">
                <i className="fas fa-user-plus me-2"></i>Become a Donor
              </Link>
              <Link to="/emergency-request" className="btn btn-outline-danger btn-lg">
                <i className="fas fa-ambulance me-2"></i>Emergency Request
              </Link>
              <button onClick={handleAdminLoginClick} className="btn btn-dark btn-lg">
                <i className="fas fa-shield-alt me-2"></i>Admin Access
              </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="row g-3 mt-4">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body p-3">
                    <h3 className="text-danger mb-1">{systemStats.total_donors}+</h3>
                    <small className="text-muted">Registered Donors</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body p-3">
                    <h3 className="text-danger mb-1">{systemStats.blood_units}</h3>
                    <small className="text-muted">Blood Units</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body p-3">
                    <h3 className="text-danger mb-1">{systemStats.lives_saved}+</h3>
                    <small className="text-muted">Lives Saved</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body p-3">
                    <h3 className="text-danger mb-1">{systemStats.active_requests}</h3>
                    <small className="text-muted">Active Requests</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-danger text-white py-3">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Real-time Blood Availability
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3">Blood Group</th>
                        <th className="py-3 text-center">Units</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloodInventory.map((blood) => (
                        <tr key={blood.id || blood.blood_group}>
                          <td>
                            <strong className="text-dark">{blood.blood_group}</strong>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="progress flex-grow-1 mx-2" style={{ height: '6px', width: '60px' }}>
                                <div 
                                  className={`progress-bar bg-${getStatusColor(blood.status)}`}
                                  style={{ width: `${Math.min((blood.units || 0) * 5, 100)}%` }}
                                ></div>
                              </div>
                              <span className="fw-bold">{blood.units || 0}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`badge bg-${getStatusColor(blood.status)} px-3 py-1`}>
                              {blood.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="text-center">
                            {(blood.status || '').toLowerCase() === 'urgent' ? (
                              <Link to="/emergency-request" className="btn btn-sm btn-danger">
                                <i className="fas fa-bell me-1"></i>Alert
                              </Link>
                            ) : (blood.units || 0) > 0 ? (
                              <Link to="/register-donor" className="btn btn-sm btn-outline-success">
                                <i className="fas fa-heart me-1"></i>Donate
                              </Link>
                            ) : (
                              <button className="btn btn-sm btn-outline-warning" disabled>
                                <i className="fas fa-exclamation me-1"></i>Low
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer text-center py-2 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-sync-alt me-1"></i>
                    Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </small>
                  <button 
                    onClick={handleManualRefresh}
                    className="btn btn-sm btn-outline-secondary"
                    disabled={loading}
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-1`}></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center text-danger fw-bold mb-5">
            <i className="fas fa-star me-2"></i>
            System Features
          </h2>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-users fa-3x text-danger"></i>
                  </div>
                  <h5 className="fw-bold">Multi-Role System</h5>
                  <p className="text-muted">
                    Separate portals for Donors, Staff, Receivers, Accepters, and Administrators
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-bolt fa-3x text-warning"></i>
                  </div>
                  <h5 className="fw-bold">Real-time Tracking</h5>
                  <p className="text-muted">
                    Live blood inventory updates and emergency request management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-shield-alt fa-3x text-primary"></i>
                  </div>
                  <h5 className="fw-bold">Secure Admin Panel</h5>
                  <p className="text-muted">
                    Complete system control with advanced security and audit logs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Access Highlight Section */}
      <div className="py-5 bg-dark text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="mb-3">
                <i className="fas fa-shield-alt me-2"></i>
                Administrative Access Required
              </h3>
              <p className="mb-0">
                The Admin Panel provides complete system control. Access is strictly restricted to authorized administrators only.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button onClick={handleAdminLoginClick} className="btn btn-light btn-lg">
                <i className="fas fa-lock me-2"></i>Access Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News & Updates */}
      <div className="py-5">
        <div className="container">
          <h3 className="text-center text-danger fw-bold mb-5">
            <i className="fas fa-newspaper me-2"></i>
            Latest Updates
          </h3>
          
          <div className="row g-4">
            {newsUpdates.map((news) => (
              <div key={news.id} className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold">{news.title}</h6>
                    <p className="text-muted small mb-2">
                      <i className="fas fa-calendar me-1"></i>
                      {formatDate(news.date)}
                    </p>
                    <p className="small text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {news.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="py-4 bg-danger text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="mb-2">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Emergency Blood Request?
              </h5>
              <p className="mb-0 small">
                Contact our 24/7 emergency helpline or submit an urgent request online.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to="/emergency-request" className="btn btn-light btn-sm">
                <i className="fas fa-phone-alt me-1"></i>Emergency: 115
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Check if we should show public homepage or children
  const shouldShowPublicHomePage = !activeRole && location.pathname === '/';

  return (
    <div className="main-layout">
      {/* ✅ NAVBAR - Professional Design */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ 
        backgroundColor: '#0f0597',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div className="container">
          {/* Logo & Brand */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo1} alt="Logo" height="45" className="me-3" />
            <div className="d-flex flex-column">
              <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                <i className="fas fa-tint me-1"></i>
                Blood Donation System
              </span>
              <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                IUB Bahawalnagar Campus
              </small>
            </div>
          </Link>
          
          {/* Mobile Toggle */}
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-home me-1"></i>Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-info-circle me-1"></i>About
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-phone me-1"></i>Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/emergency-request' ? 'active' : ''}`} 
                  to="/emergency-request" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-ambulance me-1"></i>Emergency
                </Link>
              </li>
            </ul>

            {/* ✅ Right Side Actions */}
            <div className="d-flex align-items-center gap-2">
              {/* User Profile or Login Options */}
              {activeRole ? (
                <>
                  {renderProfileDropdown()}
                </>
              ) : (
                <>
                  {/* Login Dropdown */}
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-light dropdown-toggle" 
                      type="button" 
                      id="loginDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-sign-in-alt me-1"></i>Login
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="loginDropdown">
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/login-donor"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-user me-2 text-primary"></i>
                          Donor Login
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/login-staff"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-user-tie me-2 text-success"></i>
                          Staff Login
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/login-admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-shield-alt me-2 text-danger"></i>
                          <strong>Admin Login</strong>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/login-receiver"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-hospital-user me-2 text-info"></i>
                          Receiver Login
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/login-accepter"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-user-md me-2 text-warning"></i>
                          Accepter Login
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Register Dropdown */}
                  <div className="dropdown">
                    <button 
                      className="btn btn-danger dropdown-toggle" 
                      type="button" 
                      id="registerDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-user-plus me-1"></i>Register
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="registerDropdown">
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/register-donor"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-heart me-2 text-danger"></i>
                          Donor Registration
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/register-staff"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-user-tie me-2 text-success"></i>
                          Staff Registration
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/register-receiver"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <i className="fas fa-hospital-user me-2 text-info"></i>
                          Receiver Registration
                        </Link>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1" style={{ paddingTop: '80px', minHeight: '70vh' }}>
        {shouldShowPublicHomePage ? (
          renderPublicHomePage()
        ) : (
          <div className="container py-4">
            {/* Breadcrumb Navigation */}
            {location.pathname !== '/' && (
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-decoration-none">
                      <i className="fas fa-home me-1"></i>Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-capitalize" aria-current="page">
                    {location.pathname.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ')}
                  </li>
                </ol>
              </nav>
            )}
            
            {/* Page Content */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading content...</p>
              </div>
            ) : (
              <div className="content-wrapper">
                {children}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <h6 className="mb-3">
                <i className="fas fa-tint me-2 text-danger"></i>
                Blood Donation System
              </h6>
              <p className="small text-white-50 mb-3">
                A comprehensive blood management platform developed as a Final Year Project in Computer Science.
              </p>
              <div className="d-flex gap-2">
                <a href="#" className="text-white-50">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-white-50">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-white-50">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
            
            <div className="col-lg-4 mb-4">
              <h6 className="mb-3">Quick Access</h6>
              <div className="row">
                <div className="col-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link to="/login-donor" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>Donor Login
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/login-staff" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>Staff Login
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/login-admin" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>Admin Login
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link to="/emergency-request" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>Emergency
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/about" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>About Us
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/contact" className="text-white-50 text-decoration-none">
                        <i className="fas fa-arrow-right me-1"></i>Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 mb-4">
              <h6 className="mb-3">Contact Information</h6>
              <div className="small text-white-50">
                <p className="mb-2">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Department of Computer Science<br/>
                  The Islamia University of Bahawalpur<br/>
                  Bahawalnagar Campus
                </p>
                <p className="mb-2">
                  <i className="fas fa-phone me-2"></i>
                  Emergency: 115 | Office: (062) 925-0234
                </p>
                <p className="mb-0">
                  <i className="fas fa-envelope me-2"></i>
                  blood.donation@iub.edu.pk
                </p>
              </div>
            </div>
          </div>
          
          <div className="row pt-4 border-top">
            <div className="col-md-6">
              <p className="small mb-0 text-white-50">
                © {new Date().getFullYear()} Blood Donation Management System v2.0
              </p>
              <p className="small text-white-50">
                Developed by: CS Final Year Students
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="small text-white-50 mb-0">
                <i className="fas fa-user-tie me-1"></i>
                Supervisor: Mr. Amir Jamsheed<br/>
                <i className="fas fa-graduation-cap me-1"></i>
                BS Computer Science (2022-2026)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
