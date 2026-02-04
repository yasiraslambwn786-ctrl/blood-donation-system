import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import UserDetailsModal from './UserDetailsModal';

const ManageUsers = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    donors: 0,
    staff: 0,
    admins: 0,
    receivers: 0,
    accepters: 0
  });

  const API_BASE = 'http://127.0.0.1:8000/api';
  
  const getHeaders = () => ({
    'Authorization': `Bearer ${token || localStorage.getItem('token') || localStorage.getItem('adminToken')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page: page,
        per_page: perPage,
        role: selectedRole !== 'all' ? selectedRole : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        search: searchTerm
      };

      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: getHeaders(),
        params: params
      });

      if (response.data.success) {
        setUsers(response.data.users.data || response.data.users || []);
        setFilteredUsers(response.data.users.data || response.data.users || []);
        
        // Set pagination
        if (response.data.users.meta) {
          setCurrentPage(response.data.users.meta.current_page);
          setTotalPages(response.data.users.meta.last_page);
        }
        
        // Set stats
        if (response.data.summary) {
          setStats(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Fallback to mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const setMockData = () => {
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'donor',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        last_login_at: '2024-01-27T09:15:00Z'
      },
      {
        id: 2,
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        phone: '+1234567891',
        role: 'staff',
        status: 'active',
        created_at: '2024-01-10T14:20:00Z',
        last_login_at: '2024-01-27T08:45:00Z'
      },
      {
        id: 3,
        name: 'Dr. Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '+1234567892',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-05T11:10:00Z',
        last_login_at: '2024-01-27T10:20:00Z'
      },
      {
        id: 4,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567893',
        role: 'donor',
        status: 'inactive',
        created_at: '2024-01-20T16:40:00Z',
        last_login_at: '2024-01-25T14:30:00Z'
      },
      {
        id: 5,
        name: 'Emily Brown',
        email: 'emily@example.com',
        phone: '+1234567894',
        role: 'receiver',
        status: 'pending',
        created_at: '2024-01-22T09:15:00Z',
        last_login_at: null
      },
      {
        id: 6,
        name: 'Robert Wilson',
        email: 'robert@example.com',
        phone: '+1234567895',
        role: 'accepter',
        status: 'active',
        created_at: '2024-01-18T13:25:00Z',
        last_login_at: '2024-01-27T11:05:00Z'
      },
      {
        id: 7,
        name: 'Lisa Taylor',
        email: 'lisa@example.com',
        phone: '+1234567896',
        role: 'donor',
        status: 'suspended',
        created_at: '2024-01-12T15:50:00Z',
        last_login_at: '2024-01-20T12:15:00Z'
      },
      {
        id: 8,
        name: 'David Lee',
        email: 'david@example.com',
        phone: '+1234567897',
        role: 'staff',
        status: 'active',
        created_at: '2024-01-08T10:05:00Z',
        last_login_at: '2024-01-27T09:30:00Z'
      },
      {
        id: 9,
        name: 'Maria Garcia',
        email: 'maria@example.com',
        phone: '+1234567898',
        role: 'donor',
        status: 'active',
        created_at: '2024-01-25T14:15:00Z',
        last_login_at: '2024-01-27T08:20:00Z'
      },
      {
        id: 10,
        name: 'James Miller',
        email: 'james@example.com',
        phone: '+1234567899',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-03T11:45:00Z',
        last_login_at: '2024-01-27T10:45:00Z'
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setStats({
      total: 10,
      donors: 4,
      staff: 2,
      admins: 2,
      receivers: 1,
      accepters: 1
    });
    setTotalPages(1);
  };

  // Update user status
  const updateUserStatus = async (userId, newStatus, reason = '') => {
    try {
      const response = await axios.put(
        `${API_BASE}/admin/users/${userId}/status`,
        {
          status: newStatus,
          reason: reason
        },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Update local state
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        alert(`User status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE}/admin/users/${userId}`,
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Remove from local state
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let result = users;

    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(user => user.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(result);
  }, [users, selectedRole, selectedStatus, searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, selectedRole, selectedStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'staff': return 'primary';
      case 'donor': return 'success';
      case 'receiver': return 'info';
      case 'accepter': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'light';
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At', 'Last Login'];
    const csvRows = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.phone || '',
        user.role,
        user.status,
        formatDate(user.created_at),
        formatDate(user.last_login_at)
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && users.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading Users...</h4>
          <p className="text-muted">Fetching user data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1">
                    <i className="fas fa-users-cog me-2 text-primary"></i>
                    User Management
                  </h2>
                  <p className="text-muted mb-0">
                    Manage all system users, roles, and permissions
                  </p>
                </div>
                <div>
                  <Link to="/admin/users/new" className="btn btn-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Add New User
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-primary border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Users</h6>
                  <h2 className="mb-0">{stats.total}</h2>
                </div>
                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-users fa-lg text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-success border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Donors</h6>
                  <h2 className="mb-0">{stats.donors}</h2>
                </div>
                <div className="avatar-sm bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-hand-holding-heart fa-lg text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-info border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Staff</h6>
                  <h2 className="mb-0">{stats.staff}</h2>
                </div>
                <div className="avatar-sm bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-user-md fa-lg text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-warning border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Admins</h6>
                  <h2 className="mb-0">{stats.admins}</h2>
                </div>
                <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-user-shield fa-lg text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-secondary border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Receivers</h6>
                  <h2 className="mb-0">{stats.receivers}</h2>
                </div>
                <div className="avatar-sm bg-secondary bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-user-injured fa-lg text-secondary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div className="card border-start border-dark border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Accepters</h6>
                  <h2 className="mb-0">{stats.accepters}</h2>
                </div>
                <div className="avatar-sm bg-dark bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-user-check fa-lg text-dark"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="donor">Donor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="receiver">Receiver</option>
                    <option value="accepter">Accepter</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <div className="col-md-2">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary w-50"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedRole('all');
                        setSelectedStatus('all');
                      }}
                    >
                      <i className="fas fa-filter"></i>
                    </button>
                    
                    <button 
                      className="btn btn-success w-50"
                      onClick={handleExportCSV}
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <small className="text-muted">
                  Showing {filteredUsers.length} of {users.length} users
                  {selectedRole !== 'all' && ` (Filtered by: ${selectedRole})`}
                  {selectedStatus !== 'all' && ` (Status: ${selectedStatus})`}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Users List
              </h5>
            </div>
            
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <span className="badge bg-light text-dark">
                              #{user.id}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="fas fa-user text-primary"></i>
                              </div>
                              <div>
                                <h6 className="mb-0">{user.name}</h6>
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {user.phone ? (
                              <a href={`tel:${user.phone}`} className="text-decoration-none">
                                <i className="fas fa-phone me-1 text-muted"></i>
                                {user.phone}
                              </a>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                              <i className="fas fa-user-tag me-1"></i>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(user.created_at)}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(user.last_login_at)}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => handleViewDetails(user)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              
                              <button 
                                className="btn btn-outline-secondary"
                                title="Edit User"
                                onClick={() => alert(`Edit user ${user.id}`)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              
                              <div className="dropdown">
                                <button 
                                  className="btn btn-outline-warning dropdown-toggle" 
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  title="Change Status"
                                >
                                  <i className="fas fa-exchange-alt"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => updateUserStatus(user.id, 'active', 'Manual update')}
                                    >
                                      <i className="fas fa-check-circle text-success me-2"></i>
                                      Set Active
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => updateUserStatus(user.id, 'inactive', 'Manual update')}
                                    >
                                      <i className="fas fa-ban text-warning me-2"></i>
                                      Set Inactive
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => updateUserStatus(user.id, 'suspended', 'Manual update')}
                                    >
                                      <i className="fas fa-lock text-danger me-2"></i>
                                      Suspend
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={() => deleteUser(user.id)}
                                    >
                                      <i className="fas fa-trash me-2"></i>
                                      Delete User
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <i className="fas fa-users fa-3x text-muted mb-3"></i>
                          <h5>No users found</h5>
                          <p className="text-muted">
                            {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
                              ? 'Try changing your search filters' 
                              : 'No users registered in the system'}
                          </p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedRole('all');
                              setSelectedStatus('all');
                            }}
                          >
                            <i className="fas fa-redo me-2"></i>
                            Reset Filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Page {currentPage} of {totalPages} • {filteredUsers.length} users
                    </small>
                  </div>
                  <div>
                    <nav aria-label="User pagination">
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2 text-warning"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link to="/admin/users/new" className="card text-decoration-none text-center h-100 border-primary hover-shadow">
                    <div className="card-body py-4">
                      <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle p-3 mb-3 mx-auto">
                        <i className="fas fa-user-plus fa-2x text-primary"></i>
                      </div>
                      <h6 className="card-title mb-2">Add New User</h6>
                      <p className="text-muted small mb-0">Create new user account</p>
                    </div>
                  </Link>
                </div>
                
                <div className="col-md-3">
                  <div className="card text-decoration-none text-center h-100 border-success hover-shadow">
                    <div className="card-body py-4">
                      <div className="avatar-lg bg-success bg-opacity-10 rounded-circle p-3 mb-3 mx-auto">
                        <i className="fas fa-file-export fa-2x text-success"></i>
                      </div>
                      <h6 className="card-title mb-2">Export Data</h6>
                      <p className="text-muted small mb-0">Export users to CSV/Excel</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card text-decoration-none text-center h-100 border-warning hover-shadow">
                    <div className="card-body py-4">
                      <div className="avatar-lg bg-warning bg-opacity-10 rounded-circle p-3 mb-3 mx-auto">
                        <i className="fas fa-user-check fa-2x text-warning"></i>
                      </div>
                      <h6 className="card-title mb-2">Bulk Actions</h6>
                      <p className="text-muted small mb-0">Mass update user status</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <Link to="/admin/audit-logs" className="card text-decoration-none text-center h-100 border-info hover-shadow">
                    <div className="card-body py-4">
                      <div className="avatar-lg bg-info bg-opacity-10 rounded-circle p-3 mb-3 mx-auto">
                        <i className="fas fa-history fa-2x text-info"></i>
                      </div>
                      <h6 className="card-title mb-2">View Logs</h6>
                      <p className="text-muted small mb-0">Check user activity logs</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={updateUserStatus}
          onDelete={deleteUser}
        />
      )}
    </div>
  );
};

export default ManageUsers;