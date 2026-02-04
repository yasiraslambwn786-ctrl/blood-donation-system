import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setReceiverData } from '../../redux/slices/receiverSlice';

const ReceiverVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { receiver, loading } = useSelector((state) => state.receiver);
  
  const [activeStep, setActiveStep] = useState('mobile');
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    email: false,
    hospital: false,
    identity: false
  });
  
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [hospitalForm, setHospitalForm] = useState({
    hospital_contact_person: '',
    hospital_contact_phone: '',
    hospital_contact_email: '',
    hospital_department: 'Blood Bank',
    verification_method: 'call',
    verification_time: 'morning'
  });
  
  const [identityDocuments, setIdentityDocuments] = useState({
    cnic_front: null,
    cnic_back: null,
    patient_cnic: null,
    hospital_letter: null,
    doctor_prescription: null
  });
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (!receiver) {
      // Try to get receiver from localStorage
      const storedReceiver = JSON.parse(localStorage.getItem('receiverData') || '{}');
      if (storedReceiver.id) {
        dispatch(setReceiverData(storedReceiver));
      } else {
        navigate('/login-receiver');
      }
    }
    
    // Initialize verification status
    if (receiver) {
      setVerificationStatus({
        mobile: receiver.mobile_verified || false,
        email: receiver.email_verified || false,
        hospital: receiver.hospital_verified || false,
        identity: receiver.identity_verified || false
      });
      
      // Auto-select next unverified step
      if (!receiver.mobile_verified) setActiveStep('mobile');
      else if (!receiver.email_verified) setActiveStep('email');
      else if (!receiver.hospital_verified) setActiveStep('hospital');
      else if (!receiver.identity_verified) setActiveStep('identity');
      else setActiveStep('complete');
    }
  }, [receiver, navigate, dispatch]);

  // Handle mobile OTP input
  const handleMobileOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...mobileOtp];
      newOtp[index] = value;
      setMobileOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`mobile-otp-${index + 1}`)?.focus();
      }
    }
  };

  // Handle email OTP input
  const handleEmailOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...emailOtp];
      newOtp[index] = value;
      setEmailOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`email-otp-${index + 1}`)?.focus();
      }
    }
  };

  // Send mobile OTP
  const sendMobileOtp = async () => {
    if (!receiver?.mobile_number) {
      setErrorMessage('Mobile number not found');
      return;
    }
    
    setSendingOtp(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.post(
        `${API_BASE_URL}/receiver/send-mobile-otp`,
        { mobile_number: receiver.mobile_number },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage(`OTP sent to ${receiver.mobile_number}`);
        setResendCooldown(60); // 60 seconds cooldown
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify mobile OTP
  const verifyMobileOtp = async () => {
    const otp = mobileOtp.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter 6-digit OTP');
      return;
    }
    
    setVerifying(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.post(
        `${API_BASE_URL}/receiver/verify-mobile`,
        { mobile_number: receiver.mobile_number, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, mobile: true }));
        setSuccessMessage('Mobile number verified successfully!');
        
        // Update receiver data
        if (receiver) {
          const updatedReceiver = { ...receiver, mobile_verified: true };
          dispatch(setReceiverData(updatedReceiver));
          localStorage.setItem('receiverData', JSON.stringify(updatedReceiver));
        }
        
        setTimeout(() => {
          setSuccessMessage('');
          setActiveStep('email');
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  // Send email verification
  const sendEmailVerification = async () => {
    if (!receiver?.email) {
      setErrorMessage('Email address not found');
      return;
    }
    
    setSendingOtp(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.post(
        `${API_BASE_URL}/receiver/send-email-verification`,
        { email: receiver.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage(`Verification email sent to ${receiver.email}`);
        setResendCooldown(60); // 60 seconds cooldown
        
        // Start countdown
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify email OTP
  const verifyEmailOtp = async () => {
    const otp = emailOtp.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter 6-digit OTP');
      return;
    }
    
    setVerifying(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.post(
        `${API_BASE_URL}/receiver/verify-email`,
        { email: receiver.email, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, email: true }));
        setSuccessMessage('Email verified successfully!');
        
        // Update receiver data
        if (receiver) {
          const updatedReceiver = { ...receiver, email_verified: true };
          dispatch(setReceiverData(updatedReceiver));
          localStorage.setItem('receiverData', JSON.stringify(updatedReceiver));
        }
        
        setTimeout(() => {
          setSuccessMessage('');
          setActiveStep('hospital');
        }, 2000);
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setErrorMessage(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  // Handle hospital form changes
  const handleHospitalFormChange = (e) => {
    const { name, value } = e.target;
    setHospitalForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit hospital verification request
  const submitHospitalVerification = async () => {
    if (!hospitalForm.hospital_contact_person || !hospitalForm.hospital_contact_phone) {
      setErrorMessage('Hospital contact person and phone are required');
      return;
    }
    
    setVerifying(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.post(
        `${API_BASE_URL}/receiver/request-hospital-verification`,
        {
          hospital_name: receiver?.hospital_name,
          patient_name: receiver?.patient_name,
          contact_person: hospitalForm.hospital_contact_person,
          contact_phone: hospitalForm.hospital_contact_phone,
          contact_email: hospitalForm.hospital_contact_email,
          verification_method: hospitalForm.verification_method,
          preferred_time: hospitalForm.verification_time
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Hospital verification request submitted successfully! Our team will contact the hospital within 24 hours.');
        
        setTimeout(() => {
          setSuccessMessage('');
          setActiveStep('identity');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting hospital verification:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setVerifying(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = (documentType, file) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrorMessage('File size must be less than 5MB');
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setErrorMessage('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    
    setIdentityDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  // Submit identity verification
  const submitIdentityVerification = async () => {
    // Check if at least CNIC or patient CNIC is uploaded
    if (!identityDocuments.cnic_front && !identityDocuments.patient_cnic) {
      setErrorMessage('Please upload at least one identity document (CNIC or Patient CNIC)');
      return;
    }
    
    setVerifying(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const formData = new FormData();
      
      // Append documents
      Object.entries(identityDocuments).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });
      
      // Append receiver info
      formData.append('receiver_id', receiver?.id);
      formData.append('patient_name', receiver?.patient_name);
      
      const response = await axios.post(
        `${API_BASE_URL}/receiver/submit-identity-verification`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, identity: true }));
        setSuccessMessage('Identity documents submitted successfully! Verification typically takes 24-48 hours.');
        
        // Update receiver data
        if (receiver) {
          const updatedReceiver = { ...receiver, identity_submitted: true };
          dispatch(setReceiverData(updatedReceiver));
          localStorage.setItem('receiverData', JSON.stringify(updatedReceiver));
        }
        
        setTimeout(() => {
          setSuccessMessage('');
          setActiveStep('complete');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting identity verification:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit documents');
    } finally {
      setVerifying(false);
    }
  };

  // Skip verification for now
  const skipForNow = () => {
    if (window.confirm('You can complete verification later, but some features may be limited. Continue to dashboard?')) {
      navigate('/receiver/dashboard');
    }
  };

  // Get verification percentage
  const getVerificationPercentage = () => {
    const verifiedCount = Object.values(verificationStatus).filter(v => v).length;
    return Math.round((verifiedCount / 4) * 100);
  };

  // Get verification badge
  const getVerificationBadge = () => {
    const percentage = getVerificationPercentage();
    
    if (percentage === 100) {
      return <span className="badge bg-success px-3 py-2">Fully Verified</span>;
    } else if (percentage >= 50) {
      return <span className="badge bg-warning px-3 py-2">Partially Verified</span>;
    } else {
      return <span className="badge bg-danger px-3 py-2">Not Verified</span>;
    }
  };

  // Render mobile verification step
  const renderMobileVerification = () => (
    <div className="card shadow-lg">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-mobile-alt me-2"></i>
          Mobile Number Verification
        </h5>
      </div>
      <div className="card-body">
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <i className="fas fa-phone fa-2x text-primary"></i>
              </div>
              <div>
                <h6 className="mb-1">Verify Mobile Number</h6>
                <p className="text-muted mb-0">
                  {receiver?.mobile_number || 'No mobile number found'}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            {verificationStatus.mobile ? (
              <span className="badge bg-success px-3 py-2">
                <i className="fas fa-check-circle me-1"></i>
                Verified
              </span>
            ) : (
              <button 
                className="btn btn-outline-primary"
                onClick={sendMobileOtp}
                disabled={sendingOtp || resendCooldown > 0}
              >
                {sendingOtp ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Send OTP'
                )}
              </button>
            )}
          </div>
        </div>
        
        {!verificationStatus.mobile && (
          <>
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              A 6-digit OTP will be sent via SMS to your mobile number for verification.
            </div>
            
            <div className="text-center my-4">
              <h6 className="mb-3">Enter OTP</h6>
              <div className="d-flex justify-content-center gap-2 mb-3">
                {mobileOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`mobile-otp-${index}`}
                    type="text"
                    className="form-control text-center otp-input"
                    style={{ width: '50px', height: '60px', fontSize: '24px' }}
                    value={digit}
                    onChange={(e) => handleMobileOtpChange(index, e.target.value)}
                    maxLength="1"
                    disabled={verifying}
                  />
                ))}
              </div>
              
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button 
                  className="btn btn-primary px-4"
                  onClick={verifyMobileOtp}
                  disabled={verifying || mobileOtp.join('').length !== 6}
                >
                  {verifying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={sendMobileOtp}
                  disabled={sendingOtp || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </div>
          </>
        )}
        
        {verificationStatus.mobile && (
          <div className="alert alert-success text-center">
            <i className="fas fa-check-circle fa-2x mb-3"></i>
            <h5>Mobile Number Verified Successfully!</h5>
            <p className="mb-0">
              Your mobile number {receiver?.mobile_number} has been verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render email verification step
  const renderEmailVerification = () => (
    <div className="card shadow-lg">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="fas fa-envelope me-2"></i>
          Email Address Verification
        </h5>
      </div>
      <div className="card-body">
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                <i className="fas fa-envelope fa-2x text-info"></i>
              </div>
              <div>
                <h6 className="mb-1">Verify Email Address</h6>
                <p className="text-muted mb-0">
                  {receiver?.email || 'No email address found'}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            {verificationStatus.email ? (
              <span className="badge bg-success px-3 py-2">
                <i className="fas fa-check-circle me-1"></i>
                Verified
              </span>
            ) : (
              <button 
                className="btn btn-outline-info"
                onClick={sendEmailVerification}
                disabled={sendingOtp || resendCooldown > 0}
              >
                {sendingOtp ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Send Verification Email'
                )}
              </button>
            )}
          </div>
        </div>
        
        {!verificationStatus.email && (
          <>
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              A verification email with 6-digit code will be sent to your email address.
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="text-center my-4">
                  <h6 className="mb-3">Enter Verification Code</h6>
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {emailOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`email-otp-${index}`}
                        type="text"
                        className="form-control text-center otp-input"
                        style={{ width: '50px', height: '60px', fontSize: '24px' }}
                        value={digit}
                        onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                        maxLength="1"
                        disabled={verifying}
                      />
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button 
                      className="btn btn-info px-4"
                      onClick={verifyEmailOtp}
                      disabled={verifying || emailOtp.join('').length !== 6}
                    >
                      {verifying ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <h6>
                    <i className="fas fa-lightbulb me-2 text-warning"></i>
                    Email Not Received?
                  </h6>
                  <ul className="small">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Wait a few minutes for delivery</li>
                    <li>Try resending the verification email</li>
                  </ul>
                  
                  <button 
                    className="btn btn-outline-warning btn-sm w-100"
                    onClick={sendEmailVerification}
                    disabled={sendingOtp || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {verificationStatus.email && (
          <div className="alert alert-success text-center">
            <i className="fas fa-check-circle fa-2x mb-3"></i>
            <h5>Email Address Verified Successfully!</h5>
            <p className="mb-0">
              Your email address {receiver?.email} has been verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render hospital verification step
  const renderHospitalVerification = () => (
    <div className="card shadow-lg">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-hospital me-2"></i>
          Hospital Verification
        </h5>
      </div>
      <div className="card-body">
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <i className="fas fa-hospital fa-2x text-success"></i>
              </div>
              <div>
                <h6 className="mb-1">Verify Hospital Admission</h6>
                <p className="text-muted mb-0">
                  {receiver?.hospital_name || 'No hospital specified'}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            {verificationStatus.hospital ? (
              <span className="badge bg-success px-3 py-2">
                <i className="fas fa-check-circle me-1"></i>
                Verified
              </span>
            ) : (
              <span className="badge bg-warning px-3 py-2">Pending</span>
            )}
          </div>
        </div>
        
        {!verificationStatus.hospital ? (
          <>
            <div className="alert alert-warning">
              <h6>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Important Verification Step
              </h6>
              <p className="mb-0">
                Our team needs to verify that the patient is actually admitted at the specified hospital.
                This helps prevent fraudulent requests and ensures blood reaches genuine patients.
              </p>
            </div>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Hospital Contact Person *</label>
                <input
                  type="text"
                  className="form-control"
                  name="hospital_contact_person"
                  value={hospitalForm.hospital_contact_person}
                  onChange={handleHospitalFormChange}
                  placeholder="e.g., Dr. Usman, Ward In-charge"
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Contact Phone *</label>
                <div className="input-group">
                  <span className="input-group-text">+92</span>
                  <input
                    type="tel"
                    className="form-control"
                    name="hospital_contact_phone"
                    value={hospitalForm.hospital_contact_phone}
                    onChange={handleHospitalFormChange}
                    placeholder="Hospital phone number"
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Contact Email (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  name="hospital_contact_email"
                  value={hospitalForm.hospital_contact_email}
                  onChange={handleHospitalFormChange}
                  placeholder="hospital@example.com"
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Department</label>
                <select
                  className="form-select"
                  name="hospital_department"
                  value={hospitalForm.hospital_department}
                  onChange={handleHospitalFormChange}
                >
                  <option value="Blood Bank">Blood Bank</option>
                  <option value="Emergency">Emergency</option>
                  <option value="ICU">ICU</option>
                  <option value="Ward">Ward</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Verification Method</label>
                <select
                  className="form-select"
                  name="verification_method"
                  value={hospitalForm.verification_method}
                  onChange={handleHospitalFormChange}
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="visit">Hospital Visit</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Preferred Contact Time</label>
                <select
                  className="form-select"
                  name="verification_time"
                  value={hospitalForm.verification_time}
                  onChange={handleHospitalFormChange}
                >
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
                  <option value="evening">Evening (6 PM - 8 PM)</option>
                  <option value="anytime">Anytime during working hours</option>
                </select>
              </div>
            </div>
            
            <div className="alert alert-info mt-4">
              <h6>
                <i className="fas fa-info-circle me-2"></i>
                What happens next?
              </h6>
              <ul className="mb-0">
                <li>Our verification team will contact the hospital</li>
                <li>They will confirm patient admission and blood requirement</li>
                <li>Verification usually takes 2-24 hours</li>
                <li>You'll receive notification once verified</li>
              </ul>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setActiveStep('email')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-success"
                  onClick={submitHospitalVerification}
                  disabled={verifying || !hospitalForm.hospital_contact_person || !hospitalForm.hospital_contact_phone}
                >
                  {verifying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Verification Request'
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-warning"
                  onClick={skipForNow}
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-success text-center">
            <i className="fas fa-check-circle fa-2x mb-3"></i>
            <h5>Hospital Verified Successfully!</h5>
            <p className="mb-0">
              {receiver?.hospital_name} has been verified. Blood requests can now be processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render identity verification step
  const renderIdentityVerification = () => (
    <div className="card shadow-lg">
      <div className="card-header bg-warning text-white">
        <h5 className="mb-0">
          <i className="fas fa-id-card me-2"></i>
          Identity Verification
        </h5>
      </div>
      <div className="card-body">
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                <i className="fas fa-id-card fa-2x text-warning"></i>
              </div>
              <div>
                <h6 className="mb-1">Upload Identity Documents</h6>
                <p className="text-muted mb-0">
                  Upload required documents for identity verification
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            {verificationStatus.identity ? (
              <span className="badge bg-success px-3 py-2">
                <i className="fas fa-check-circle me-1"></i>
                Verified
              </span>
            ) : (
              <span className="badge bg-warning px-3 py-2">Pending</span>
            )}
          </div>
        </div>
        
        {!verificationStatus.identity ? (
          <>
            <div className="alert alert-warning">
              <h6>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Required for Full Access
              </h6>
              <p className="mb-0">
                Identity verification is required for emergency blood requests and 
                to increase your daily request limit. Documents are encrypted and stored securely.
              </p>
            </div>
            
            <div className="row g-4">
              {/* Contact Person CNIC */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-user fa-3x text-primary"></i>
                    </div>
                    <h6>Contact Person CNIC</h6>
                    <p className="small text-muted">
                      Your CNIC (Front & Back) or B-Form
                    </p>
                    
                    <div className="d-flex gap-2 mb-3">
                      <div className="flex-fill">
                        <label className="btn btn-outline-primary w-100">
                          <i className="fas fa-upload me-2"></i>
                          Front Side
                          <input
                            type="file"
                            className="d-none"
                            onChange={(e) => handleDocumentUpload('cnic_front', e.target.files[0])}
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                        </label>
                        {identityDocuments.cnic_front && (
                          <small className="text-success">
                            <i className="fas fa-check me-1"></i>
                            Uploaded
                          </small>
                        )}
                      </div>
                      
                      <div className="flex-fill">
                        <label className="btn btn-outline-primary w-100">
                          <i className="fas fa-upload me-2"></i>
                          Back Side
                          <input
                            type="file"
                            className="d-none"
                            onChange={(e) => handleDocumentUpload('cnic_back', e.target.files[0])}
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                        </label>
                        {identityDocuments.cnic_back && (
                          <small className="text-success">
                            <i className="fas fa-check me-1"></i>
                            Uploaded
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Patient CNIC */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-user-injured fa-3x text-danger"></i>
                    </div>
                    <h6>Patient CNIC/B-Form</h6>
                    <p className="small text-muted">
                      Patient's CNIC or B-Form (if different from contact person)
                    </p>
                    
                    <label className="btn btn-outline-danger w-100 mb-3">
                      <i className="fas fa-upload me-2"></i>
                      Upload Patient CNIC
                      <input
                        type="file"
                        className="d-none"
                        onChange={(e) => handleDocumentUpload('patient_cnic', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                    {identityDocuments.patient_cnic && (
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Uploaded
                      </small>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hospital Documents */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-file-medical fa-3x text-success"></i>
                    </div>
                    <h6>Hospital Letter</h6>
                    <p className="small text-muted">
                      Official hospital letter confirming admission
                    </p>
                    
                    <label className="btn btn-outline-success w-100 mb-3">
                      <i className="fas fa-upload me-2"></i>
                      Upload Hospital Letter
                      <input
                        type="file"
                        className="d-none"
                        onChange={(e) => handleDocumentUpload('hospital_letter', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                    {identityDocuments.hospital_letter && (
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Uploaded
                      </small>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Doctor Prescription */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-prescription fa-3x text-info"></i>
                    </div>
                    <h6>Doctor's Prescription</h6>
                    <p className="small text-muted">
                      Doctor's prescription for blood transfusion
                    </p>
                    
                    <label className="btn btn-outline-info w-100 mb-3">
                      <i className="fas fa-upload me-2"></i>
                      Upload Prescription
                      <input
                        type="file"
                        className="d-none"
                        onChange={(e) => handleDocumentUpload('doctor_prescription', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                    {identityDocuments.doctor_prescription && (
                      <small className="text-success">
                        <i className="fas fa-check me-1"></i>
                        Uploaded
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="alert alert-info mt-4">
              <h6>
                <i className="fas fa-shield-alt me-2"></i>
                Security & Privacy
              </h6>
              <ul className="mb-0 small">
                <li>All documents are encrypted and stored securely</li>
                <li>Only authorized staff can access uploaded documents</li>
                <li>Documents are automatically deleted after verification</li>
                <li>Maximum file size: 5MB per document</li>
                <li>Accepted formats: JPG, PNG, PDF</li>
              </ul>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setActiveStep('hospital')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-warning"
                  onClick={submitIdentityVerification}
                  disabled={verifying || (!identityDocuments.cnic_front && !identityDocuments.patient_cnic)}
                >
                  {verifying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Documents for Verification'
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-warning"
                  onClick={skipForNow}
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-success text-center">
            <i className="fas fa-check-circle fa-2x mb-3"></i>
            <h5>Identity Verification Submitted!</h5>
            <p className="mb-0">
              Your documents have been submitted for verification. This usually takes 24-48 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render completion step
  const renderCompletionStep = () => (
    <div className="card shadow-lg">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-check-circle me-2"></i>
          Verification Complete!
        </h5>
      </div>
      <div className="card-body">
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="circle-progress" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
              <div className="progress-circle" data-percentage="100">
                <span className="progress-circle-value">100%</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-success mb-3">All Verifications Complete!</h3>
          <p className="lead mb-4">
            Your account is now fully verified. You have access to all features including 
            emergency blood requests and priority processing.
          </p>
          
          <div className="row justify-content-center mb-5">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Verification Summary</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span className={verificationStatus.mobile ? 'text-success' : 'text-muted'}>
                            Mobile Number: {verificationStatus.mobile ? 'Verified' : 'Not Verified'}
                          </span>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span className={verificationStatus.email ? 'text-success' : 'text-muted'}>
                            Email Address: {verificationStatus.email ? 'Verified' : 'Not Verified'}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span className={verificationStatus.hospital ? 'text-success' : 'text-muted'}>
                            Hospital: {verificationStatus.hospital ? 'Verified' : 'Not Verified'}
                          </span>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span className={verificationStatus.identity ? 'text-success' : 'text-muted'}>
                            Identity: {verificationStatus.identity ? 'Verified' : 'Not Verified'}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-center gap-3">
            <Link to="/receiver/dashboard" className="btn btn-primary btn-lg">
              <i className="fas fa-tachometer-alt me-2"></i>
              Go to Dashboard
            </Link>
            
            <Link to="/receiver/new-request" className="btn btn-success btn-lg">
              <i className="fas fa-plus-circle me-2"></i>
              Create Blood Request
            </Link>
            
            <Link to="/receiver/profile" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-user me-2"></i>
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Render verification progress
  const renderVerificationProgress = () => {
    const steps = [
      { key: 'mobile', label: 'Mobile', icon: 'fa-mobile-alt', color: 'primary' },
      { key: 'email', label: 'Email', icon: 'fa-envelope', color: 'info' },
      { key: 'hospital', label: 'Hospital', icon: 'fa-hospital', color: 'success' },
      { key: 'identity', label: 'Identity', icon: 'fa-id-card', color: 'warning' }
    ];
    
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">Verification Progress</h5>
              <p className="text-muted mb-0">
                Complete all steps to unlock full features
              </p>
            </div>
            <div className="text-end">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {getVerificationBadge()}
                </div>
                <div>
                  <div className="progress" style={{ width: '100px', height: '10px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${getVerificationPercentage()}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{getVerificationPercentage()}% Complete</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row text-center">
            {steps.map((step, index) => (
              <div key={step.key} className="col">
                <div 
                  className={`step-indicator ${activeStep === step.key ? 'active' : ''} ${verificationStatus[step.key] ? 'completed' : ''}`}
                  onClick={() => setActiveStep(step.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`step-icon bg-${step.color} ${verificationStatus[step.key] ? 'bg-success' : ''}`}>
                    {verificationStatus[step.key] ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className={`fas ${step.icon}`}></i>
                    )}
                  </div>
                  <div className="step-label mt-2">
                    <small className="d-block">{step.label}</small>
                    <small className={`badge bg-${verificationStatus[step.key] ? 'success' : 'secondary'}`}>
                      {verificationStatus[step.key] ? 'Verified' : 'Pending'}
                    </small>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-connector ${verificationStatus[step.key] ? 'completed' : ''}`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !receiver) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading verification...</p>
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
            <i className="fas fa-user-check me-2 text-primary"></i>
            Account Verification
          </h4>
          <p className="text-muted mb-0">
            Complete verification to access all features
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-warning"
            onClick={skipForNow}
          >
            <i className="fas fa-forward me-2"></i>
            Skip for Now
          </button>
          
          <Link to="/receiver/dashboard" className="btn btn-outline-primary">
            <i className="fas fa-home me-2"></i>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {/* Verification Progress */}
      {renderVerificationProgress()}

      {/* Step Content */}
      {activeStep === 'mobile' && renderMobileVerification()}
      {activeStep === 'email' && renderEmailVerification()}
      {activeStep === 'hospital' && renderHospitalVerification()}
      {activeStep === 'identity' && renderIdentityVerification()}
      {activeStep === 'complete' && renderCompletionStep()}

      {/* Verification Benefits */}
      <div className="card bg-light mt-4">
        <div className="card-body">
          <h6 className="mb-3">
            <i className="fas fa-star me-2 text-warning"></i>
            Benefits of Complete Verification
          </h6>
          <div className="row">
            <div className="col-md-3">
              <div className="text-center p-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-2">
                  <i className="fas fa-ambulance fa-2x text-danger"></i>
                </div>
                <h6>Emergency Requests</h6>
                <p className="small text-muted mb-0">Access to 24/7 emergency blood requests</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-2">
                  <i className="fas fa-bolt fa-2x text-success"></i>
                </div>
                <h6>Priority Processing</h6>
                <p className="small text-muted mb-0">Faster approval and processing times</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="text-center p-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-2">
                  <i className="fas fa-shield-alt fa-2x text-primary"></i>
                </div>
                <h6>Higher Trust Score</h6>
                <p className="small text-muted mb-0">Increased daily request limits</p>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="text-center p-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-2">
                  <i className="fas fa-bell fa-2x text-info"></i>
                </div>
                <h6>Real-time Updates</h6>
                <p className="small text-muted mb-0">Instant notifications and tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverVerification;