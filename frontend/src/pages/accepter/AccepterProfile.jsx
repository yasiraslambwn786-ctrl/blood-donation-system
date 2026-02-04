// FILE: src/pages/accepter/AccepterProfile.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../api/axiosInstance';
import { setAccepter } from '../../redux/slices/accepterSlice';

const AccepterProfile = () => {
  const dispatch = useDispatch();
  const { accepter } = useSelector(state => state.accepter);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: accepter?.name || '',
    contact_number: accepter?.contact_number || '',
    address: accepter?.address || '',
    blood_bank_name: accepter?.blood_bank_name || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('accepterToken');
      const response = await axios.put('/accepter/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update Redux store
        dispatch(setAccepter({
          accepter: { ...accepter, ...formData },
          token: token
        }));

        // Update localStorage
        const updatedAccepter = { ...accepter, ...formData };
        localStorage.setItem('accepterData', JSON.stringify(updatedAccepter));

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-user-edit me-2"></i>
                Accepter Profile
              </h3>
            </div>
            
            <div className="card-body">
              {/* Message Alert */}
              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                  {message.text}
                </div>
              )}

              {/* Profile Information */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-id-card me-2"></i>
                        Basic Information
                      </h5>
                    </div>
                    <div className="card-body">
                      <p><strong>Employee ID:</strong> {accepter?.employee_id}</p>
                      <p><strong>Designation:</strong> {accepter?.designation}</p>
                      <p><strong>Email:</strong> {accepter?.email}</p>
                      <p><strong>Joining Date:</strong> {accepter?.joining_date}</p>
                      <p><strong>Status:</strong> 
                        <span className={`badge bg-${accepter?.status === 'active' ? 'success' : 'warning'} ms-2`}>
                          {accepter?.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-bar me-2"></i>
                        Statistics
                      </h5>
                    </div>
                    <div className="card-body">
                      <p><strong>Verified Donations:</strong> {accepter?.verified_donations_count || 0}</p>
                      <p><strong>Blood Units Issued:</strong> {accepter?.issued_blood_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Profile Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    className="form-control"
                    value={formData.contact_number}
                    onChange={handleChange}
                    pattern="[0-9]{11}"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Blood Bank Name</label>
                  <input
                    type="text"
                    name="blood_bank_name"
                    className="form-control"
                    value={formData.blood_bank_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccepterProfile;