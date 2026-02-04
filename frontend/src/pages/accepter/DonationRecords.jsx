// FILE: src/pages/accepter/DonationRecords.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const DonationRecords = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    donorId: '',
    bloodGroup: '',
    status: ''
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/donation-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(response.data.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
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
    console.log('Searching with filters:', filters);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Donor ID', 'Donor Name', 'Blood Group', 'Units', 'Donation Date', 'Status', 'Verified By'];
    const csvData = donations.map(d => [
      d.id,
      d.donor_id,
      d.donor_name,
      d.blood_group,
      d.units,
      new Date(d.donation_date).toLocaleDateString(),
      d.status,
      d.verified_by || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donation_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">
              <i className="fas fa-file-medical me-2"></i>
              Donation Records
            </h3>
            <button className="btn btn-light btn-sm" onClick={exportToCSV}>
              <i className="fas fa-download me-1"></i>
              Export CSV
            </button>
          </div>
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
            <div className="col-md-2">
              <label className="form-label">Donor ID</label>
              <input
                type="text"
                className="form-control"
                name="donorId"
                value={filters.donorId}
                onChange={handleFilterChange}
                placeholder="D12345"
              />
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="col-md-12 mt-3">
              <button className="btn btn-primary me-2" onClick={handleSearch}>
                <i className="fas fa-search me-1"></i>
                Search
              </button>
              <button className="btn btn-secondary" onClick={() => setFilters({
                startDate: '', endDate: '', donorId: '', bloodGroup: '', status: ''
              })}>
                <i className="fas fa-redo me-1"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Total Donations</h6>
                      <h4 className="mb-0">{donations.length}</h4>
                    </div>
                    <i className="fas fa-tint fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Total Units</h6>
                      <h4 className="mb-0">{donations.reduce((sum, d) => sum + d.units, 0)}</h4>
                    </div>
                    <i className="fas fa-syringe fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Verified</h6>
                      <h4 className="mb-0">{donations.filter(d => d.status === 'verified').length}</h4>
                    </div>
                    <i className="fas fa-check-circle fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body py-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Pending</h6>
                      <h4 className="mb-0">{donations.filter(d => d.status === 'pending').length}</h4>
                    </div>
                    <i className="fas fa-clock fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Donor ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Donation Date</th>
                  <th>Status</th>
                  <th>Verified By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No donation records found
                    </td>
                  </tr>
                ) : (
                  donations.map(donation => (
                    <tr key={donation.id}>
                      <td>#{donation.id}</td>
                      <td>{donation.donor_id}</td>
                      <td>{donation.donor_name}</td>
                      <td>
                        <span className="badge bg-danger">
                          {donation.blood_group}
                        </span>
                      </td>
                      <td>{donation.units}</td>
                      <td>{new Date(donation.donation_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${donation.status === 'verified' ? 'success' : donation.status === 'pending' ? 'warning' : 'danger'}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td>{donation.verified_by || 'N/A'}</td>
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

          {/* Pagination */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex="-1">Previous</a>
              </li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item">
                <a className="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DonationRecords;