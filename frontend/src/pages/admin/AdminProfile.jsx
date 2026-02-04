// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    role: '',
    lastLogin: ''
  });

  useEffect(() => {
    // Get admin data from localStorage or Redux
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAdminData({
        name: parsedData.name || 'System Administrator',
        email: parsedData.email || 'admin@iub.edu.pk',
        role: parsedData.role || 'Super Admin',
        lastLogin: parsedData.last_login || new Date().toISOString()
      });
    } else if (user) {
      setAdminData({
        name: user.name,
        email: user.email,
        role: 'Admin',
        lastLogin: user.last_login || new Date().toISOString()
      });
    }
  }, [user]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user-shield me-2"></i>
                Administrator Profile
              </h5>
            </div>
            
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <div className="mb-4">
                    <div className="avatar-lg mx-auto bg-primary rounded-circle d-flex align-items-center justify-content-center mb-3" 
                         style={{width: '120px', height: '120px'}}>
                      <i className="fas fa-user-shield text-white fs-1"></i>
                    </div>
                    <h4>{adminData.name}</h4>
                    <span className="badge bg-warning text-dark">Super Administrator</span>
                  </div>
                  
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h6 className="mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Account Information
                      </h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td>
                              <span className="badge bg-success">
                                <i className="fas fa-check-circle me-1"></i> Active
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Last Login:</strong></td>
                            <td>
                              {adminData.lastLogin ? new Date(adminData.lastLogin).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Permissions:</strong></td>
                            <td>Full System Access</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-8">
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="fas fa-user-cog me-2"></i>
                        Personal Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Full Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={adminData.name}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            value={adminData.email}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">User Role</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value="Super Administrator"
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Account Created</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value="System Account"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="fas fa-shield-alt me-2"></i>
                        Security Settings
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Security Notice:</strong> Administrator accounts have full system access.
                        Change password regularly and never share credentials.
                      </div>
                      
                      <div className="d-grid gap-2 d-md-flex">
                        <button className="btn btn-primary me-2">
                          <i className="fas fa-key me-1"></i>
                          Change Password
                        </button>
                        <button className="btn btn-outline-secondary">
                          <i className="fas fa-history me-1"></i>
                          View Login History
                        </button>
                        <button className="btn btn-outline-danger ms-auto">
                          <i className="fas fa-user-lock me-1"></i>
                          Two-Factor Authentication
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
  );
};

export default AdminProfile;