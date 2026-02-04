import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logoutReceiver } from '../../redux/slices/receiverSlice';

const ReceiverSettings = () => {
  const dispatch = useDispatch();
  const { receiver, loading } = useSelector((state) => state.receiver);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    contact_name: '',
    mobile_number: '',
    email: '',
    alternate_contact: '',
    alternate_relationship: '',
    relationship: ''
  });
  
  // Hospital settings
  const [hospitalData, setHospitalData] = useState({
    hospital_name: '',
    city: '',
    doctor_name: '',
    ward_room: ''
  });
  
  // Communication preferences
  const [communicationPrefs, setCommunicationPrefs] = useState({
    sms_updates: true,
    email_updates: true,
    whatsapp_updates: false,
    emergency_calls: true,
    promotional_emails: false
  });
  
  // Security settings
  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Notification settings
  const [notificationPrefs, setNotificationPrefs] = useState({
    request_status: true,
    blood_availability: true,
    emergency_alerts: true,
    appointment_reminders: false,
    system_updates: false
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    share_medical_info: false,
    share_with_hospitals: true,
    share_with_researchers: false,
    show_in_donor_search: false,
    data_retention: '6_months'
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (receiver) {
      // Initialize form data with receiver data
      setProfileData({
        contact_name: receiver.contact_name || '',
        mobile_number: receiver.mobile_number || '',
        email: receiver.email || '',
        alternate_contact: receiver.alternate_contact || '',
        alternate_relationship: receiver.alternate_relationship || '',
        relationship: receiver.relationship || ''
      });
      
      setHospitalData({
        hospital_name: receiver.hospital_name || '',
        city: receiver.city || '',
        doctor_name: receiver.doctor_name || '',
        ward_room: receiver.ward_room || ''
      });
      
      // Initialize communication preferences
      setCommunicationPrefs({
        sms_updates: receiver.communication_sms !== false,
        email_updates: receiver.communication_email !== false,
        whatsapp_updates: receiver.communication_whatsapp === true,
        emergency_calls: receiver.communication_calls !== false,
        promotional_emails: false
      });
    }
  }, [receiver]);

  // Handle profile data changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle hospital data changes
  const handleHospitalChange = (e) => {
    const { name, value } = e.target;
    setHospitalData(prev => ({ ...prev, [name]: value }));
  };

  // Handle communication preferences
  const handleCommunicationChange = (e) => {
    const { name, checked } = e.target;
    setCommunicationPrefs(prev => ({ ...prev, [name]: checked }));
  };

  // Handle notification preferences
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPrefs(prev => ({ ...prev, [name]: checked }));
  };

  // Handle privacy settings
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle security data changes
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  // Save profile settings
  const saveProfileSettings = async () => {
    if (!profileData.contact_name || !profileData.mobile_number) {
      setErrorMessage('Contact name and mobile number are required');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Save hospital settings
  const saveHospitalSettings = async () => {
    if (!hospitalData.hospital_name || !hospitalData.city) {
      setErrorMessage('Hospital name and city are required');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/hospital`,
        hospitalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Hospital information updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating hospital info:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update hospital information');
    } finally {
      setSaving(false);
    }
  };

  // Save communication preferences
  const saveCommunicationPreferences = async () => {
    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/communication`,
        communicationPrefs,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Communication preferences updated');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating communication prefs:', error);
      setErrorMessage('Failed to update communication preferences');
    } finally {
      setSaving(false);
    }
  };

  // Save notification preferences
  const saveNotificationPreferences = async () => {
    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/notifications`,
        notificationPrefs,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Notification preferences updated');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating notification prefs:', error);
      setErrorMessage('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  // Save privacy settings
  const savePrivacySettings = async () => {
    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/privacy`,
        privacySettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Privacy settings updated');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setErrorMessage('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (!securityData.current_password) {
      setErrorMessage('Current password is required');
      return;
    }
    
    if (securityData.new_password !== securityData.confirm_password) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    if (securityData.new_password.length < 8) {
      setErrorMessage('New password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.put(
        `${API_BASE_URL}/receiver/change-password`,
        {
          current_password: securityData.current_password,
          new_password: securityData.new_password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Password changed successfully');
        setSecurityData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setShowPasswordModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('receiverToken');
      const response = await axios.delete(
        `${API_BASE_URL}/receiver/account`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Account deleted successfully');
        dispatch(logoutReceiver());
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMessage('Failed to delete account');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  // Export data
  const exportData = () => {
    const exportData = {
      profile: profileData,
      hospital: hospitalData,
      communication: communicationPrefs,
      notifications: notificationPrefs,
      privacy: privacySettings,
      export_date: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receiver_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccessMessage('Data exported successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Clear all messages
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                Profile Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Contact Person Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contact_name"
                    value={profileData.contact_name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Mobile Number *</label>
                  <div className="input-group">
                    <span className="input-group-text">+92</span>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile_number"
                      value={profileData.mobile_number}
                      onChange={handleProfileChange}
                      placeholder="3XX XXXXXXX"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Relationship to Patient</label>
                  <select
                    className="form-select"
                    name="relationship"
                    value={profileData.relationship}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select Relationship</option>
                    <option value="Self">Self (I am the patient)</option>
                    <option value="Spouse">Spouse/Husband/Wife</option>
                    <option value="Parent">Parent/Father/Mother</option>
                    <option value="Child">Child/Son/Daughter</option>
                    <option value="Sibling">Sibling/Brother/Sister</option>
                    <option value="Other Relative">Other Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Hospital Staff">Hospital Staff</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Alternate Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    name="alternate_contact"
                    value={profileData.alternate_contact}
                    onChange={handleProfileChange}
                    placeholder="Alternate contact name"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Alternate Relationship</label>
                  <input
                    type="text"
                    className="form-control"
                    name="alternate_relationship"
                    value={profileData.alternate_relationship}
                    onChange={handleProfileChange}
                    placeholder="Relationship to patient"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={saveProfileSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'hospital':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-hospital me-2"></i>
                Hospital Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-bold">Hospital Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="hospital_name"
                    value={hospitalData.hospital_name}
                    onChange={handleHospitalChange}
                    placeholder="Full hospital name"
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label fw-bold">City *</label>
                  <select
                    className="form-select"
                    name="city"
                    value={hospitalData.city}
                    onChange={handleHospitalChange}
                  >
                    <option value="">Select City</option>
                    <option value="Bahawalnagar">Bahawalnagar</option>
                    <option value="Bahawalpur">Bahawalpur</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Doctor In-Charge</label>
                  <input
                    type="text"
                    className="form-control"
                    name="doctor_name"
                    value={hospitalData.doctor_name}
                    onChange={handleHospitalChange}
                    placeholder="Doctor's name (optional)"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Ward/Room Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ward_room"
                    value={hospitalData.ward_room}
                    onChange={handleHospitalChange}
                    placeholder="e.g., Ward 5, Room 12"
                  />
                </div>
              </div>
              
              <div className="alert alert-info mt-3">
                <i className="fas fa-info-circle me-2"></i>
                Hospital information is used for blood delivery and emergency contact purposes.
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={saveHospitalSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Hospital Information
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'communication':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Communication Preferences
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="sms_updates"
                      id="sms_updates"
                      checked={communicationPrefs.sms_updates}
                      onChange={handleCommunicationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="sms_updates">
                      <i className="fas fa-sms me-2 text-success"></i>
                      SMS Updates
                    </label>
                    <p className="text-muted small mb-0">
                      Important alerts, request status updates, and verification codes
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="email_updates"
                      id="email_updates"
                      checked={communicationPrefs.email_updates}
                      onChange={handleCommunicationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="email_updates">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Updates
                    </label>
                    <p className="text-muted small mb-0">
                      Detailed reports, documents, and account notifications
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="whatsapp_updates"
                      id="whatsapp_updates"
                      checked={communicationPrefs.whatsapp_updates}
                      onChange={handleCommunicationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="whatsapp_updates">
                      <i className="fab fa-whatsapp me-2 text-success"></i>
                      WhatsApp Messages
                    </label>
                    <p className="text-muted small mb-0">
                      Quick updates and reminders via WhatsApp
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="emergency_calls"
                      id="emergency_calls"
                      checked={communicationPrefs.emergency_calls}
                      onChange={handleCommunicationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="emergency_calls">
                      <i className="fas fa-phone me-2 text-danger"></i>
                      Emergency Phone Calls
                    </label>
                    <p className="text-muted small mb-0">
                      Critical calls for life-threatening situations only
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="promotional_emails"
                      id="promotional_emails"
                      checked={communicationPrefs.promotional_emails}
                      onChange={handleCommunicationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="promotional_emails">
                      <i className="fas fa-bullhorn me-2 text-warning"></i>
                      Promotional Emails
                    </label>
                    <p className="text-muted small mb-0">
                      Newsletters, campaigns, and blood donation drives
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={saveCommunicationPreferences}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Communication Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Notification Preferences
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="request_status"
                      id="request_status"
                      checked={notificationPrefs.request_status}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="request_status">
                      Blood Request Status
                    </label>
                    <p className="text-muted small mb-0">
                      Updates on your blood request status changes
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="blood_availability"
                      id="blood_availability"
                      checked={notificationPrefs.blood_availability}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="blood_availability">
                      Blood Availability Alerts
                    </label>
                    <p className="text-muted small mb-0">
                      Notifications when your needed blood type becomes available
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="emergency_alerts"
                      id="emergency_alerts"
                      checked={notificationPrefs.emergency_alerts}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="emergency_alerts">
                      Emergency Blood Alerts
                    </label>
                    <p className="text-muted small mb-0">
                      Urgent alerts for emergency blood needs in your area
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="appointment_reminders"
                      id="appointment_reminders"
                      checked={notificationPrefs.appointment_reminders}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="appointment_reminders">
                      Appointment Reminders
                    </label>
                    <p className="text-muted small mb-0">
                      Reminders for scheduled blood transfusions
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="system_updates"
                      id="system_updates"
                      checked={notificationPrefs.system_updates}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="system_updates">
                      System Updates
                    </label>
                    <p className="text-muted small mb-0">
                      Updates about system maintenance and new features
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={saveNotificationPreferences}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Notification Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Privacy Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="share_medical_info"
                      id="share_medical_info"
                      checked={privacySettings.share_medical_info}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="share_medical_info">
                      Share Medical Information
                    </label>
                    <p className="text-muted small mb-0">
                      Allow hospitals to access medical history for better treatment
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="share_with_hospitals"
                      id="share_with_hospitals"
                      checked={privacySettings.share_with_hospitals}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="share_with_hospitals">
                      Share with Partner Hospitals
                    </label>
                    <p className="text-muted small mb-0">
                      Allow information sharing with our partner hospital network
                    </p>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="share_with_researchers"
                      id="share_with_researchers"
                      checked={privacySettings.share_with_researchers}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="share_with_researchers">
                      Share for Medical Research
                    </label>
                    <p className="text-muted small mb-0">
                      Anonymous data sharing for medical research purposes
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="show_in_donor_search"
                      id="show_in_donor_search"
                      checked={privacySettings.show_in_donor_search}
                      onChange={handlePrivacyChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="show_in_donor_search">
                      Show in Donor Search
                    </label>
                    <p className="text-muted small mb-0">
                      Allow donors to see anonymized requests for your blood type
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Data Retention Period</label>
                    <select
                      className="form-select"
                      name="data_retention"
                      value={privacySettings.data_retention}
                      onChange={handlePrivacyChange}
                    >
                      <option value="3_months">3 Months (Recommended)</option>
                      <option value="6_months">6 Months</option>
                      <option value="1_year">1 Year</option>
                      <option value="until_delete">Until I Delete Account</option>
                    </select>
                    <p className="text-muted small mb-0">
                      How long your data is kept after account inactivity
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-info">
                <h6>
                  <i className="fas fa-info-circle me-2"></i>
                  Privacy Information
                </h6>
                <p className="mb-0">
                  Your personal information is encrypted and protected. We never sell your data.
                  Medical information is only shared with authorized medical staff.
                </p>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={savePrivacySettings}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Privacy Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-lock me-2"></i>
                Security Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-4">
                    <h6>Two-Factor Authentication</h6>
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Two-factor authentication is not yet enabled for your account.
                    </div>
                    <button className="btn btn-outline-warning" disabled>
                      <i className="fas fa-shield-alt me-2"></i>
                      Enable 2FA (Coming Soon)
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h6>Login History</h6>
                    <div className="list-group">
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Current Session</strong><br/>
                            <small className="text-muted">Now - {navigator.userAgent.split(' ')[0]}</small>
                          </div>
                          <span className="badge bg-success">Active</span>
                        </div>
                      </div>
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Yesterday</strong><br/>
                            <small className="text-muted">Chrome on Windows</small>
                          </div>
                          <span className="badge bg-secondary">Ended</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-4">
                    <h6>Active Sessions</h6>
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      You have 1 active session
                    </div>
                    <button className="btn btn-outline-danger">
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout from All Devices
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h6>Password</h6>
                    <p>Last changed: 30 days ago</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <i className="fas fa-key me-2"></i>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-info mt-4">
                <h6>
                  <i className="fas fa-info-circle me-2"></i>
                  Security Tips
                </h6>
                <ul className="mb-0">
                  <li>Use a strong, unique password</li>
                  <li>Never share your login credentials</li>
                  <li>Log out from shared computers</li>
                  <li>Regularly update your password</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'account':
        return (
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                Account Management
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-4">
                    <h6>Data Export</h6>
                    <p>Download all your data in JSON format</p>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={exportData}
                    >
                      <i className="fas fa-download me-2"></i>
                      Export My Data
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h6>Account Status</h6>
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      Your account is <strong>Active</strong>
                    </div>
                    <p className="text-muted">
                      Created: {receiver?.created_at ? new Date(receiver.created_at).toLocaleDateString() : 'N/A'}<br/>
                      Last Login: Today
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-4">
                    <h6 className="text-danger">Danger Zone</h6>
                    <div className="alert alert-danger">
                      <h6>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Warning
                      </h6>
                      <p className="mb-2">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Delete My Account
                      </button>
                      
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => {
                          if (window.confirm('Temporarily deactivate your account? You can reactivate anytime.')) {
                            alert('Account deactivation feature coming soon');
                          }
                        }}
                      >
                        <i className="fas fa-user-slash me-2"></i>
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && !receiver) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading settings...</p>
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
            <i className="fas fa-cog me-2 text-primary"></i>
            Settings
          </h4>
          <p className="text-muted mb-0">Manage your account and preferences</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={clearMessages}></button>
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
          <button type="button" className="btn-close" onClick={clearMessages}></button>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              <nav className="nav flex-column">
                <button 
                  className={`nav-link text-start ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user-circle me-2"></i>
                  Profile
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'hospital' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hospital')}
                >
                  <i className="fas fa-hospital me-2"></i>
                  Hospital
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'communication' ? 'active' : ''}`}
                  onClick={() => setActiveTab('communication')}
                >
                  <i className="fas fa-comments me-2"></i>
                  Communication
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <i className="fas fa-bell me-2"></i>
                  Notifications
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <i className="fas fa-shield-alt me-2"></i>
                  Privacy
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="fas fa-lock me-2"></i>
                  Security
                </button>
                
                <button 
                  className={`nav-link text-start ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  <i className="fas fa-cog me-2"></i>
                  Account
                </button>
              </nav>
            </div>
          </div>
          
          {/* Account Summary */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="fas fa-info-circle me-2"></i>
                Account Summary
              </h6>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="fas fa-user me-2 text-muted"></i>
                  <strong>Name:</strong> {receiver?.contact_name || 'N/A'}
                </li>
                <li className="mb-2">
                  <i className="fas fa-phone me-2 text-muted"></i>
                  <strong>Mobile:</strong> {receiver?.mobile_number || 'N/A'}
                </li>
                <li className="mb-2">
                  <i className="fas fa-hospital me-2 text-muted"></i>
                  <strong>Hospital:</strong> {receiver?.hospital_name || 'N/A'}
                </li>
                <li className="mb-2">
                  <i className="fas fa-tint me-2 text-muted"></i>
                  <strong>Blood Group:</strong> {receiver?.blood_group_needed || 'N/A'}
                </li>
                <li className="mb-2">
                  <i className="fas fa-calendar me-2 text-muted"></i>
                  <strong>Member Since:</strong> {receiver?.created_at ? 
                    new Date(receiver.created_at).toLocaleDateString() : 'N/A'}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="col-md-9">
          {renderTabContent()}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2"></i>
                  Change Password
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saving}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="current_password"
                    value={securityData.current_password}
                    onChange={handleSecurityChange}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="new_password"
                    value={securityData.new_password}
                    onChange={handleSecurityChange}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirm_password"
                    value={securityData.confirm_password}
                    onChange={handleSecurityChange}
                    placeholder="Re-enter new password"
                  />
                </div>
                
                <div className="alert alert-info">
                  <h6>
                    <i className="fas fa-info-circle me-2"></i>
                    Password Requirements
                  </h6>
                  <ul className="mb-0 small">
                    <li>Minimum 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={changePassword}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Delete Account
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={saving}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <h6>
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Warning: This action cannot be undone!
                  </h6>
                  <p className="mb-0">
                    All your data including blood requests, medical information, 
                    and account details will be permanently deleted.
                  </p>
                </div>
                
                <ul>
                  <li>All blood request history will be deleted</li>
                  <li>Medical information will be permanently removed</li>
                  <li>Account cannot be recovered</li>
                  <li>Future requests will require new registration</li>
                </ul>
                
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="understandDelete"
                  />
                  <label className="form-check-label text-danger fw-bold" htmlFor="understandDelete">
                    I understand this action is permanent and cannot be undone
                  </label>
                </div>
                
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="exportDataFirst"
                  />
                  <label className="form-check-label" htmlFor="exportDataFirst">
                    I have exported my data before deletion (Recommended)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={deleteAccount}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash-alt me-2"></i>
                      Permanently Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverSettings;