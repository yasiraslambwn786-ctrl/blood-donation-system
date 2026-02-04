import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReceiverEmergency = () => {
  const navigate = useNavigate();
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  
  // Emergency form state
  const [emergencyForm, setEmergencyForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'Male',
    blood_group_needed: '',
    units_needed: 1,
    hospital_name: '',
    ward_room: '',
    doctor_name: '',
    medical_condition: '',
    contact_name: '',
    contact_phone: '',
    contact_relationship: 'Family',
    special_instructions: '',
    confirm_emergency: false
  });
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const { receiver } = useSelector((state) => state.receiver);
  
  // Mock emergency requests for demonstration
  const mockEmergencyRequests = [
    {
      id: 'EMG-001',
      emergency_id: 1,
      patient_name: 'Ahmed Khan',
      blood_group_needed: 'O-',
      units_needed: 2,
      hospital_name: 'Civil Hospital, Bahawalnagar',
      status: 'Assigned',
      urgency: 'Emergency',
      created_at: '2024-01-20 14:30:00',
      assigned_staff: 'Staff-007 (Dr. Ali)',
      staff_contact: '+92 300 7654321',
      estimated_time: '30 minutes',
      blood_source: 'Red Cross Blood Bank',
      tracking: {
        stage: 'Delivery',
        progress: 75,
        steps: [
          { step: 1, name: 'Request Received', time: '14:30', completed: true },
          { step: 2, name: 'Staff Assigned', time: '14:35', completed: true },
          { step: 3, name: 'Blood Located', time: '14:45', completed: true },
          { step: 4, name: 'Delivery Started', time: '14:50', completed: true },
          { step: 5, name: 'Arrival at Hospital', time: 'Estimated 15:00', completed: false },
          { step: 6, name: 'Transfusion', time: 'Pending', completed: false }
        ]
      }
    },
    {
      id: 'EMG-002',
      emergency_id: 2,
      patient_name: 'Sara Ahmed',
      blood_group_needed: 'B+',
      units_needed: 3,
      hospital_name: 'Red Cross Blood Center',
      status: 'Processing',
      urgency: 'Emergency',
      created_at: '2024-01-19 10:15:00',
      assigned_staff: 'Staff-012 (Dr. Fatima)',
      staff_contact: '+92 333 9876543',
      estimated_time: '45 minutes',
      blood_source: 'IUB Blood Bank',
      tracking: {
        stage: 'Blood Collection',
        progress: 50,
        steps: [
          { step: 1, name: 'Request Received', time: '10:15', completed: true },
          { step: 2, name: 'Staff Assigned', time: '10:20', completed: true },
          { step: 3, name: 'Donor Contacted', time: '10:30', completed: true },
          { step: 4, name: 'Donor Arriving', time: '10:45', completed: false },
          { step: 5, name: 'Blood Collection', time: 'Estimated 11:00', completed: false },
          { step: 6, name: 'Delivery', time: 'Pending', completed: false }
        ]
      }
    },
    {
      id: 'EMG-003',
      emergency_id: 3,
      patient_name: 'Rizwan Ali',
      blood_group_needed: 'AB+',
      units_needed: 1,
      hospital_name: 'IUB Medical Center',
      status: 'Completed',
      urgency: 'Emergency',
      created_at: '2024-01-18 08:45:00',
      completed_at: '2024-01-18 09:30:00',
      assigned_staff: 'Staff-005 (Dr. Usman)',
      staff_contact: '+92 311 1122334',
      blood_source: 'Civil Hospital Blood Bank',
      tracking: {
        stage: 'Completed',
        progress: 100,
        steps: [
          { step: 1, name: 'Request Received', time: '08:45', completed: true },
          { step: 2, name: 'Staff Assigned', time: '08:50', completed: true },
          { step: 3, name: 'Blood Located', time: '09:00', completed: true },
          { step: 4, name: 'Delivery Started', time: '09:10', completed: true },
          { step: 5, name: 'Arrival at Hospital', time: '09:25', completed: true },
          { step: 6, name: 'Transfusion Started', time: '09:30', completed: true }
        ]
      }
    }
  ];

  useEffect(() => {
    fetchEmergencyRequests();
    
    // Auto-refresh every 30 seconds for active emergencies
    const interval = setInterval(() => {
      const hasActiveEmergencies = emergencyRequests.some(req => 
        req.status === 'Processing' || req.status === 'Assigned'
      );
      if (hasActiveEmergencies) {
        fetchEmergencyRequests();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('receiverToken');
      
      // For now, use mock data
      // In production, uncomment the API call
      /*
      const response = await axios.get(`${API_BASE_URL}/receiver/emergency-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmergencyRequests(response.data.data);
      }
      */
      
      // Using mock data
      setEmergencyRequests(mockEmergencyRequests);
      
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      // Fallback to mock data
      setEmergencyRequests(mockEmergencyRequests);
    } finally {
      setLoading(false);
    }
  };

  // Handle emergency form input changes
  const handleEmergencyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmergencyForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Pre-fill form with receiver data if available
  const prefillFormWithReceiverData = () => {
    if (receiver) {
      setEmergencyForm(prev => ({
        ...prev,
        patient_name: receiver.patient_name || '',
        patient_age: receiver.patient_age || '',
        patient_gender: receiver.patient_gender || 'Male',
        blood_group_needed: receiver.blood_group_needed || '',
        hospital_name: receiver.hospital_name || '',
        contact_name: receiver.contact_name || '',
        contact_phone: receiver.mobile_number || ''
      }));
    }
  };

  // Submit emergency request
  const submitEmergencyRequest = async (e) => {
    e.preventDefault();
    
    if (!emergencyForm.confirm_emergency) {
      alert('Please confirm this is a genuine emergency');
      return;
    }
    
    if (!emergencyForm.patient_name || !emergencyForm.blood_group_needed || 
        !emergencyForm.hospital_name || !emergencyForm.contact_phone) {
      alert('Please fill all required fields marked with *');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('receiverToken');
      const receiverId = receiver?.id || 'temp';
      
      // Mock submission - in production, replace with real API
      const mockResponse = {
        success: true,
        data: {
          id: `EMG-${Date.now().toString().slice(-6)}`,
          emergency_code: `EMG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          message: '🚨 EMERGENCY ALERT: Your request has been submitted! Our emergency team has been notified.',
          contact_numbers: {
            'Emergency Helpline': '115',
            'Civil Hospital': '061-1234567',
            'Assigned Staff': '+92 300 9998888'
          },
          estimated_response: '5-10 minutes',
          instructions: 'Please keep your phone nearby. Our staff will contact you immediately.'
        }
      };
      
      // Show success message
      alert(`🚨 EMERGENCY REQUEST SUBMITTED!\n\nEmergency Code: ${mockResponse.data.emergency_code}\n\n${mockResponse.data.message}\n\nEstimated Response: ${mockResponse.data.estimated_response}`);
      
      // Store emergency data
      const emergencyData = {
        ...emergencyForm,
        emergency_code: mockResponse.data.emergency_code,
        submitted_at: new Date().toISOString(),
        receiver_id: receiverId
      };
      
      localStorage.setItem('latestEmergency', JSON.stringify(emergencyData));
      
      // Add to emergency requests list
      const newEmergency = {
        id: mockResponse.data.id,
        emergency_id: emergencyRequests.length + 1,
        patient_name: emergencyForm.patient_name,
        blood_group_needed: emergencyForm.blood_group_needed,
        units_needed: emergencyForm.units_needed,
        hospital_name: emergencyForm.hospital_name,
        status: 'Processing',
        urgency: 'Emergency',
        created_at: new Date().toISOString(),
        assigned_staff: 'Awaiting assignment',
        estimated_time: 'Immediate',
        tracking: {
          stage: 'Request Received',
          progress: 10,
          steps: [
            { step: 1, name: 'Request Received', time: new Date().toLocaleTimeString(), completed: true },
            { step: 2, name: 'Staff Assignment', time: 'Pending', completed: false },
            { step: 3, name: 'Blood Search', time: 'Pending', completed: false },
            { step: 4, name: 'Donor Contact', time: 'Pending', completed: false },
            { step: 5, name: 'Collection/Delivery', time: 'Pending', completed: false },
            { step: 6, name: 'Hospital Arrival', time: 'Pending', completed: false }
          ]
        }
      };
      
      setEmergencyRequests([newEmergency, ...emergencyRequests]);
      setShowEmergencyForm(false);
      resetEmergencyForm();
      
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      alert('Failed to submit emergency request. Please call emergency helpline directly: 115');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset emergency form
  const resetEmergencyForm = () => {
    setEmergencyForm({
      patient_name: '',
      patient_age: '',
      patient_gender: 'Male',
      blood_group_needed: '',
      units_needed: 1,
      hospital_name: '',
      ward_room: '',
      doctor_name: '',
      medical_condition: '',
      contact_name: '',
      contact_phone: '',
      contact_relationship: 'Family',
      special_instructions: '',
      confirm_emergency: false
    });
  };

  // Track emergency request
  const trackEmergency = (emergency) => {
    setTrackingData(emergency);
    setShowTrackingModal(true);
  };

  // Call emergency helpline
  const callEmergencyHelpline = () => {
    if (window.confirm('Call Emergency Helpline: 115?')) {
      window.location.href = 'tel:115';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'assigned': return 'info';
      case 'processing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    if (urgency === 'Emergency') {
      return (
        <span className="badge bg-danger px-3 py-2 emergency-pulse">
          <i className="fas fa-exclamation-triangle me-1"></i>
          {urgency}
        </span>
      );
    }
    return <span className="badge bg-warning">{urgency}</span>;
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time elapsed
  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hours ago`;
    }
  };

  // Active emergencies count
  const activeEmergencies = emergencyRequests.filter(req => 
    req.status === 'Processing' || req.status === 'Assigned'
  ).length;

  if (loading && emergencyRequests.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading emergency requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Emergency Header Banner */}
      <div className="card bg-danger text-white mb-4 emergency-pulse">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                EMERGENCY BLOOD REQUEST PORTAL
              </h3>
              <p className="mb-0">
                For life-threatening situations requiring immediate blood transfusion.
                Our emergency team operates 24/7.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <button 
                className="btn btn-light btn-lg me-2"
                onClick={callEmergencyHelpline}
              >
                <i className="fas fa-phone me-2"></i>
                Call: 115
              </button>
              <button 
                className="btn btn-warning btn-lg"
                onClick={() => {
                  prefillFormWithReceiverData();
                  setShowEmergencyForm(true);
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                New Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-danger shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Active Emergencies</h6>
                  <h2 className="mb-0 text-danger">{activeEmergencies}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-ambulance fa-2x text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total This Month</h6>
                  <h2 className="mb-0">{emergencyRequests.length}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-file-medical fa-2x text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Average Response</h6>
                  <h2 className="mb-0">15m</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-clock fa-2x text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Success Rate</h6>
                  <h2 className="mb-0">98%</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Request Form Modal */}
      {showEmergencyForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h4 className="modal-title">
                  <i className="fas fa-ambulance me-2"></i>
                  EMERGENCY BLOOD REQUEST
                </h4>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowEmergencyForm(false)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <h5>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    EMERGENCY PROTOCOL
                  </h5>
                  <p className="mb-0">
                    Only use this for <strong>life-threatening situations</strong> requiring 
                    immediate blood transfusion. False emergencies waste critical resources.
                  </p>
                </div>
                
                <form onSubmit={submitEmergencyRequest}>
                  <div className="row g-3">
                    {/* Patient Information */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Patient Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="patient_name"
                        value={emergencyForm.patient_name}
                        onChange={handleEmergencyFormChange}
                        required
                        placeholder="Full name as per hospital records"
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label fw-bold text-danger">Age *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="patient_age"
                        value={emergencyForm.patient_age}
                        onChange={handleEmergencyFormChange}
                        min="0"
                        max="120"
                        required
                        placeholder="Years"
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label fw-bold text-danger">Gender *</label>
                      <select
                        className="form-select"
                        name="patient_gender"
                        value={emergencyForm.patient_gender}
                        onChange={handleEmergencyFormChange}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Blood Group Needed *</label>
                      <select
                        className="form-select"
                        name="blood_group_needed"
                        value={emergencyForm.blood_group_needed}
                        onChange={handleEmergencyFormChange}
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
                        <option value="Unknown">Unknown (Emergency Cross-match)</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Units Needed *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          name="units_needed"
                          value={emergencyForm.units_needed}
                          onChange={handleEmergencyFormChange}
                          min="1"
                          max="10"
                          required
                        />
                        <span className="input-group-text">Units (450ml each)</span>
                      </div>
                    </div>
                    
                    {/* Hospital Information */}
                    <div className="col-md-8">
                      <label className="form-label fw-bold text-danger">Hospital Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="hospital_name"
                        value={emergencyForm.hospital_name}
                        onChange={handleEmergencyFormChange}
                        required
                        placeholder="Full hospital name with city"
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Ward/Room</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ward_room"
                        value={emergencyForm.ward_room}
                        onChange={handleEmergencyFormChange}
                        placeholder="e.g., ICU, Ward 3"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Doctor Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="doctor_name"
                        value={emergencyForm.doctor_name}
                        onChange={handleEmergencyFormChange}
                        placeholder="Doctor in charge"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Medical Condition</label>
                      <input
                        type="text"
                        className="form-control"
                        name="medical_condition"
                        value={emergencyForm.medical_condition}
                        onChange={handleEmergencyFormChange}
                        placeholder="e.g., Accident, Surgery, Hemorrhage"
                      />
                    </div>
                    
                    {/* Contact Information */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Contact Person *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_name"
                        value={emergencyForm.contact_name}
                        onChange={handleEmergencyFormChange}
                        required
                        placeholder="Person to contact"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Contact Phone *</label>
                      <div className="input-group">
                        <span className="input-group-text">+92</span>
                        <input
                          type="tel"
                          className="form-control"
                          name="contact_phone"
                          value={emergencyForm.contact_phone}
                          onChange={handleEmergencyFormChange}
                          required
                          placeholder="3XX XXXXXXX"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label fw-bold">Special Instructions</label>
                      <textarea
                        className="form-control"
                        name="special_instructions"
                        value={emergencyForm.special_instructions}
                        onChange={handleEmergencyFormChange}
                        rows="2"
                        placeholder="Any critical information for emergency team..."
                      />
                    </div>
                    
                    {/* Emergency Confirmation */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="confirm_emergency"
                          id="confirm_emergency"
                          checked={emergencyForm.confirm_emergency}
                          onChange={handleEmergencyFormChange}
                          required
                        />
                        <label className="form-check-label text-danger fw-bold" htmlFor="confirm_emergency">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          I CONFIRM this is a genuine life-threatening emergency requiring 
                          immediate blood transfusion. I understand false emergencies are illegal.
                        </label>
                      </div>
                    </div>
                    
                    {/* Emergency Contact Info */}
                    <div className="col-12">
                      <div className="alert alert-info">
                        <h6>
                          <i className="fas fa-phone me-2"></i>
                          Emergency Contacts
                        </h6>
                        <div className="row">
                          <div className="col-md-4">
                            <strong>National Helpline:</strong><br/>
                            <span className="text-danger fs-5">115</span>
                          </div>
                          <div className="col-md-4">
                            <strong>Civil Hospital:</strong><br/>
                            <span>061-1234567</span>
                          </div>
                          <div className="col-md-4">
                            <strong>Red Cross:</strong><br/>
                            <span>1122</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowEmergencyForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger btn-lg"
                      disabled={submitting || !emergencyForm.confirm_emergency}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          SENDING EMERGENCY ALERT...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-bell me-2"></i>
                          SEND EMERGENCY REQUEST
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Requests List */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-history me-2"></i>
              Emergency Request History
            </h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={fetchEmergencyRequests}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => {
                  prefillFormWithReceiverData();
                  setShowEmergencyForm(true);
                }}
              >
                <i className="fas fa-plus me-1"></i>
                New Emergency
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {emergencyRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Emergency ID</th>
                    <th>Patient</th>
                    <th>Blood Group</th>
                    <th>Hospital</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyRequests.map(emergency => (
                    <tr key={emergency.id} className={emergency.status === 'Processing' ? 'table-warning' : ''}>
                      <td>
                        <strong>{emergency.id}</strong>
                        <div>
                          {getUrgencyBadge(emergency.urgency)}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{emergency.patient_name}</div>
                        <small className="text-muted">{emergency.units_needed} units needed</small>
                      </td>
                      <td>
                        <span className="badge bg-danger fs-6">{emergency.blood_group_needed}</span>
                      </td>
                      <td>
                        <small>{emergency.hospital_name}</small>
                        {emergency.ward_room && (
                          <div className="text-muted"><small>{emergency.ward_room}</small></div>
                        )}
                      </td>
                      <td>
                        <div>{formatDateTime(emergency.created_at)}</div>
                        <small className="text-muted">{getTimeElapsed(emergency.created_at)}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor(emergency.status)} px-3 py-2`}>
                          {emergency.status}
                        </span>
                        {emergency.estimated_time && (
                          <div className="small text-muted mt-1">
                            <i className="fas fa-clock me-1"></i>
                            {emergency.estimated_time}
                          </div>
                        )}
                      </td>
                      <td>
                        {emergency.assigned_staff ? (
                          <>
                            <div>{emergency.assigned_staff}</div>
                            {emergency.staff_contact && (
                              <a 
                                href={`tel:${emergency.staff_contact}`}
                                className="small text-primary"
                              >
                                <i className="fas fa-phone me-1"></i>
                                Call Staff
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">Awaiting assignment</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => trackEmergency(emergency)}
                          >
                            <i className="fas fa-map-marker-alt me-1"></i>
                            Track
                          </button>
                          {(emergency.status === 'Processing' || emergency.status === 'Assigned') && (
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => window.location.href = `tel:${emergency.staff_contact || '115'}`}
                            >
                              <i className="fas fa-phone me-1"></i>
                              Call Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-ambulance fa-4x text-muted mb-3"></i>
              <h5>No Emergency Requests</h5>
              <p className="text-muted mb-4">
                You have not made any emergency requests yet.
              </p>
              <button 
                className="btn btn-danger btn-lg"
                onClick={() => {
                  prefillFormWithReceiverData();
                  setShowEmergencyForm(true);
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Create Emergency Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Tracking Modal */}
      {showTrackingModal && trackingData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Emergency Tracking: {trackingData.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowTrackingModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Progress</span>
                    <span className="fw-bold">{trackingData.tracking.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${trackingData.tracking.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="badge bg-info">
                      Current Stage: {trackingData.tracking.stage}
                    </span>
                  </div>
                </div>
                
                {/* Tracking Steps */}
                <div className="tracking-timeline">
                  {trackingData.tracking.steps.map((step, index) => (
                    <div key={step.step} className="timeline-step">
                      <div className="timeline-marker">
                        {step.completed ? (
                          <div className="marker completed">
                            <i className="fas fa-check"></i>
                          </div>
                        ) : (
                          <div className="marker pending">
                            <span>{step.step}</span>
                          </div>
                        )}
                      </div>
                      <div className="timeline-content">
                        <h6 className={`mb-1 ${step.completed ? 'text-success' : ''}`}>
                          {step.name}
                        </h6>
                        <p className="text-muted mb-0">
                          <i className="fas fa-clock me-1"></i>
                          {step.time}
                        </p>
                      </div>
                      {index < trackingData.tracking.steps.length - 1 && (
                        <div className={`timeline-connector ${step.completed ? 'completed' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Emergency Contact Information */}
                <div className="alert alert-danger mt-4">
                  <h6>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Emergency Contacts
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Assigned Staff:</strong><br/>
                        {trackingData.assigned_staff || 'Awaiting assignment'}
                      </p>
                      {trackingData.staff_contact && (
                        <a 
                          href={`tel:${trackingData.staff_contact}`}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fas fa-phone me-1"></i>
                          Call Staff: {trackingData.staff_contact}
                        </a>
                      )}
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>Emergency Helpline:</strong><br/>
                        <span className="fs-5">115</span>
                      </p>
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={callEmergencyHelpline}
                      >
                        <i className="fas fa-phone me-1"></i>
                        Call Emergency
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTrackingModal(false)}
                >
                  Close
                </button>
                {trackingData.staff_contact && (
                  <a 
                    href={`tel:${trackingData.staff_contact}`}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-phone me-2"></i>
                    Call Assigned Staff
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Instructions */}
      <div className="card bg-light border-danger mt-4">
        <div className="card-body">
          <h5>
            <i className="fas fa-info-circle me-2 text-danger"></i>
            Emergency Instructions
          </h5>
          <div className="row">
            <div className="col-md-6">
              <ul className="mb-0">
                <li>Stay on the line when you call emergency numbers</li>
                <li>Keep your phone charged and nearby</li>
                <li>Have patient details ready (name, age, blood group)</li>
                <li>Know the exact hospital location and ward</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="mb-0">
                <li>Keep the patient stable while waiting</li>
                <li>Follow staff instructions carefully</li>
                <li>Do not move the patient unless instructed</li>
                <li>Have identification documents ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverEmergency;