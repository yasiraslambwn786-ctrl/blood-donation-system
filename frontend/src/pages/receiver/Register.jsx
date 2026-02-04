// FILE: src/pages/receiver/ReceiverVerification.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const ReceiverVerification = () => {
  const [receiver, setReceiver] = useState({});
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [requestingHospital, setRequestingHospital] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    mobile: false,
    hospital: false
  });

  useEffect(() => {
    const fetchReceiverData = () => {
      const storedData = localStorage.getItem('receiver_data');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setReceiver(parsedData);
          
          setVerificationStatus({
            email: parsedData.email_verified || false,
            mobile: parsedData.mobile_verified || false,
            hospital: parsedData.hospital_verified || false
          });
        } catch (error) {
          console.error('Error parsing receiver data:', error);
        }
      }
      setLoading(false);
    };

    fetchReceiverData();
  }, []);

  // ✅ Laravel API se email verification bhejna
  const sendEmailVerification = async () => {
    if (!receiver.id && !receiver.receiver_id) {
      alert('Receiver ID not found. Please login again.');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await axios.post('/receiver/send-email-verification', {
        receiver_id: receiver.id || receiver.receiver_id,
        email: receiver.email
      });
      
      if (response.data.success) {
        alert('Verification email sent successfully! Please check your inbox.');
        
        // Update local storage
        const updatedReceiver = { 
          ...receiver, 
          email_verification_sent: true 
        };
        localStorage.setItem('receiver_data', JSON.stringify(updatedReceiver));
      } else {
        alert('Failed to send verification email: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // ✅ Laravel API se mobile OTP bhejna
  const sendMobileOTP = async () => {
    if (!receiver.id && !receiver.receiver_id) {
      alert('Receiver ID not found. Please login again.');
      return;
    }

    setSendingOTP(true);
    try {
      const response = await axios.post('/receiver/send-mobile-otp', {
        receiver_id: receiver.id || receiver.receiver_id,
        phone_number: receiver.phone_number
      });
      
      if (response.data.success) {
        alert(`OTP sent to ${receiver.phone_number}`);
      } else {
        alert('Failed to send OTP: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  // ✅ Laravel API se mobile OTP verify karna
  const verifyMobileOTP = async () => {
    const otp = prompt('Enter the 6-digit OTP sent to your mobile:');
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOTP(true);
    try {
      const response = await axios.post('/receiver/verify-mobile-otp', {
        receiver_id: receiver.id || receiver.receiver_id,
        otp: otp
      });
      
      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, mobile: true }));
        
        // Update receiver data
        const updatedReceiver = { 
          ...receiver, 
          mobile_verified: true,
          ...response.data.receiver
        };
        localStorage.setItem('receiver_data', JSON.stringify(updatedReceiver));
        setReceiver(updatedReceiver);
        
        alert('Mobile number verified successfully!');
      } else {
        alert('OTP verification failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setVerifyingOTP(false);
    }
  };

  // ✅ Laravel API se hospital verification request
  const requestHospitalVerification = async () => {
    if (!receiver.id && !receiver.receiver_id) {
      alert('Receiver ID not found. Please login again.');
      return;
    }

    setRequestingHospital(true);
    try {
      const response = await axios.post('/receiver/request-hospital-verification', {
        receiver_id: receiver.id || receiver.receiver_id,
        hospital_name: receiver.hospital_name,
        hospital_contact: receiver.hospital_contact
      });
      
      if (response.data.success) {
        alert('Hospital verification requested. Our team will contact the hospital.');
        
        // For demo, auto-update after 3 seconds
        setTimeout(() => {
          setVerificationStatus(prev => ({ ...prev, hospital: true }));
          
          const updatedReceiver = { 
            ...receiver, 
            hospital_verified: true 
          };
          localStorage.setItem('receiver_data', JSON.stringify(updatedReceiver));
          setReceiver(updatedReceiver);
          
          alert('Hospital verification completed!');
        }, 3000);
      } else {
        alert('Failed to request hospital verification: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error requesting hospital verification:', error);
      alert('Error requesting hospital verification. Please try again.');
    } finally {
      setRequestingHospital(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="receiver-verification">
      <div className="row">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                <i className="fas fa-user-check me-2 text-primary"></i>
                Account Verification
              </h4>
              <p className="text-muted mb-0">
                Complete these verifications to access all features
              </p>
            </div>
            <div className="card-body">
              
              {/* Email Verification Card */}
              <div className="card mb-3 border-left-3 border-left-primary">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title">
                        <i className="fas fa-envelope me-2"></i>
                        Email Verification
                      </h5>
                      <p className="card-text text-muted">
                        Verify your email address: <strong>{receiver.email || 'Not set'}</strong>
                      </p>
                    </div>
                    <div>
                      {verificationStatus.email ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check-circle me-1"></i> Verified
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          onClick={sendEmailVerification}
                          disabled={sendingEmail || !receiver.email}
                        >
                          {sendingEmail ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-1"></i>
                              Send Verification Email
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Verification Card */}
              <div className="card mb-3 border-left-3 border-left-info">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title">
                        <i className="fas fa-mobile-alt me-2"></i>
                        Mobile Verification
                      </h5>
                      <p className="card-text text-muted">
                        Verify your mobile number: <strong>{receiver.phone_number || 'Not set'}</strong>
                      </p>
                    </div>
                    <div>
                      {verificationStatus.mobile ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check-circle me-1"></i> Verified
                        </span>
                      ) : (
                        <div className="btn-group">
                          <button 
                            className="btn btn-info"
                            onClick={sendMobileOTP}
                            disabled={sendingOTP || !receiver.phone_number}
                          >
                            {sendingOTP ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-sms me-1"></i> Send OTP
                              </>
                            )}
                          </button>
                          <button 
                            className="btn btn-outline-info"
                            onClick={verifyMobileOTP}
                            disabled={verifyingOTP}
                          >
                            {verifyingOTP ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Verifying...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check me-1"></i> Verify OTP
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Verification Card */}
              <div className="card mb-3 border-left-3 border-left-warning">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title">
                        <i className="fas fa-hospital me-2"></i>
                        Hospital Verification
                      </h5>
                      <p className="card-text text-muted">
                        Hospital: <strong>{receiver.hospital_name || 'Not specified'}</strong>
                      </p>
                    </div>
                    <div>
                      {verificationStatus.hospital ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check-circle me-1"></i> Verified
                        </span>
                      ) : (
                        <button 
                          className="btn btn-warning"
                          onClick={requestHospitalVerification}
                          disabled={requestingHospital || !receiver.hospital_name}
                        >
                          {requestingHospital ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Requesting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-1"></i>
                              Request Verification
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Progress */}
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-chart-line me-2"></i>
                    Verification Progress
                  </h5>
                  
                  <div className="progress mb-3" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ 
                        width: `${(Object.values(verificationStatus).filter(Boolean).length / 3) * 100}%` 
                      }}
                    >
                      {Math.round((Object.values(verificationStatus).filter(Boolean).length / 3) * 100)}%
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 text-center">
                      <div className={`p-3 rounded ${verificationStatus.email ? 'bg-success text-white' : 'bg-white'}`}>
                        <i className={`fas fa-envelope fa-2x ${verificationStatus.email ? '' : 'text-muted'}`}></i>
                        <p className="mb-0 mt-2">Email</p>
                        <span className="badge bg-light text-dark">{verificationStatus.email ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <div className={`p-3 rounded ${verificationStatus.mobile ? 'bg-success text-white' : 'bg-white'}`}>
                        <i className={`fas fa-mobile-alt fa-2x ${verificationStatus.mobile ? '' : 'text-muted'}`}></i>
                        <p className="mb-0 mt-2">Mobile</p>
                        <span className="badge bg-light text-dark">{verificationStatus.mobile ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <div className={`p-3 rounded ${verificationStatus.hospital ? 'bg-success text-white' : 'bg-white'}`}>
                        <i className={`fas fa-hospital fa-2x ${verificationStatus.hospital ? '' : 'text-muted'}`}></i>
                        <p className="mb-0 mt-2">Hospital</p>
                        <span className="badge bg-light text-dark">{verificationStatus.hospital ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverVerification;