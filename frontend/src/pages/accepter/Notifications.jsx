import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, warning, success, danger

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/accepter/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (err) {
      console.log('Using mock data for notifications:', err.message);
      // Mock data if API fails
      setNotifications([
        { id: 1, title: 'New donation arrived', message: 'Donor waiting for verification', time: '10 mins ago', type: 'warning', read: false, created_at: new Date().toISOString() },
        { id: 2, title: 'Blood issued', message: '2 units of O+ issued to receiver', time: '1 hour ago', type: 'success', read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, title: 'Low stock alert', message: 'A- blood group is running low', time: '2 hours ago', type: 'danger', read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, title: 'System Maintenance', message: 'Scheduled maintenance on Saturday', time: '1 day ago', type: 'info', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 5, title: 'New feature added', message: 'Report generation feature is now available', time: '2 days ago', type: 'success', read: true, created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/accepter/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.log('Mark as read failed:', err.message);
      // Update locally anyway
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/accepter/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.log('Mark all as read failed:', err.message);
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/accepter/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (err) {
      console.log('Delete notification failed:', err.message);
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return 'fas fa-check-circle text-success';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'danger': return 'fas fa-exclamation-circle text-danger';
      case 'info': return 'fas fa-info-circle text-info';
      default: return 'fas fa-bell text-secondary';
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'success': return 'badge bg-success';
      case 'warning': return 'badge bg-warning';
      case 'danger': return 'badge bg-danger';
      case 'info': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
      return date.toLocaleDateString();
    } catch {
      return timeString;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'read' && !notif.read) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="accepter-notifications">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="fas fa-bell me-2"></i>
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h4>
          
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-light"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <i className="fas fa-check-double me-1"></i>
              Mark All Read
            </button>
            <button 
              className="btn btn-sm btn-outline-light"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              <i className="fas fa-trash me-1"></i>
              Clear All
            </button>
          </div>
        </div>
        
        <div className="card-body p-0">
          {/* Filters */}
          <div className="bg-light p-3 border-bottom">
            <div className="row">
              <div className="col-md-6 mb-2">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filter === 'unread' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setFilter('unread')}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${filter === 'read' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFilter('read')}
                  >
                    Read ({notifications.length - unreadCount})
                  </button>
                </div>
              </div>
              
              <div className="col-md-6">
                <select
                  className="form-select form-select-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
              <h5>No notifications found</h5>
              <p className="text-muted">
                {filter === 'all' ? 'You have no notifications yet.' : 'No notifications match your filters.'}
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <div className="me-3 mt-1">
                        <i className={`${getTypeIcon(notification.type)} fa-lg`}></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="mb-0 me-2">{notification.title}</h6>
                          <span className={getTypeBadge(notification.type)}>
                            {notification.type}
                          </span>
                        </div>
                        <p className="mb-1 text-muted">{notification.message}</p>
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          {formatTime(notification.created_at || notification.time)}
                        </small>
                      </div>
                    </div>
                    
                    <div className="btn-group btn-group-sm">
                      {!notification.read && (
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {!notification.read && (
                    <span className="position-absolute top-50 start-0 translate-middle-y">
                      <span className="badge bg-warning rounded-pill" style={{ marginLeft: '-5px' }}></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card-footer text-muted small d-flex justify-content-between">
          <div>
            <i className="fas fa-info-circle me-1"></i>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
          <div>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchNotifications}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;