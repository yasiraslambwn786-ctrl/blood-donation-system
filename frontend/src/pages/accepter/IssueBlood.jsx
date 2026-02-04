// FILE: src/pages/accepter/IssueBlood.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const IssueBlood = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuanceData, setIssuanceData] = useState({
    receiver_id: '',
    receiver_name: '',
    blood_group: '',
    units: 1,
    purpose: '',
    doctor_name: '',
    hospital_name: '',
    emergency: false,
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIssuanceData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const checkAvailability = (bloodGroup) => {
    const item = inventory.find(i => i.blood_group === bloodGroup);
    return item ? item.available_units : 0;
  };

  const handleIssue = async () => {
    // Validation
    if (issuanceData.units > checkAvailability(issuanceData.blood_group)) {
      alert(`Only ${checkAvailability(issuanceData.blood_group)} units available for ${issuanceData.blood_group}`);
      return;
    }

    if (!issuanceData.receiver_id || !issuanceData.blood_group || !issuanceData.units) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.post('/accepter/issue-blood', 
        issuanceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Blood issued successfully!');
        setIssuanceData({
          receiver_id: '',
          receiver_name: '',
          blood_group: '',
          units: 1,
          purpose: '',
          doctor_name: '',
          hospital_name: '',
          emergency: false,
          notes: ''
        });
        fetchInventory();
      }
    } catch (error) {
      alert('Error issuing blood: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Issue Form */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-syringe me-2"></i>
                Issue Blood
              </h3>
            </div>
            
            <div className="card-body">
              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Receiver ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="receiver_id"
                      value={issuanceData.receiver_id}
                      onChange={handleInputChange}
                      placeholder="R12345"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Receiver Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="receiver_name"
                      value={issuanceData.receiver_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Blood Group *</label>
                    <select
                      className="form-control"
                      name="blood_group"
                      value={issuanceData.blood_group}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>
                          {group} ({checkAvailability(group)} units available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Units *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="units"
                      min="1"
                      value={issuanceData.units}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Purpose</label>
                    <select
                      className="form-control"
                      name="purpose"
                      value={issuanceData.purpose}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Purpose</option>
                      <option value="surgery">Surgery</option>
                      <option value="accident">Accident</option>
                      <option value="childbirth">Childbirth</option>
                      <option value="chronic_illness">Chronic Illness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Doctor Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="doctor_name"
                      value={issuanceData.doctor_name}
                      onChange={handleInputChange}
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="hospital_name"
                      value={issuanceData.hospital_name}
                      onChange={handleInputChange}
                      placeholder="City Hospital"
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="emergency"
                        checked={issuanceData.emergency}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">
                        Emergency Issue
                      </label>
                    </div>
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      rows="3"
                      value={issuanceData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-danger btn-lg w-100"
                  onClick={handleIssue}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Issue Blood
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-clipboard-list me-2"></i>
                Current Inventory
              </h3>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Blood Group</th>
                        <th>Available Units</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloodGroups.map(group => {
                        const available = checkAvailability(group);
                        let status = 'Normal';
                        let statusClass = 'success';
                        
                        if (available === 0) {
                          status = 'Critical';
                          statusClass = 'danger';
                        } else if (available < 5) {
                          status = 'Low';
                          statusClass = 'warning';
                        }

                        return (
                          <tr key={group}>
                            <td>
                              <span className="badge bg-danger">{group}</span>
                            </td>
                            <td>
                              <h5 className="mb-0">{available}</h5>
                            </td>
                            <td>
                              <span className={`badge bg-${statusClass}`}>
                                {status}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date().toLocaleDateString()}
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4">
                <h6>Stock Status Legend:</h6>
                <div className="d-flex gap-3">
                  <span className="badge bg-success">Normal (5+ units)</span>
                  <span className="badge bg-warning">Low (1-4 units)</span>
                  <span className="badge bg-danger">Critical (0 units)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBlood;