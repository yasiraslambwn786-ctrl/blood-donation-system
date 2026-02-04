import React, { useState } from 'react';

const UserDetailsModal = ({ user, onClose, onUpdateStatus, onDelete }) => {
  const [newStatus, setNewStatus] = useState(user.status);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const handleStatusUpdate = async () => {
    if (newStatus === user.status) {
      alert('Status is already set to this value');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for status change');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStatus(user.id, newStatus, reason);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      onDelete(user.id);
      onClose();
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'System Administrator with full access';
      case 'staff': return 'Hospital/Blood bank staff member';
      case 'donor': return 'Blood donor';
      case 'receiver': return 'Blood receiver/patient';
      case 'accepter': return 'Blood acceptance staff';
      default: return 'System user';
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user me-2"></i>
              User Details: {user.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              <div className="col-md-4 text-center mb-4">
                <div className="avatar-xl bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto" 
                     style={{width: '120px', height: '120px'}}>
                  <i className="fas fa-user fa-3x text-primary"></i>
                </div>
                <h4>{user.name}</h4>
                <span className={`badge bg-${getRoleBadgeColor(user.role)} fs-6`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <div className="mt-2">
                  <span className={`badge bg-${getStatusBadgeColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="col-md-8">
                <div className="row">
                  <div className="col-12 mb-3">
                    <h6>
                      <i className="fas fa-info-circle me-2 text-primary"></i>
                      Basic Information
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>User ID:</strong></td>
                            <td>#{user.id}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{user.email}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{user.phone || 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td><strong>Role:</strong></td>
                            <td>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              <small className="text-muted d-block">{getRoleDescription(user.role)}</small>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <h6>
                      <i className="fas fa-history me-2 text-primary"></i>
                      Account History
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Account Created:</strong></td>
                            <td>{formatDate(user.created_at)}</td>
                          </tr>
                          <tr>
                            <td><strong>Last Login:</strong></td>
                            <td>{formatDate(user.last_login_at) || 'Never logged in'}</td>
                          </tr>
                          <tr>
                            <td><strong>Account Status:</strong></td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <h6>
                      <i className="fas fa-cog me-2 text-primary"></i>
                      Manage User
                    </h6>
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Change Status</label>
                            <select 
                              className="form-select"
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label">Reason for Change</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter reason..."
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                          
                          <div className="col-12">
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-primary"
                                onClick={handleStatusUpdate}
                                disabled={isSubmitting || !reason.trim()}
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-save me-2"></i>
                                    Update Status
                                  </>
                                )}
                              </button>
                              
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                  setNewStatus(user.status);
                                  setReason('');
                                }}
                              >
                                <i className="fas fa-redo me-2"></i>
                                Reset
                              </button>
                              
                              <button 
                                className="btn btn-danger ms-auto"
                                onClick={handleDelete}
                              >
                                <i className="fas fa-trash me-2"></i>
                                Delete User
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times me-2"></i>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={() => alert(`Edit user ${user.id}`)}>
              <i className="fas fa-edit me-2"></i>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;