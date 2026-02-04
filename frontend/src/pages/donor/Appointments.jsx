import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";

const Appointments = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentList, setAppointmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appointmentsPerPage = 8;

  // Get donor from Redux
  const donor = useSelector((state) => state.donor?.donor);

  // Fetch appointments for donor
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get donor ID from multiple sources
        let donorId;
        
        if (donor?.id) {
          donorId = donor.id;
        } else {
          // Try localStorage as fallback
          try {
            const storedDonor = localStorage.getItem('donorData');
            if (storedDonor) {
              const parsedDonor = JSON.parse(storedDonor);
              donorId = parsedDonor.id;
            }
          } catch (err) {
            console.log('Error parsing localStorage:', err);
          }
        }

        if (!donorId) {
          setError('Unable to identify donor. Please login again.');
          setLoading(false);
          return;
        }

        console.log('Fetching appointments for donor ID:', donorId);
        
        // Get token for authorization
        const token = localStorage.getItem('donorToken');
        
        // API endpoint - adjust according to your backend
        const endpoint = `http://127.0.0.1:8000/api/donor/${donorId}/appointments`;
        
        const config = token ? {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        } : {};
        
        const res = await axios.get(endpoint, config);
        console.log('Appointments API response:', res.data);
        
        // Handle different response formats
        if (res.data.success) {
          // Format 1: { success: true, data: [...] }
          if (Array.isArray(res.data.data)) {
            setAppointmentList(res.data.data);
          } 
          // Format 2: { success: true, appointments: [...] }
          else if (res.data.appointments && Array.isArray(res.data.appointments)) {
            setAppointmentList(res.data.appointments);
          }
          // Format 3: { success: true, data: { appointments: [...] } }
          else if (res.data.data?.appointments) {
            setAppointmentList(res.data.data.appointments);
          } else {
            setAppointmentList([]);
          }
        } 
        // Direct array response
        else if (Array.isArray(res.data)) {
          setAppointmentList(res.data);
        } 
        // { data: [...] } format
        else if (res.data.data && Array.isArray(res.data.data)) {
          setAppointmentList(res.data.data);
        } else {
          console.log('Unexpected API response format:', res.data);
          setAppointmentList([]);
        }
        
      } catch (err) {
        console.error("Error loading appointments:", err);
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
        } else if (err.response?.status === 404) {
          setError('No appointments found.');
          setAppointmentList([]);
        } else if (err.message === "Network Error") {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Failed to load appointments. Please try again.');
        }
        
        setAppointmentList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [donor]);

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointmentList.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointmentList.length / appointmentsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      case 'rejected': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle appointment action (accept/reject)
  const handleAppointmentAction = async (appointmentId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('donorToken');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/appointments/${appointmentId}/${action}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setAppointmentList(prev => 
          prev.map(app => 
            app.id === appointmentId 
              ? { ...app, status: action === 'accept' ? 'confirmed' : 'rejected' }
              : app
          )
        );
        alert(`Appointment ${action === 'accept' ? 'confirmed' : 'rejected'} successfully!`);
      }
    } catch (err) {
      console.error(`Error ${action}ing appointment:`, err);
      alert(`Failed to ${action} appointment. Please try again.`);
    }
  };

  return (
    <div className="appointments-page">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Appointments</h2>
            <p className="text-muted mb-0">
              Manage your blood donation appointment requests
            </p>
          </div>
          
          {/* Stats Badge */}
          {!loading && !error && (
            <div className="badge bg-primary fs-6 px-3 py-2">
              <i className="fas fa-calendar-alt me-2"></i>
              {appointmentList.length} Request{appointmentList.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your appointments...</p>
        </div>
      ) : (
        <>
          {/* Appointment Stats */}
          {appointmentList.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body py-3">
                    <div className="row g-3">
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="text-primary fw-bold fs-4">
                            {appointmentList.filter(a => a.status === 'pending').length}
                          </div>
                          <small className="text-muted">Pending</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="text-success fw-bold fs-4">
                            {appointmentList.filter(a => a.status === 'confirmed').length}
                          </div>
                          <small className="text-muted">Confirmed</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="text-info fw-bold fs-4">
                            {appointmentList.filter(a => a.status === 'completed').length}
                          </div>
                          <small className="text-muted">Completed</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="text-danger fw-bold fs-4">
                            {appointmentList.filter(a => a.status === 'cancelled' || a.status === 'rejected').length}
                          </div>
                          <small className="text-muted">Cancelled/Rejected</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="row">
            {currentAppointments.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-calendar-times text-muted" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-secondary mb-3">No Appointment Requests Found</h4>
                    <p className="text-muted mb-0">
                      You don't have any appointment requests yet. <br />
                      Hospitals will send you appointment requests here when they need your blood type.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              currentAppointments.map((appointment, index) => (
                <div key={appointment.id || index} className="col-12 mb-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary me-2">
                          #{appointment.id || index + 1}
                        </span>
                        <span className={`badge bg-${getStatusBadge(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <small className="text-muted">
                        Requested: {formatDate(appointment.created_at)}
                      </small>
                    </div>
                    
                    <div className="card-body">
                      <div className="row">
                        {/* Hospital Information */}
                        <div className="col-md-6 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-hospital me-2"></i>Hospital Information
                          </h6>
                          <div className="ps-3">
                            <p className="mb-2">
                              <strong>Hospital:</strong> {appointment.hospital_name || appointment.hospital?.name || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Address:</strong> {appointment.hospital_address || appointment.hospital?.address || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Contact:</strong> {appointment.hospital_contact || appointment.hospital?.phone || 'N/A'}
                            </p>
                            <p className="mb-0">
                              <strong>Email:</strong> {appointment.hospital_email || appointment.hospital?.email || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="col-md-6 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-calendar-day me-2"></i>Appointment Details
                          </h6>
                          <div className="ps-3">
                            <p className="mb-2">
                              <strong>Date:</strong> {formatDate(appointment.appointment_date || appointment.request_date)}
                            </p>
                            {appointment.appointment_time && (
                              <p className="mb-2">
                                <strong>Time:</strong> {formatTime(appointment.appointment_time)}
                              </p>
                            )}
                            {appointment.urgency && (
                              <p className="mb-2">
                                <strong>Urgency:</strong> 
                                <span className={`badge bg-${appointment.urgency === 'high' ? 'danger' : 'warning'} ms-2`}>
                                  {appointment.urgency.toUpperCase()}
                                </span>
                              </p>
                            )}
                            {appointment.notes && (
                              <p className="mb-0">
                                <strong>Notes:</strong> {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contact Officer */}
                        <div className="col-md-6 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-user-md me-2"></i>Contact Officer
                          </h6>
                          <div className="ps-3">
                            <p className="mb-2">
                              <strong>Officer:</strong> {appointment.officer_name || appointment.full_name || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Phone:</strong> {appointment.officer_phone || appointment.phone_number || 'N/A'}
                            </p>
                            <p className="mb-0">
                              <strong>Gender:</strong> {appointment.gender || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Actions (for pending appointments) */}
                        <div className="col-md-6 mb-3">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-tasks me-2"></i>Actions
                          </h6>
                          <div className="ps-3">
                            {appointment.status === 'pending' ? (
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                                >
                                  <i className="fas fa-check me-1"></i> Accept
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                                >
                                  <i className="fas fa-times me-1"></i> Reject
                                </button>
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    // TODO: Implement view details modal
                                    alert('View details feature coming soon!');
                                  }}
                                >
                                  <i className="fas fa-info-circle me-1"></i> Details
                                </button>
                              </div>
                            ) : (
                              <div className="alert alert-light">
                                <small className="text-muted">
                                  This appointment has been <strong>{appointment.status}</strong>.
                                  {appointment.updated_at && ` Updated on: ${formatDate(appointment.updated_at)}`}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {appointmentList.length > appointmentsPerPage && (
            <div className="row mt-4">
              <div className="col-12">
                <nav aria-label="Appointments pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left me-1"></i> Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li 
                        key={i} 
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* Instructions for new donors */}
      {!loading && appointmentList.length === 0 && !error && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <i className="fas fa-info-circle me-2"></i>How Appointments Work
                </h5>
                <div className="row mt-3">
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-bell text-white"></i>
                      </div>
                      <h6>1. Receive Request</h6>
                      <small className="text-muted">Hospitals send appointment requests when they need your blood type</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-check text-white"></i>
                      </div>
                      <h6>2. Accept/Reject</h6>
                      <small className="text-muted">Review and respond to appointment requests</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-info rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-hospital text-white"></i>
                      </div>
                      <h6>3. Visit Hospital</h6>
                      <small className="text-muted">Visit the hospital at the scheduled time</small>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center">
                      <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                           style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-history text-white"></i>
                      </div>
                      <h6>4. Track History</h6>
                      <small className="text-muted">View your donation history in your profile</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;