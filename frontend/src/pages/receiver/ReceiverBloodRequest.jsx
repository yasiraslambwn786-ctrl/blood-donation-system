import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReceiverBloodRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    urgency_level: 'Normal',
    required_date: '',
    special_requirements: '',
    hospital_confirmation: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Blood request submitted successfully!');
      navigate('/receiver/requests');
      setLoading(false);
    }, 1500);
  };
  
  return (
    <div className="container">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-plus-circle me-2"></i>
            New Blood Request
          </h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Blood Group Needed *</label>
                <select 
                  className="form-select"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Units Needed *</label>
                <input 
                  type="number" 
                  className="form-control"
                  name="units_needed"
                  value={formData.units_needed}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
                <small className="text-muted">Typically 1 unit = 450ml</small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Urgency Level *</label>
                <select 
                  className="form-select"
                  name="urgency_level"
                  value={formData.urgency_level}
                  onChange={handleChange}
                  required
                >
                  <option value="Normal">Normal (2-7 days)</option>
                  <option value="Urgent">Urgent (24-48 hours)</option>
                  <option value="Emergency">Emergency (Immediate)</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Required Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  name="required_date"
                  value={formData.required_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-12">
                <label className="form-label fw-bold">Special Requirements</label>
                <textarea 
                  className="form-control"
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special requirements or notes..."
                />
              </div>
              
              <div className="col-12">
                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    name="hospital_confirmation"
                    id="hospital_confirmation"
                    checked={formData.hospital_confirmation}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="hospital_confirmation">
                    I confirm that this request is authorized by the hospital
                  </label>
                </div>
              </div>
              
              <div className="col-12">
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/receiver/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading || !formData.hospital_confirmation}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiverBloodRequest;