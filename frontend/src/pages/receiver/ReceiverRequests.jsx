import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReceiverRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, processing, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const { receiver } = useSelector((state) => state.receiver);

  // Mock data for demonstration
  const mockRequests = [
    {
      id: 'REQ-001',
      request_id: 1,
      blood_group: 'A+',
      units_needed: 2,
      units_received: 2,
      urgency_level: 'Normal',
      status: 'Completed',
      request_date: '2024-01-15',
      required_date: '2024-01-20',
      completed_date: '2024-01-18',
      hospital_name: 'Civil Hospital, Bahawalnagar',
      patient_name: 'Ahmed Khan',
      contact_person: 'Ali Khan',
      contact_number: '+92 300 1234567',
      doctor_name: 'Dr. Usman',
      ward_room: 'Ward 5, Room 12',
      special_requirements: 'Cross-matched blood required',
      assigned_staff: 'Staff-003',
      staff_notes: 'Blood delivered successfully. Patient stable.',
      verification_status: 'Verified',
      blood_bags: [
        { bag_id: 'BAG-A1-001', donor_id: 'DON-045', donation_date: '2024-01-10', expiry_date: '2024-02-10' },
        { bag_id: 'BAG-A1-002', donor_id: 'DON-078', donation_date: '2024-01-12', expiry_date: '2024-02-12' }
      ]
    },
    {
      id: 'REQ-002',
      request_id: 2,
      blood_group: 'O-',
      units_needed: 1,
      units_received: 0,
      urgency_level: 'Emergency',
      status: 'Processing',
      request_date: '2024-01-20',
      required_date: '2024-01-20',
      completed_date: null,
      hospital_name: 'Red Cross Blood Center',
      patient_name: 'Sara Ahmed',
      contact_person: 'Zain Ahmed',
      contact_number: '+92 333 9876543',
      doctor_name: 'Dr. Fatima',
      ward_room: 'ICU Room 3',
      special_requirements: 'Immediate transfusion needed',
      assigned_staff: 'Staff-007',
      staff_notes: 'Searching for O- donors. Emergency alert sent.',
      verification_status: 'Verified',
      blood_bags: []
    },
    {
      id: 'REQ-003',
      request_id: 3,
      blood_group: 'B+',
      units_needed: 3,
      units_received: 2,
      urgency_level: 'Urgent',
      status: 'Pending',
      request_date: '2024-01-18',
      required_date: '2024-01-22',
      completed_date: null,
      hospital_name: 'IUB Medical Center',
      patient_name: 'Rizwan Ali',
      contact_person: 'Bilal Ali',
      contact_number: '+92 311 4567890',
      doctor_name: 'Dr. Hamid',
      ward_room: 'Ward 3, Room 8',
      special_requirements: 'Fresh blood preferred',
      assigned_staff: null,
      staff_notes: 'Awaiting staff assignment',
      verification_status: 'Pending',
      blood_bags: [
        { bag_id: 'BAG-B1-015', donor_id: 'DON-112', donation_date: '2024-01-15', expiry_date: '2024-02-15' }
      ]
    },
    {
      id: 'REQ-004',
      request_id: 4,
      blood_group: 'AB+',
      units_needed: 1,
      units_received: 0,
      urgency_level: 'Normal',
      status: 'Cancelled',
      request_date: '2024-01-10',
      required_date: '2024-01-17',
      completed_date: '2024-01-12',
      hospital_name: 'Al-Shifa Hospital',
      patient_name: 'Nadia Bibi',
      contact_person: 'Self',
      contact_number: '+92 322 1112233',
      doctor_name: 'Dr. Riaz',
      ward_room: 'Ward 7, Room 5',
      special_requirements: 'No special requirements',
      assigned_staff: 'Staff-012',
      staff_notes: 'Cancelled by patient. Surgery postponed.',
      verification_status: 'Verified',
      blood_bags: []
    },
    {
      id: 'REQ-005',
      request_id: 5,
      blood_group: 'A-',
      units_needed: 2,
      units_received: 0,
      urgency_level: 'Normal',
      status: 'Pending',
      request_date: '2024-01-22',
      required_date: '2024-01-29',
      completed_date: null,
      hospital_name: 'Civil Hospital, Bahawalnagar',
      patient_name: 'Kamran Hussain',
      contact_person: 'Imran Hussain',
      contact_number: '+92 344 5566778',
      doctor_name: 'Dr. Usman',
      ward_room: 'Ward 2, Room 10',
      special_requirements: 'CMV negative if possible',
      assigned_staff: null,
      staff_notes: 'Request received. Under review.',
      verification_status: 'Pending',
      blood_bags: []
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('receiverToken');
      
      // For now, use mock data
      // In production, uncomment the API call
      /*
      const response = await axios.get(`${API_BASE_URL}/receiver/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRequests(response.data.data);
      }
      */
      
      // Using mock data
      setRequests(mockRequests);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback to mock data
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on selected filter and search
  const filteredRequests = requests.filter(request => {
    // Status filter
    if (filter !== 'all' && request.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.id.toLowerCase().includes(searchLower) ||
        request.patient_name.toLowerCase().includes(searchLower) ||
        request.blood_group.toLowerCase().includes(searchLower) ||
        request.hospital_name.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency) => {
    switch(urgency.toLowerCase()) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      case 'normal': return 'success';
      default: return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // View request details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Create new request
  const createNewRequest = () => {
    navigate('/receiver/new-request');
  };

  // Track request
  const trackRequest = (requestId) => {
    navigate(`/receiver/track/${requestId}`);
  };

  // Cancel request
  const cancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        const token = localStorage.getItem('receiverToken');
        await axios.put(
          `${API_BASE_URL}/receiver/requests/${requestId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert('Request cancelled successfully');
        fetchRequests(); // Refresh list
      } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request');
      }
    }
  };

  // Download report
  const downloadReport = (request) => {
    // Mock report download
    const reportData = `
      BLOOD REQUEST REPORT
      ====================
      Request ID: ${request.id}
      Patient: ${request.patient_name}
      Blood Group: ${request.blood_group}
      Units Needed: ${request.units_needed}
      Status: ${request.status}
      Hospital: ${request.hospital_name}
      Doctor: ${request.doctor_name}
      Request Date: ${formatDate(request.request_date)}
      Required Date: ${formatDate(request.required_date)}
      ${request.completed_date ? `Completed Date: ${formatDate(request.completed_date)}` : ''}
      Special Requirements: ${request.special_requirements || 'None'}
    `;
    
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Blood_Request_${request.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    processing: requests.filter(r => r.status === 'Processing').length,
    completed: requests.filter(r => r.status === 'Completed').length,
    cancelled: requests.filter(r => r.status === 'Cancelled').length
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your blood requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-tint me-2 text-danger"></i>
            My Blood Requests
          </h4>
          <p className="text-muted mb-0">Track and manage all your blood requests</p>
        </div>
        <button 
          className="btn btn-success"
          onClick={createNewRequest}
        >
          <i className="fas fa-plus-circle me-2"></i>
          New Blood Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-list text-primary fa-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Pending</h6>
                  <h3 className="mb-0">{stats.pending}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-clock text-warning fa-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Processing</h6>
                  <h3 className="mb-0">{stats.processing}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-sync-alt text-info fa-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Completed</h6>
                  <h3 className="mb-0">{stats.completed}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="fas fa-check-circle text-success fa-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ID, patient name, blood group, or hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-2">
                <button 
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Requests
                </button>
                <button 
                  className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`btn ${filter === 'processing' ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => setFilter('processing')}
                >
                  Processing
                </button>
                <button 
                  className={`btn ${filter === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Blood Requests ({filteredRequests.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Request ID</th>
                    <th>Patient</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Hospital</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.id}</strong>
                      </td>
                      <td>{request.patient_name}</td>
                      <td>
                        <span className="badge bg-danger">{request.blood_group}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold">{request.units_received}/{request.units_needed}</span>
                          <div className="progress ms-2" style={{ width: '60px', height: '6px' }}>
                            <div 
                              className={`progress-bar bg-${getStatusColor(request.status)}`}
                              style={{ width: `${(request.units_received / request.units_needed) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getUrgencyColor(request.urgency_level)}`}>
                          {request.urgency_level}
                        </span>
                      </td>
                      <td>
                        <small>{request.hospital_name}</small>
                      </td>
                      <td>
                        <small>{formatDate(request.request_date)}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor(request.status)} px-3 py-1`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => viewRequestDetails(request)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {request.status === 'Processing' && (
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => trackRequest(request.id)}
                              title="Track Request"
                            >
                              <i className="fas fa-map-marker-alt"></i>
                            </button>
                          )}
                          
                          {(request.status === 'Pending' || request.status === 'Processing') && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => cancelRequest(request.id)}
                              title="Cancel Request"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => downloadReport(request)}
                            title="Download Report"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
              <h5>No blood requests found</h5>
              <p className="text-muted">
                {searchTerm 
                  ? `No requests match "${searchTerm}"`
                  : filter !== 'all' 
                    ? `No ${filter} requests`
                    : 'You have not made any blood requests yet'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <button 
                  className="btn btn-primary"
                  onClick={createNewRequest}
                >
                  <i className="fas fa-plus-circle me-2"></i>
                  Create Your First Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-file-medical me-2"></i>
                  Request Details: {selectedRequest.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left Column */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted">Patient Information</h6>
                      <p className="mb-1">
                        <strong>Patient Name:</strong> {selectedRequest.patient_name}
                      </p>
                      <p className="mb-1">
                        <strong>Blood Group:</strong> 
                        <span className="badge bg-danger ms-2">{selectedRequest.blood_group}</span>
                      </p>
                      <p className="mb-1">
                        <strong>Units Needed:</strong> {selectedRequest.units_needed}
                      </p>
                      <p className="mb-1">
                        <strong>Units Received:</strong> {selectedRequest.units_received}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted">Hospital Information</h6>
                      <p className="mb-1">
                        <strong>Hospital:</strong> {selectedRequest.hospital_name}
                      </p>
                      <p className="mb-1">
                        <strong>Doctor:</strong> {selectedRequest.doctor_name || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Ward/Room:</strong> {selectedRequest.ward_room || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="text-muted">Request Details</h6>
                      <p className="mb-1">
                        <strong>Urgency:</strong>
                        <span className={`badge bg-${getUrgencyColor(selectedRequest.urgency_level)} ms-2`}>
                          {selectedRequest.urgency_level}
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong>
                        <span className={`badge bg-${getStatusColor(selectedRequest.status)} ms-2`}>
                          {selectedRequest.status}
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Request Date:</strong> {formatDate(selectedRequest.request_date)}
                      </p>
                      <p className="mb-1">
                        <strong>Required Date:</strong> {formatDate(selectedRequest.required_date)}
                      </p>
                      {selectedRequest.completed_date && (
                        <p className="mb-1">
                          <strong>Completed Date:</strong> {formatDate(selectedRequest.completed_date)}
                        </p>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-muted">Contact Information</h6>
                      <p className="mb-1">
                        <strong>Contact Person:</strong> {selectedRequest.contact_person}
                      </p>
                      <p className="mb-1">
                        <strong>Contact Number:</strong> {selectedRequest.contact_number}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Special Requirements */}
                {selectedRequest.special_requirements && (
                  <div className="mb-3">
                    <h6 className="text-muted">Special Requirements</h6>
                    <div className="alert alert-info p-2">
                      {selectedRequest.special_requirements}
                    </div>
                  </div>
                )}
                
                {/* Staff Notes */}
                {selectedRequest.staff_notes && (
                  <div className="mb-3">
                    <h6 className="text-muted">Staff Notes</h6>
                    <div className="alert alert-warning p-2">
                      {selectedRequest.staff_notes}
                    </div>
                  </div>
                )}
                
                {/* Blood Bags Assigned */}
                {selectedRequest.blood_bags && selectedRequest.blood_bags.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-muted">Blood Bags Assigned</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Bag ID</th>
                            <th>Donor ID</th>
                            <th>Donation Date</th>
                            <th>Expiry Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequest.blood_bags.map(bag => (
                            <tr key={bag.bag_id}>
                              <td>{bag.bag_id}</td>
                              <td>{bag.donor_id}</td>
                              <td>{formatDate(bag.donation_date)}</td>
                              <td>{formatDate(bag.expiry_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    downloadReport(selectedRequest);
                    setShowModal(false);
                  }}
                >
                  <i className="fas fa-download me-2"></i>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverRequests;