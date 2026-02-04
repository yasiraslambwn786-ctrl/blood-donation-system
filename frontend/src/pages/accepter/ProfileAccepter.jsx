// FILE: src/pages/accepter/ProfileAccepter.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const ProfileAccepter = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    employeeId: 'EMP12345',
    designation: 'Blood Bank Officer',
    bloodBankName: 'City Blood Bank',
    contactNumber: '+92 300 1234567',
    email: 'john.doe@bloodbank.com',
    address: '123 Medical Street, Karachi',
    joiningDate: '2023-01-15',
    status: 'Active',
    verifiedDonationsCount: 124,
    issuedBloodCount: 89
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.log('Using mock profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accepterToken');
      await axios.put('/accepter/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="avatar-container mb-3">
                <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto">
                  <i className="fas fa-user-md fa-3x"></i>
                </div>
              </div>
              <h4 className="card-title">{profile.name}</h4>
              <p className="text-muted">{profile.designation}</p>
              <p className="text-muted">{profile.bloodBankName}</p>
              
              <div className="mt-4">
                <span className={`badge ${profile.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                  {profile.status}
                </span>
                <p className="text-muted mt-2">
                  <i className="fas fa-calendar-alt me-1"></i>
                  Joined: {profile.joiningDate}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Performance Stats
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h3 className="text-success">{profile.verifiedDonationsCount}</h3>
                    <small className="text-muted">Verified Donations</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h3 className="text-primary">{profile.issuedBloodCount}</h3>
                    <small className="text-muted">Blood Issued</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                Profile Information
              </h5>
              <button 
                className="btn btn-light btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </>
                )}
              </button>
            </div>
            
            <div className="card-body">
              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded p-2 bg-light">
                        {profile.name}
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employee ID</label>
                    <p className="form-control-plaintext border rounded p-2 bg-light">
                      {profile.employeeId}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Designation</label>
                    {isEditing ? (
                      <select
                        className="form-control"
                        name="designation"
                        value={profile.designation}
                        onChange={handleChange}
                      >
                        <option value="Lab Technician">Lab Technician</option>
                        <option value="Blood Bank Officer">Blood Bank Officer</option>
                        <option value="Verification Staff">Verification Staff</option>
                        <option value="Medical Technologist">Medical Technologist</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="form-control-plaintext border rounded p-2 bg-light">
                        {profile.designation}
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Blood Bank Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="bloodBankName"
                        value={profile.bloodBankName}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded p-2 bg-light">
                        {profile.bloodBankName}
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contact Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="contactNumber"
                        value={profile.contactNumber}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded p-2 bg-light">
                        {profile.contactNumber}
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <p className="form-control-plaintext border rounded p-2 bg-light">
                      {profile.email}
                    </p>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Address</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        rows="3"
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded p-2 bg-light">
                        {profile.address}
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Joining Date</label>
                    <p className="form-control-plaintext border rounded p-2 bg-light">
                      {profile.joiningDate}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Account Status</label>
                    <p className="form-control-plaintext border rounded p-2 bg-light">
                      <span className={`badge ${profile.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                        {profile.status}
                      </span>
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="card mt-4">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Permissions & Access
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        Verify Donations
                      </span>
                      <span className="badge bg-success">Allowed</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        Issue Blood
                      </span>
                      <span className="badge bg-success">Allowed</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        View Inventory
                      </span>
                      <span className="badge bg-success">Allowed</span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        View Reports
                      </span>
                      <span className="badge bg-success">Allowed</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        Manage Records
                      </span>
                      <span className="badge bg-success">Allowed</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-times-circle text-secondary me-2"></i>
                        Admin Functions
                      </span>
                      <span className="badge bg-secondary">Restricted</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccepter;