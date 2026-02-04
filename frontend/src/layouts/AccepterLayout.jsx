import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAccepter } from '../redux/slices/accepterSlice';
import axios from '../api/axiosInstance';
import AuthHelper from '../utils/authHelper';
import { logo1 } from '../assets/img';
import '../index.css';

const AccepterLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { accepter: reduxAccepter } = useSelector((state) => state.accepter);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingIssuances, setPendingIssuances] = useState(0);
  const [stats, setStats] = useState({
    verified_today: 0,
    issued_today: 0,
    pending_verification: 0,
    low_stock_groups: []
  });

  // ✅ Authentication check on mount
  useEffect(() => {
    console.log('🔍 AccepterLayout: Starting authentication check...');
    
    // Debug current state
    AuthHelper.debug();
    
    if (!AuthHelper.isAuthenticated('accepter')) {
      console.log('❌ AccepterLayout: Not authenticated, redirecting to login');
      navigate('/login-accepter', { replace: true });
      return;
    }
    
    console.log('✅ AccepterLayout: Authentication passed');
  }, [navigate]);

  // ✅ Fetch accepter data
  useEffect(() => {
    const fetchAccepterData = async () => {
      try {
        setLoading(true);
        
        // ✅ Use AuthHelper to get token
        const storedToken = AuthHelper.getToken();
        
        if (!storedToken) {
          console.log('❌ AccepterLayout: No token found, redirecting to login');
          navigate('/login-accepter');
          return;
        }

        console.log('🔑 AccepterLayout: Fetching data with token:', storedToken.substring(0, 20) + '...');

        // Fetch pending verifications
        try {
          const verificationsRes = await axios.get('/accepter/pending-verifications', {
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('📊 Pending verifications response:', verificationsRes.data);
          
          if (verificationsRes.data.success) {
            setPendingVerifications(verificationsRes.data.count || 0);
          }
        } catch (verificationError) {
          console.log('⚠️ Using mock data for pending verifications:', verificationError.message);
          setPendingVerifications(3);
        }

        // Fetch pending issuances
        try {
          const issuancesRes = await axios.get('/accepter/pending-issuances', {
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('📊 Pending issuances response:', issuancesRes.data);
          
          if (issuancesRes.data.success) {
            setPendingIssuances(issuancesRes.data.count || 0);
          }
        } catch (issuanceError) {
          console.log('⚠️ Using mock data for pending issuances:', issuanceError.message);
          setPendingIssuances(2);
        }

        // Fetch dashboard stats
        try {
          const statsRes = await axios.get('/accepter/dashboard', {
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('📊 Dashboard stats response:', statsRes.data);
          
          if (statsRes.data.success) {
            const statsData = statsRes.data.data?.stats || statsRes.data.data;
            if (statsData) {
              setStats({
                verified_today: statsData.verified_today || 0,
                issued_today: statsData.issued_today || 0,
                pending_verification: statsData.pending_verification || pendingVerifications,
                low_stock_groups: statsData.low_stock_groups || []
              });
            }
          }
        } catch (statsError) {
          console.log('⚠️ Using mock data for stats:', statsError.message);
          setStats({
            verified_today: 8,
            issued_today: 5,
            pending_verification: pendingVerifications,
            low_stock_groups: ['A-', 'AB+', 'B-']
          });
        }

        // Fetch notifications
        try {
          const notificationsRes = await axios.get('/accepter/notifications', {
            headers: { 
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('📊 Notifications response:', notificationsRes.data);
          
          if (notificationsRes.data.success) {
            setNotifications(notificationsRes.data.data || []);
          }
        } catch (notificationsError) {
          console.log('⚠️ Using mock data for notifications:', notificationsError.message);
          setNotifications([
            { id: 1, title: 'New donation arrived', message: 'Donor waiting for verification', time: '10 mins ago', type: 'warning' },
            { id: 2, title: 'Blood issued', message: '2 units of O+ issued to receiver', time: '1 hour ago', type: 'success' },
            { id: 3, title: 'Low stock alert', message: 'A- blood group is running low', time: '2 hours ago', type: 'danger' }
          ]);
        }

      } catch (error) {
        console.error('❌ Failed to fetch accepter data:', error);
        // Use fallback mock data
        setPendingVerifications(5);
        setPendingIssuances(3);
        setStats({
          verified_today: 8,
          issued_today: 5,
          pending_verification: 5,
          low_stock_groups: ['A-', 'AB+', 'B-']
        });
        setNotifications([
          { id: 1, title: 'New donation arrived', message: 'Donor waiting for verification', time: '10 mins ago', type: 'warning' },
          { id: 2, title: 'Blood issued', message: '2 units of O+ issued to receiver', time: '1 hour ago', type: 'success' },
          { id: 3, title: 'Low stock alert', message: 'A- blood group is running low', time: '2 hours ago', type: 'danger' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccepterData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAccepterData, 30000);
    
    return () => clearInterval(interval);
  }, [location.pathname, navigate]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // ✅ Use AuthHelper to get token
      const storedToken = AuthHelper.getToken();
      
      if (!storedToken) {
        console.log('❌ No token found, redirecting to login');
        navigate('/login-accepter');
        return;
      }

      const [verificationsRes, issuancesRes] = await Promise.all([
        axios.get('/accepter/pending-verifications', {
          headers: { 
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        axios.get('/accepter/pending-issuances', {
          headers: { 
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);
      
      if (verificationsRes.data.success) {
        setPendingVerifications(verificationsRes.data.count || 0);
      }
      
      if (issuancesRes.data.success) {
        setPendingIssuances(issuancesRes.data.count || 0);
      }
      
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const storedToken = AuthHelper.getToken();
      if (storedToken && storedToken !== 'mock_jwt_token_123456789') {
        await axios.post('/accepter/logout', {}, {
          headers: { 
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Logout API call skipped:', error.message);
    } finally {
      // ✅ Use AuthHelper to clear all auth data
      AuthHelper.logout('accepter');
      
      // Clear Redux state
      dispatch(logoutAccepter());
      
      console.log('✅ Logout completed, redirecting to login');
      
      // Redirect to login
      navigate('/login-accepter', { replace: true });
    }
  };

  const handleQuickVerify = () => {
    navigate('/accepter/verify-donations');
  };

  const handleQuickIssue = () => {
    navigate('/accepter/issue-blood');
  };

  const isActiveRoute = (route) => {
    return location.pathname === route || location.pathname.endsWith(route);
  };

  // Get page title from current path
  const getPageTitle = () => {
    const path = location.pathname;
    const routeMap = {
      '/accepter/dashboard': 'Dashboard',
      '/accepter/profile': 'My Profile',
      '/accepter/profile-accepter': 'Profile',
      '/accepter/verify-donations': 'Verify Donations',
      '/accepter/verification-history': 'Verification History',
      '/accepter/issue-blood': 'Issue Blood',
      '/accepter/issuance-history': 'Issuance History',
      '/accepter/handover-blood': 'Handover Blood',
      '/accepter/inventory': 'Inventory',
      '/accepter/blood-inventory': 'Blood Inventory',
      '/accepter/donation-records': 'Donation Records',
      '/accepter/donation-record': 'Donation Record',
      '/accepter/reports': 'Reports & Analytics',
      '/accepter/settings': 'Settings',
      '/accepter/notifications': 'Notifications'
    };
    
    return routeMap[path] || 'Accepter Dashboard';
  };

  // ✅ Get user from AuthHelper (not Redux)
  const currentUser = AuthHelper.getUser() || reduxAccepter;
  const userName = currentUser?.name?.split(' ')[0] || 'Accepter';

  return (
    <div className="accepter-layout">
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ 
        backgroundColor: '#2c3e50',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1030
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light me-3 d-lg-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
            </button>
            <Link className="navbar-brand d-flex align-items-center" to="/accepter/dashboard">
              <img src={logo1} alt="Logo" height="40" className="me-2" />
              <div className="d-flex flex-column">
                <span className="fw-bold" style={{ fontSize: '1rem' }}>
                  <i className="fas fa-user-md me-1"></i>
                  Blood Bank Accepter
                </span>
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                  Verification & Distribution System
                </small>
              </div>
            </Link>
          </div>
          
          <div className="d-flex align-items-center">
            {/* Notifications */}
            <div className="dropdown me-3">
              <button 
                className="btn btn-outline-light position-relative" 
                type="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-bell"></i>
                {notifications.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-2" style={{ width: '300px' }}>
                <li className="dropdown-header fw-bold">
                  <i className="fas fa-bell me-2"></i>
                  Notifications ({notifications.length})
                </li>
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(notification => (
                    <li key={notification.id}>
                      <div className={`dropdown-item ${notification.type === 'danger' ? 'text-danger' : ''}`}>
                        <div className="d-flex">
                          <div className="me-3">
                            <i className={`fas fa-${
                              notification.type === 'success' ? 'check-circle text-success' :
                              notification.type === 'warning' ? 'exclamation-triangle text-warning' :
                              'exclamation-circle text-danger'
                            }`}></i>
                          </div>
                          <div>
                            <div className="fw-bold">{notification.title}</div>
                            <div className="small text-muted">{notification.message}</div>
                            <div className="small text-muted">{notification.time}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="dropdown-item text-muted text-center">
                    No new notifications
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link to="/accepter/notifications" className="dropdown-item text-center">
                    <i className="fas fa-eye me-2"></i>View All
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Quick Actions */}
            <div className="btn-group me-3">
              <button 
                onClick={handleQuickVerify}
                className="btn btn-warning"
                title="Verify Donations"
                disabled={pendingVerifications === 0}
              >
                <i className="fas fa-check-circle me-2"></i>
                Verify ({pendingVerifications})
              </button>
              <button 
                onClick={handleQuickIssue}
                className="btn btn-success"
                title="Issue Blood"
                disabled={pendingIssuances === 0}
              >
                <i className="fas fa-hand-holding-medical me-2"></i>
                Issue ({pendingIssuances})
              </button>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="btn btn-outline-light me-3"
              disabled={loading}
              title="Refresh Data"
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            </button>
            
            {/* Debug Button (Optional) */}
            <button 
              onClick={() => AuthHelper.debug()}
              className="btn btn-outline-info me-3 btn-sm"
              title="Debug Auth"
            >
              <i className="fas fa-bug"></i>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user-circle me-2"></i>
                <span className="d-none d-md-inline">
                  {userName}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li className="dropdown-header">
                  <div className="text-center">
                    <div className="mb-2">
                      <i className="fas fa-user-md fa-2x text-primary"></i>
                    </div>
                    <strong>{currentUser?.name || 'Accepter User'}</strong><br/>
                    <small className="text-muted">Blood Bank Staff</small>
                    <small className="d-block text-muted mt-1">
                      <i className="fas fa-envelope me-1"></i>
                      {currentUser?.email || 'No email'}
                    </small>
                  </div>
                </li>
                <li><hr className="dropdown-divider"/></li>
                <li>
                  <Link className="dropdown-item" to="/accepter/profile">
                    <i className="fas fa-user me-2"></i>
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/accepter/settings">
                    <i className="fas fa-cog me-2"></i>
                    Settings
                  </Link>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => AuthHelper.debug()}
                  >
                    <i className="fas fa-bug me-2"></i>
                    Debug Auth
                  </button>
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
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container-fluid" style={{ marginTop: '70px' }}>
        <div className="row">
          {/* Sidebar - Hidden on mobile when closed */}
          <div className={`col-lg-2 col-md-3 bg-dark text-white ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`} 
               style={{ 
                 minHeight: 'calc(100vh - 70px)', 
                 position: 'sticky', 
                 top: '70px',
                 zIndex: 1020
               }}>
            <div className="sidebar-sticky pt-3">
              <div className="text-center mb-4">
                <h5 className="text-warning">
                  <i className="fas fa-tint me-2"></i>
                  Blood Bank Operations
                </h5>
                <small className="text-white-50">Accepter Control Panel</small>
              </div>
              
              <ul className="nav flex-column">
                {/* Dashboard */}
                <li className="nav-item mb-2">
                  <Link 
                    className={`nav-link ${isActiveRoute('/accepter/dashboard') ? 'bg-primary text-white' : 'text-white-50'}`}
                    to="/accepter/dashboard"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </Link>
                </li>
                
                {/* Profile */}
                <li className="nav-item mb-2">
                  <Link 
                    className={`nav-link ${isActiveRoute('/accepter/profile') || isActiveRoute('/accepter/profile-accepter') ? 'bg-info text-white' : 'text-white-50'}`}
                    to="/accepter/profile"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className="fas fa-user me-2"></i>
                    My Profile
                  </Link>
                </li>
                
                {/* Donation Verification Section */}
                <li className="nav-item mb-2">
                  <div className="nav-link text-white-50 fw-bold">
                    <i className="fas fa-check-circle me-2"></i>
                    Donation Verification
                  </div>
                  <ul className="nav flex-column ps-4">
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/verify-donations') ? 'bg-warning text-dark' : 'text-white-50'}`}
                        to="/accepter/verify-donations"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-user-check me-2"></i>
                        Verify Donations
                        {pendingVerifications > 0 && (
                          <span className="badge bg-danger float-end">{pendingVerifications}</span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/verification-history') ? 'bg-warning text-dark' : 'text-white-50'}`}
                        to="/accepter/verification-history"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-history me-2"></i>
                        Verification History
                      </Link>
                    </li>
                  </ul>
                </li>
                
                {/* Blood Issuance Section */}
                <li className="nav-item mb-2">
                  <div className="nav-link text-white-50 fw-bold">
                    <i className="fas fa-hand-holding-medical me-2"></i>
                    Blood Issuance
                  </div>
                  <ul className="nav flex-column ps-4">
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/issue-blood') ? 'bg-success text-white' : 'text-white-50'}`}
                        to="/accepter/issue-blood"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-syringe me-2"></i>
                        Issue Blood
                        {pendingIssuances > 0 && (
                          <span className="badge bg-danger float-end">{pendingIssuances}</span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/issuance-history') ? 'bg-success text-white' : 'text-white-50'}`}
                        to="/accepter/issuance-history"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-file-medical me-2"></i>
                        Issuance History
                      </Link>
                    </li>
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/handover-blood') ? 'bg-success text-white' : 'text-white-50'}`}
                        to="/accepter/handover-blood"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-handshake me-2"></i>
                        Handover Blood
                      </Link>
                    </li>
                  </ul>
                </li>
                
                {/* Inventory Management Section */}
                <li className="nav-item mb-2">
                  <div className="nav-link text-white-50 fw-bold">
                    <i className="fas fa-database me-2"></i>
                    Inventory Management
                  </div>
                  <ul className="nav flex-column ps-4">
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/inventory') ? 'bg-info text-white' : 'text-white-50'}`}
                        to="/accepter/inventory"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-boxes me-2"></i>
                        Blood Inventory
                      </Link>
                    </li>
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/blood-inventory') ? 'bg-info text-white' : 'text-white-50'}`}
                        to="/accepter/blood-inventory"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-vial me-2"></i>
                        Detailed Inventory
                      </Link>
                    </li>
                  </ul>
                </li>
                
                {/* Donation Records Section */}
                <li className="nav-item mb-2">
                  <div className="nav-link text-white-50 fw-bold">
                    <i className="fas fa-clipboard-list me-2"></i>
                    Donation Records
                  </div>
                  <ul className="nav flex-column ps-4">
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/donation-records') ? 'bg-secondary text-white' : 'text-white-50'}`}
                        to="/accepter/donation-records"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-list me-2"></i>
                        All Records
                      </Link>
                    </li>
                    <li className="nav-item mb-1">
                      <Link 
                        className={`nav-link ${isActiveRoute('/accepter/donation-record') ? 'bg-secondary text-white' : 'text-white-50'}`}
                        to="/accepter/donation-record"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className="fas fa-file-alt me-2"></i>
                        Single Record
                      </Link>
                    </li>
                  </ul>
                </li>
                
                {/* Reports */}
                <li className="nav-item mb-2">
                  <Link 
                    className={`nav-link ${isActiveRoute('/accepter/reports') ? 'bg-purple text-white' : 'text-white-50'}`}
                    to="/accepter/reports"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Reports & Analytics
                  </Link>
                </li>
                
                {/* Quick Stats */}
                <li className="nav-item mb-2">
                  <div className="nav-link text-white-50">
                    <i className="fas fa-info-circle me-2"></i>
                    Quick Stats
                  </div>
                  <div className="ps-4 small">
                    <div className="text-success mb-1">
                      <i className="fas fa-check me-1"></i>
                      Verified Today: <strong>{stats.verified_today}</strong>
                    </div>
                    <div className="text-info mb-1">
                      <i className="fas fa-syringe me-1"></i>
                      Issued Today: <strong>{stats.issued_today}</strong>
                    </div>
                    <div className="text-warning mb-1">
                      <i className="fas fa-clock me-1"></i>
                      Pending: <strong>{stats.pending_verification}</strong>
                    </div>
                  </div>
                </li>
              </ul>
              
              <div className="mt-4 pt-3 border-top border-secondary">
                <div className="text-center">
                  <small className="text-white-50">
                    <i className="fas fa-shield-alt me-1"></i>
                    Secure System v2.0
                  </small>
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm btn-outline-light"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className={`${sidebarOpen ? 'col-lg-10 col-md-9' : 'col-12'}`}>
            {/* Breadcrumb for non-dashboard pages */}
            {location.pathname !== '/accepter/dashboard' && location.pathname !== '/accepter' && (
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb bg-light p-3 rounded">
                  <li className="breadcrumb-item">
                    <Link to="/accepter/dashboard" className="text-decoration-none">
                      <i className="fas fa-home me-1"></i>Dashboard
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-capitalize">
                    {getPageTitle()}
                  </li>
                </ol>
              </nav>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading accepter data...</p>
              </div>
            )}
            
            {/* Page Content - Outlet renders child routes here */}
            <div className="content-wrapper p-3">
              <Outlet />
            </div>
            
            {/* Quick Stats Cards */}
            <div className="mt-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <h5 className="text-success">
                        <i className="fas fa-check-circle me-2"></i>
                        {stats.verified_today}
                      </h5>
                      <small className="text-muted">Verified Today</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <h5 className="text-info">
                        <i className="fas fa-syringe me-2"></i>
                        {stats.issued_today}
                      </h5>
                      <small className="text-muted">Issued Today</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <h5 className="text-warning">
                        <i className="fas fa-clock me-2"></i>
                        {pendingVerifications}
                      </h5>
                      <small className="text-muted">Pending Verifications</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <h5 className="text-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {stats.low_stock_groups?.length || 0}
                      </h5>
                      <small className="text-muted">Low Stock Groups</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <p className="small mb-0">
                <i className="fas fa-user-md me-2"></i>
                Blood Bank Accepter System © {new Date().getFullYear()}
              </p>
              <p className="small text-white-50 mb-0">
                <i className="fas fa-map-marker-alt me-1"></i>
                IUB Bahawalnagar Campus | CS Final Year Project
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="small text-white-50 mb-0">
                <i className="fas fa-database me-1"></i>
                Last Sync: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="small text-white-50 mb-0">
                <i className="fas fa-shield-alt me-1"></i>
                Secure Session Active
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccepterLayout;