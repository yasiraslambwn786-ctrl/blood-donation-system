// FILE: src/pages/accepter/VerifyDonations.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const VerifyDonations = () => {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState({
    hemoglobin_level: '',
    blood_pressure: '',
    temperature: '',
    pulse_rate: '',
    notes: '',
    status: 'approved'
  });

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const fetchPendingDonations = async () => {
    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.get('/accepter/pending-donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingDonations(response.data.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDonation = (donation) => {
    setSelectedDonation(donation);
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerify = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.post(`/accepter/verify-donation/${selectedDonation.id}`, 
        verificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Donation verified successfully!');
        setSelectedDonation(null);
        setVerificationData({
          hemoglobin_level: '',
          blood_pressure: '',
          temperature: '',
          pulse_rate: '',
          notes: '',
          status: 'approved'
        });
        fetchPendingDonations();
      }
    } catch (error) {
      alert('Error verifying donation: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Pending Donations List */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h3 className="card-title mb-0">
                <i className="fas fa-clock me-2"></i>
                Pending Donations
              </h3>
            </div>
            
            <div className="card-body">
              <div className="list-group">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : pendingDonations.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No pending donations
                  </div>
                ) : (
                  pendingDonations.map(donation => (
                    <button
                      key={donation.id}
                      className={`list-group-item list-group-item-action ${selectedDonation?.id === donation.id ? 'active' : ''}`}
                      onClick={() => handleSelectDonation(donation)}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">#{donation.id} - {donation.donor_name}</h6>
                        <small>{new Date(donation.donation_date).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-1">
                        <span className="badge bg-danger me-2">{donation.blood_group}</span>
                        {donation.units} units
                      </p>
                      <small>Click to verify this donation</small>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-check-circle me-2"></i>
                Verify Donation
              </h3>
            </div>
            
            <div className="card-body">
              {!selectedDonation ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-hand-pointer fa-3x mb-3"></i>
                  <p>Select a donation from the left to verify</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h5>Donation Details</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th>Donor Name:</th>
                          <td>{selectedDonation.donor_name}</td>
                        </tr>
                        <tr>
                          <th>Blood Group:</th>
                          <td>
                            <span className="badge bg-danger">
                              {selectedDonation.blood_group}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Units:</th>
                          <td>{selectedDonation.units}</td>
                        </tr>
                        <tr>
                          <th>Donation Date:</th>
                          <td>{new Date(selectedDonation.donation_date).toLocaleDateString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h5>Medical Parameters</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Hemoglobin (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        name="hemoglobin_level"
                        value={verificationData.hemoglobin_level}
                        onChange={handleVerificationChange}
                        placeholder="12.5"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Blood Pressure</label>
                      <input
                        type="text"
                        className="form-control"
                        name="blood_pressure"
                        value={verificationData.blood_pressure}
                        onChange={handleVerificationChange}
                        placeholder="120/80"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        name="temperature"
                        value={verificationData.temperature}
                        onChange={handleVerificationChange}
                        placeholder="36.5"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Pulse Rate</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pulse_rate"
                        value={verificationData.pulse_rate}
                        onChange={handleVerificationChange}
                        placeholder="72"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        name="status"
                        value={verificationData.status}
                        onChange={handleVerificationChange}
                      >
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        rows="3"
                        value={verificationData.notes}
                        onChange={handleVerificationChange}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success flex-fill"
                      onClick={handleVerify}
                    >
                      <i className="fas fa-check me-2"></i>
                      Verify Donation
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSelectedDonation(null)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDonations;