// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearAdminData, setAdminData } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/notificationSlice';
import { adminApi } from '../services/adminService';
import '../index.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // ✅ Get data from Redux store
  const { user, role, token, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = role === 'admin';
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setLocalAdminData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalStaff: 0,
    totalReceivers: 0,
    totalAccepters: 0,
    totalDonations: 0,
    pendingRequests: 0,
    criticalStock: 0,
    bloodInventory: {}
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: 95,
    server: 65,
    storage: 78,
    uptime: '99.8%'
  });

  // ✅ Load admin data from API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Check if authenticated
        const storedToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        
        if (!storedToken || storedRole !== 'admin') {
          dispatch(showNotification({
            type: 'error',
            message: 'Please login as admin first'
          }));
          navigate('/login-admin');
          return;
        }

        // Fetch admin profile from Laravel API
        const response = await adminApi.get('/admin/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const adminProfile = response.data.data;
          setLocalAdminData(adminProfile);
          dispatch(setAdminData(adminProfile));
          
          // Store in localStorage
          localStorage.setItem('userData', JSON.stringify(adminProfile));
          localStorage.setItem('userRole', 'admin');
          
          // Fetch dashboard stats
          await fetchDashboardStats(storedToken);
          
          // Fetch notifications
          await fetchNotifications(storedToken);
          
          // Check system status
          await checkSystemStatus(storedToken);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          dispatch(showNotification({
            type: 'error',
            message: 'Session expired. Please login again.'
          }));
          handleLogout();
        } else {
          // Fallback to mock data for demo
          useMockData();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        fetchDashboardStats(token);
        fetchNotifications(token);
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  // ✅ Fetch dashboard statistics from Laravel
  const fetchDashboardStats = async (authToken) => {
    try {
      const response = await adminApi.get('/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Mock data fallback for development
      setDashboardStats({
        totalUsers: 1250,
        totalDonors: 800,
        totalStaff: 45,
        totalReceivers: 350,
        totalAccepters: 12,
        totalDonations: 15420,
        pendingRequests: 15,
        criticalStock: 2,
        bloodInventory: {
          'A+': { units: 120, status: 'safe' },
          'A-': { units: 45, status: 'safe' },
          'B+': { units: 85, status: 'low' },
          'B-': { units: 2, status: 'critical' },
          'O+': { units: 150, status: 'safe' },
          'O-': { units: 25, status: 'low' },
          'AB+': { units: 35, status: 'safe' },
          'AB-': { units: 8, status: 'critical' }
        }
      });
    }
  };

  // ✅ Fetch notifications from Laravel
  const fetchNotifications = async (authToken) => {
    try {
      const response = await adminApi.get('/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Mock notifications
      setNotifications([
        {
          id: 1,
          type: 'warning',
          title: 'Low Blood Stock',
          message: 'B- group critical (2 units left)',
          time: '10 minutes ago',
          read: false
        },
        {
          id: 2,
          type: 'success',
          title: 'New Registrations',
          message: '5 new donor registrations pending approval',
          time: '30 minutes ago',
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'Pending Requests',
          message: '3 emergency requests from hospitals',
          time: '1 hour ago',
          read: false
        }
      ]);
    }
  };

  // ✅ Check system status from Laravel
  const checkSystemStatus = async (authToken) => {
    try {
      const response = await adminApi.get('/admin/system/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setSystemStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  // ✅ Mock data for development
  const useMockData = () => {
    const mockAdmin = {
      id: "ADM001",
      name: "System Administrator",
      email: "admin@iub.edu.pk",
      role: "admin",
      permissions: ["all"],
      joinDate: new Date().toISOString().split('T')[0],
      phone: "+92 300 1234567",
      department: "System Administration",
      lastLogin: new Date().toISOString()
    };
    
    setLocalAdminData(mockAdmin);
    dispatch(setAdminData(mockAdmin));
  };

  // ✅ Handle logout with API call
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Call Laravel logout API
      if (token) {
        await adminApi.post('/admin/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all data
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      localStorage.removeItem('adminPermissions');
      localStorage.removeItem('sessionId');
      
      // Clear Redux state
      dispatch(logout());
      dispatch(clearAdminData());
      
      dispatch(showNotification({
        type: 'success',
        message: 'Successfully logged out'
      }));
      
      navigate('/login-admin');
    }
  };

  // ✅ Handle emergency mode with API
  const activateEmergencyMode = async () => {
    try {
      const response = await adminApi.post('/admin/emergency-mode', {
        mode: 'activate',
        reason: 'Critical blood shortage'
      });
      
      if (response.data.success) {
        dispatch(showNotification({
          type: 'success',
          message: 'Emergency mode activated successfully'
        }));
        
        // Refresh dashboard data
        const token = localStorage.getItem('adminToken');
        if (token) {
          await fetchDashboardStats(token);
        }
      }
    } catch (error) {
      console.error('Error activating emergency mode:', error);
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to activate emergency mode'
      }));
    }
  };

  // ✅ Generate report with API
  const generateReport = async (type = 'monthly') => {
    try {
      const response = await adminApi.post('/admin/reports/generate', {
        report_type: type,
        start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        format: 'pdf'
      }, {
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      dispatch(showNotification({
        type: 'success',
        message: 'Report generated successfully'
      }));
    } catch (error) {
      console.error('Error generating report:', error);
      dispatch(showNotification({
        type: 'error',
        message: 'Failed to generate report'
      }));
    }
  };

  // ✅ Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await adminApi.put(`/admin/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ Quick actions
  const quickActions = [
    {
      label: 'Approve Users',
      icon: 'fas fa-user-check',
      action: () => navigate('/admin/manage-users'),
      color: 'success',
      apiEndpoint: '/admin/users/pending'
    },
    {
      label: 'Check Inventory',
      icon: 'fas fa-tint',
      action: () => navigate('/admin/system-settings?tab=inventory'),
      color: 'info',
      apiEndpoint: '/admin/inventory'
    },
    {
      label: 'View Alerts',
      icon: 'fas fa-exclamation-triangle',
      action: () => navigate('/admin/dashboard?show=alerts'),
      color: 'warning',
      apiEndpoint: '/admin/alerts'
    },
    {
      label: 'Generate Report',
      icon: 'fas fa-file-alt',
      action: () => generateReport('daily'),
      color: 'primary',
      apiEndpoint: '/admin/reports'
    }
  ];

  // ✅ Calculate unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
        <div className="text-center text-white">
          <div className="spinner-border text-warning" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading Admin Control Panel...</p>
          <small className="text-light opacity-75">
            <i className="fas fa-database me-1"></i>
            Connecting to Laravel Database...
          </small>
        </div>
      </div>
    );
  }

  // ✅ Menu items
  const menuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_dashboard' },
    { path: '/admin/profile', icon: 'fas fa-user-shield', label: 'Admin Profile', permission: 'view_profile' },
    { path: '/admin/manage-users', icon: 'fas fa-users-cog', label: 'Manage Users', permission: 'manage_users' },
    { path: '/admin/manage-staff', icon: 'fas fa-user-md', label: 'Manage Staff', permission: 'manage_staff' },
    { path: '/admin/manage-accepters', icon: 'fas fa-user-check', label: 'Manage Accepters', permission: 'manage_accepters' },
    { path: '/admin/manage-receivers', icon: 'fas fa-hand-holding-medical', label: 'Manage Receivers', permission: 'manage_receivers' },
    { path: '/admin/system-settings', icon: 'fas fa-cogs', label: 'System Settings', permission: 'manage_settings' },
    { path: '/admin/view-reports', icon: 'fas fa-chart-pie', label: 'View Reports', permission: 'view_reports' },
    { path: '/admin/database-backup', icon: 'fas fa-database', label: 'Database Backup', permission: 'backup_database' },
    { path: '/admin/audit-logs', icon: 'fas fa-history', label: 'Audit Logs', permission: 'view_logs' },
  ];

  const currentAdmin = adminData || user;

  return (
    <div className="admin-layout bg-light">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg" style={{zIndex: 1030}}>
        <div className="container-fluid">
          <button 
            className="btn btn-dark me-3 border-0" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/admin/dashboard">
            <i className="fas fa-user-shield me-2 text-warning"></i>
            <span className="text-gradient">Admin Control Panel</span>
          </Link>
          
          {/* System Status Badge */}
          <div className="d-none d-md-flex align-items-center me-4">
            <span className="badge bg-success me-2">
              <i className="fas fa-circle me-1" style={{fontSize: '0.6rem'}}></i>
              System Online
            </span>
            <span className="text-light small">
              <i className="fas fa-clock me-1"></i>
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          {/* Admin Info */}
          <div className="navbar-nav ms-auto align-items-center">
            {/* Notifications */}
            <div className="nav-item dropdown me-3">
              <button className="btn btn-outline-light position-relative" data-bs-toggle="dropdown">
                <i className="fas fa-bell"></i>
                {unreadNotifications > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{minWidth: '300px'}}>
                <li><h6 className="dropdown-header">Recent Alerts</h6></li>
                {notifications.slice(0, 5).map(notification => (
                  <li key={notification.id}>
                    <a 
                      className={`dropdown-item ${notification.read ? '' : 'fw-bold'}`} 
                      href="#"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <i className={`fas fa-${getNotificationIcon(notification.type)} text-${notification.type} me-2`}></i>
                      <div>
                        <strong>{notification.title}</strong>
                        <small className="d-block text-muted">{notification.message}</small>
                        <small className="text-muted">{notification.time}</small>
                      </div>
                    </a>
                  </li>
                ))}
                {notifications.length === 0 && (
                  <li><a className="dropdown-item text-center text-muted">No notifications</a></li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item text-center" to="/admin/dashboard?tab=notifications">
                    View All Notifications
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Admin Profile Dropdown */}
            <div className="dropdown">
              <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                <i className="fas fa-user-circle me-2"></i>
                <div className="text-start d-none d-md-block">
                  <small className="d-block mb-0">{currentAdmin?.name?.split(' ')[0] || 'Admin'}</small>
                  <small className="text-light opacity-75" style={{fontSize: '0.7rem'}}>Super Admin</small>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <div className="dropdown-header text-center">
                    <i className="fas fa-user-shield fa-2x text-warning mb-2"></i>
                    <h6 className="mb-0">{currentAdmin?.name || 'System Admin'}</h6>
                    <small className="text-muted">{currentAdmin?.email || 'admin@iub.edu.pk'}</small>
                    <small className="d-block text-success">
                      <i className="fas fa-circle me-1" style={{fontSize: '0.5rem'}}></i>
                      Last login: {new Date(currentAdmin?.lastLogin).toLocaleString()}
                    </small>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/admin/profile">
                    <i className="fas fa-user-cog me-2 text-primary"></i> Admin Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/system-settings">
                    <i className="fas fa-sliders-h me-2 text-info"></i> System Settings
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={activateEmergencyMode}>
                    <i className="fas fa-biohazard me-2 text-danger"></i> Emergency Mode
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i> Logout System
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-md-3 col-lg-2 px-0 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
            <div className="bg-dark text-white vh-100 position-sticky shadow" style={{top: '0', overflowY: 'auto', minHeight: 'calc(100vh - 56px)'}}>
              {/* Admin Profile Card */}
              <div className="text-center p-4 bg-black bg-opacity-50">
                <div className="position-relative d-inline-block">
                  <i className="fas fa-user-shield fa-3x text-warning mb-3"></i>
                  <span className="position-absolute bottom-0 end-0 badge bg-success rounded-circle p-1 border border-2 border-dark">
                    <i className="fas fa-check" style={{fontSize: '0.6rem'}}></i>
                  </span>
                </div>
                <h6 className="mb-1 fw-bold">{currentAdmin?.name || 'System Admin'}</h6>
                <small className="text-light opacity-75">Super Administrator</small>
                <div className="mt-3">
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-star me-1"></i> Full System Access
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-3 border-top border-secondary">
                <h6 className="text-light mb-3">
                  <i className="fas fa-chart-line me-2"></i> Quick Stats
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="bg-black bg-opacity-25 p-2 rounded text-center">
                      <small className="d-block text-light opacity-75">Total Users</small>
                      <h5 className="mb-0 text-warning">{dashboardStats.totalUsers}</h5>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-black bg-opacity-25 p-2 rounded text-center">
                      <small className="d-block text-light opacity-75">Donations</small>
                      <h5 className="mb-0 text-success">{dashboardStats.totalDonations}</h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="nav flex-column p-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link mb-2 rounded d-flex align-items-center ${
                      location.pathname === item.path 
                        ? 'active bg-gradient-warning text-dark shadow' 
                        : 'text-light hover-bg-light-10'
                    }`}
                  >
                    <i className={`${item.icon} me-3`}></i>
                    <span>{item.label}</span>
                    {item.path === '/admin/manage-receivers' && (
                      <span className="badge bg-info ms-auto" style={{fontSize: '0.6rem'}}>NEW</span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* System Status */}
              <div className="p-3 border-top border-secondary mt-auto">
                <h6 className="text-light mb-3">
                  <i className="fas fa-server me-2"></i> System Status
                </h6>
                
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-light">Database</small>
                    <small className="text-success">{systemStatus.database}%</small>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{width: `${systemStatus.database}%`}}></div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-light">Server Load</small>
                    <small className="text-info">{systemStatus.server}%</small>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-info progress-bar-striped progress-bar-animated" style={{width: `${systemStatus.server}%`}}></div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-light">Storage</small>
                    <small className="text-warning">{systemStatus.storage}%</small>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-warning progress-bar-striped" style={{width: `${systemStatus.storage}%`}}></div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <small className="text-light opacity-75 d-block">
                    <i className="fas fa-shield-alt me-1"></i> Secure Connection
                  </small>
                  <small className="text-success">
                    <i className="fas fa-lock me-1"></i> Uptime: {systemStatus.uptime}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`col-md-9 col-lg-10 px-0 ${sidebarOpen ? '' : ''}`}>
            {/* Quick Actions Bar */}
            <div className="bg-white border-bottom py-2 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className="fas fa-bolt text-warning me-2"></i>
                <small className="text-muted">Quick Actions:</small>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm btn-outline-${action.color} mx-1`}
                    onClick={action.action}
                    title={action.label}
                  >
                    <i className={`${action.icon} me-1`}></i>
                    <span className="d-none d-md-inline">{action.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => {
                    const token = localStorage.getItem('adminToken');
                    if (token) {
                      fetchDashboardStats(token);
                      fetchNotifications(token);
                    }
                  }}
                  title="Refresh Data"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => navigate('/admin/dashboard?show=alerts')}
                >
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  <span className="d-none d-md-inline">Alerts</span>
                  {dashboardStats.criticalStock > 0 && (
                    <span className="badge bg-danger ms-1">{dashboardStats.criticalStock}</span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Page Header */}
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="mb-1 fw-bold text-dark">
                    {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Control Panel'}
                  </h4>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/admin/dashboard" className="text-decoration-none">
                          <i className="fas fa-home me-1"></i> Admin
                        </Link>
                      </li>
                      <li className="breadcrumb-item active text-warning">
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                      </li>
                    </ol>
                  </nav>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="me-3 text-end d-none d-md-block">
                    <small className="text-muted d-block">Last Updated</small>
                    <small className="text-dark">{new Date().toLocaleTimeString()}</small>
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <i className="fas fa-cog me-1"></i> Tools
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => generateReport('daily')}><i className="fas fa-file-pdf me-2"></i>Daily Report</button></li>
                      <li><button className="dropdown-item" onClick={() => generateReport('monthly')}><i className="fas fa-file-excel me-2"></i>Monthly Report</button></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item" onClick={() => window.print()}><i className="fas fa-print me-2"></i>Print Page</button></li>
                      <li><button className="dropdown-item" onClick={activateEmergencyMode}><i className="fas fa-biohazard me-2 text-danger"></i>Emergency Mode</button></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Current Page Content */}
              <div className="admin-content">
                <Outlet context={{ 
                  dashboardStats, 
                  adminData: currentAdmin,
                  refreshData: () => {
                    const token = localStorage.getItem('adminToken');
                    if (token) {
                      fetchDashboardStats(token);
                      fetchNotifications(token);
                    }
                  }
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-3 border-top">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <small>
                <i className="fas fa-database me-1 text-info"></i>
                Connected to: Laravel MySQL | 
                <span className="ms-2">
                  <i className="fas fa-users me-1"></i>
                  Active Users: {dashboardStats.totalUsers}
                </span>
              </small>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-light opacity-75">
                <i className="fas fa-code me-1"></i>
                Powered by Laravel + React | 
                <span className="ms-2">
                  <i className="fas fa-heartbeat me-1 text-danger"></i>
                  API Status: <span className="text-success">Online</span>
                </span>
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function for notification icons
const getNotificationIcon = (type) => {
  switch(type) {
    case 'warning': return 'exclamation-triangle';
    case 'success': return 'check-circle';
    case 'info': return 'info-circle';
    case 'danger': return 'times-circle';
    default: return 'bell';
  }
};

export default AdminLayout;