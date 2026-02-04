// FILE: src/pages/accepter/HandoverBlood.jsx
import React, { useState } from 'react';

const HandoverBlood = () => {
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverId: '',
    bloodGroup: '',
    units: '',
    handoverDate: '',
    handoverTime: '',
    purpose: '',
    notes: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Handover form submitted:', formData);
    alert('Blood handover request submitted successfully!');
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-success text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-handshake me-2"></i>
            Handover Blood
          </h3>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Receiver Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver name"
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label">Receiver ID *</label>
                <input
                  type="text"
                  className="form-control"
                  name="receiverId"
                  value={formData.receiverId}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver ID"
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Blood Group *</label>
                <select
                  className="form-control"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Units *</label>
                <input
                  type="number"
                  className="form-control"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  placeholder="Number of units"
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Handover Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="handoverDate"
                  value={formData.handoverDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label">Handover Time *</label>
                <input
                  type="time"
                  className="form-control"
                  name="handoverTime"
                  value={formData.handoverTime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label">Purpose *</label>
                <select
                  className="form-control"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="surgery">Surgery</option>
                  <option value="emergency">Emergency</option>
                  <option value="chronic_illness">Chronic Illness</option>
                  <option value="accident">Accident</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="col-12 mb-3">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes or instructions"
                ></textarea>
              </div>
              
              <div className="col-12">
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-secondary">
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </button>
                  
                  <div>
                    <button type="button" className="btn btn-info me-2">
                      <i className="fas fa-save me-1"></i>
                      Save Draft
                    </button>
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-paper-plane me-1"></i>
                      Submit Handover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          
          {/* Recent Handovers */}
          <div className="mt-5">
            <h5 className="mb-3">
              <i className="fas fa-history me-2"></i>
              Recent Handovers
            </h5>
            
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Receiver</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#H001</td>
                    <td>John Smith</td>
                    <td><span className="badge bg-danger">A+</span></td>
                    <td>2</td>
                    <td>2024-02-04</td>
                    <td><span className="badge bg-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td>#H002</td>
                    <td>Civil Hospital</td>
                    <td><span className="badge bg-danger">O+</span></td>
                    <td>3</td>
                    <td>2024-02-03</td>
                    <td><span className="badge bg-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td>#H003</td>
                    <td>Sarah Johnson</td>
                    <td><span className="badge bg-danger">B-</span></td>
                    <td>1</td>
                    <td>2024-02-02</td>
                    <td><span className="badge bg-warning">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverBlood;