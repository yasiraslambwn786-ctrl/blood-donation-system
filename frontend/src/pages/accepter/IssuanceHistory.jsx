// FILE: src/pages/accepter/IssuanceHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const IssuanceHistory = () => {
  const [issuances, setIssuances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssuance, setSelectedIssuance] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    bloodGroup: '',
    receiverId: ''
  });

  useEffect(() => {
    fetchIssuances();
  }, []);

  const fetchIssuances = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/issuance-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssuances(response.data.data);
    } catch (error) {
      console.error('Error fetching issuances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = (issuance) => {
    setSelectedIssuance(issuance);
  };

  const generateReceipt = (issuance) => {
    const receiptContent = `
      BLOOD ISSUANCE RECEIPT
      ======================
      Receipt ID: ${issuance.id}
      Date: ${new Date(issuance.issue_date).toLocaleDateString()}
      
      Receiver Details:
      - ID: ${issuance.receiver_id}
      - Name: ${issuance.receiver_name}
      
      Blood Details:
      - Group: ${issuance.blood_group}
      - Units: ${issuance.units}
      
      Medical Details:
      - Purpose: ${issuance.purpose}
      - Doctor: ${issuance.doctor_name}
      - Hospital: ${issuance.hospital_name}
      
      Issued By: ${issuance.issued_by}
      Blood Bank: ${issuance.blood_bank}
      
      Notes: ${issuance.notes || 'N/A'}
      
      --- END OF RECEIPT ---
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${issuance.id}.txt`;
    link.click();
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Main Table */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-history me-2"></i>
                Issuance History
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
                  <label className="form-label">Receiver ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="receiverId"
                    value={filters.receiverId}
                    onChange={handleFilterChange}
                    placeholder="R12345"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Issue ID</th>
                      <th>Receiver</th>
                      <th>Blood Group</th>
                      <th>Units</th>
                      <th>Issue Date</th>
                      <th>Purpose</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : issuances.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No issuance records found
                        </td>
                      </tr>
                    ) : (
                      issuances.map(issuance => (
                        <tr key={issuance.id}>
                          <td>#{issuance.id}</td>
                          <td>
                            <div>
                              <strong>{issuance.receiver_name}</strong>
                              <br />
                              <small className="text-muted">{issuance.receiver_id}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-danger">
                              {issuance.blood_group}
                            </span>
                          </td>
                          <td>{issuance.units}</td>
                          <td>{new Date(issuance.issue_date).toLocaleDateString()}</td>
                          <td>
                            <span className="badge bg-primary">
                              {issuance.purpose}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-info me-1"
                              onClick={() => handleViewDetails(issuance)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => generateReceipt(issuance)}
                            >
                              <i className="fas fa-receipt"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Issuance Details
              </h3>
            </div>
            
            <div className="card-body">
              {!selectedIssuance ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-info-circle fa-3x mb-3"></i>
                  <p>Select an issuance to view details</p>
                </div>
              ) : (
                <div>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <th>Issue ID:</th>
                        <td>#{selectedIssuance.id}</td>
                      </tr>
                      <tr>
                        <th>Receiver ID:</th>
                        <td>{selectedIssuance.receiver_id}</td>
                      </tr>
                      <tr>
                        <th>Receiver Name:</th>
                        <td>{selectedIssuance.receiver_name}</td>
                      </tr>
                      <tr>
                        <th>Blood Group:</th>
                        <td>
                          <span className="badge bg-danger">
                            {selectedIssuance.blood_group}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Units:</th>
                        <td>{selectedIssuance.units}</td>
                      </tr>
                      <tr>
                        <th>Issue Date:</th>
                        <td>{new Date(selectedIssuance.issue_date).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <th>Purpose:</th>
                        <td>{selectedIssuance.purpose}</td>
                      </tr>
                      <tr>
                        <th>Doctor:</th>
                        <td>{selectedIssuance.doctor_name}</td>
                      </tr>
                      <tr>
                        <th>Hospital:</th>
                        <td>{selectedIssuance.hospital_name}</td>
                      </tr>
                      <tr>
                        <th>Emergency:</th>
                        <td>
                          {selectedIssuance.emergency ? 
                            <span className="badge bg-danger">Yes</span> : 
                            <span className="badge bg-success">No</span>
                          }
                        </td>
                      </tr>
                      <tr>
                        <th>Issued By:</th>
                        <td>{selectedIssuance.issued_by}</td>
                      </tr>
                      <tr>
                        <th>Blood Bank:</th>
                        <td>{selectedIssuance.blood_bank}</td>
                      </tr>
                      <tr>
                        <th>Notes:</th>
                        <td>{selectedIssuance.notes || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-success"
                      onClick={() => generateReceipt(selectedIssuance)}
                    >
                      <i className="fas fa-print me-2"></i>
                      Print Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuanceHistory;