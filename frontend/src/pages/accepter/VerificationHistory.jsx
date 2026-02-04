// FILE: src/pages/accepter/VerificationHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const VerificationHistory = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    bloodGroup: '',
    status: ''
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/verification-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(response.data.data);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Implement filter logic
    console.log('Filtering with:', filters);
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-history me-2"></i>
            Verification History
          </h3>
        </div>
        
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Blood Group</label>
              <select
                className="form-control"
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="col-md-12 mt-3">
              <button className="btn btn-primary me-2" onClick={handleSearch}>
                <i className="fas fa-search me-1"></i>
                Search
              </button>
              <button className="btn btn-secondary" onClick={() => setFilters({
                startDate: '', endDate: '', bloodGroup: '', status: ''
              })}>
                <i className="fas fa-redo me-1"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Verified Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : verifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No verification records found
                    </td>
                  </tr>
                ) : (
                  verifications.map(verification => (
                    <tr key={verification.id}>
                      <td>#{verification.id}</td>
                      <td>{verification.donor_name}</td>
                      <td>
                        <span className={`badge bg-danger`}>
                          {verification.blood_group}
                        </span>
                      </td>
                      <td>{verification.units}</td>
                      <td>{new Date(verification.verified_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${verification.status === 'verified' ? 'success' : 'warning'}`}>
                          {verification.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info me-1">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-primary">
                          <i className="fas fa-print"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Export Options */}
          <div className="mt-3">
            <button className="btn btn-success me-2">
              <i className="fas fa-file-excel me-1"></i>
              Export to Excel
            </button>
            <button className="btn btn-danger">
              <i className="fas fa-file-pdf me-1"></i>
              Export to PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationHistory;