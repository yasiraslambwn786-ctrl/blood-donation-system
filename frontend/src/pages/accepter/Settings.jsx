import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    low_stock_alerts: true,
    donation_verification_alerts: true,
    language: 'en',
    theme: 'light'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/accepter/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSettings(response.data.data || settings);
      }
    } catch (err) {
      console.log('Using default settings:', err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/accepter/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(response.data.message || 'Failed to save settings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accepter-settings">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-cog me-2"></i>
            Account Settings
          </h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Notification Settings */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3">
                <i className="fas fa-bell me-2"></i>
                Notification Settings
              </h5>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="email_notifications"
                      name="email_notifications"
                      checked={settings.email_notifications}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="email_notifications">
                      Email Notifications
                    </label>
                    <small className="form-text text-muted d-block">
                      Receive notifications via email
                    </small>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="push_notifications"
                      name="push_notifications"
                      checked={settings.push_notifications}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="push_notifications">
                      Push Notifications
                    </label>
                    <small className="form-text text-muted d-block">
                      Receive push notifications in browser
                    </small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="low_stock_alerts"
                      name="low_stock_alerts"
                      checked={settings.low_stock_alerts}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="low_stock_alerts">
                      Low Stock Alerts
                    </label>
                    <small className="form-text text-muted d-block">
                      Get alerts when blood stock is low
                    </small>
                  </div>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="donation_verification_alerts"
                      name="donation_verification_alerts"
                      checked={settings.donation_verification_alerts}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="donation_verification_alerts">
                      Donation Verification Alerts
                    </label>
                    <small className="form-text text-muted d-block">
                      Get alerts for pending donations
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3">
                <i className="fas fa-desktop me-2"></i>
                Display Settings
              </h5>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="language" className="form-label">
                    <i className="fas fa-language me-1"></i>
                    Language
                  </label>
                  <select
                    className="form-select"
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="theme" className="form-label">
                    <i className="fas fa-palette me-1"></i>
                    Theme
                  </label>
                  <select
                    className="form-select"
                    id="theme"
                    name="theme"
                    value={settings.theme}
                    onChange={handleChange}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Danger Zone
              </h5>
              
              <div className="alert alert-warning">
                <h6 className="alert-heading">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Important Actions
                </h6>
                <p className="mb-2">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <hr />
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-danger btn-sm">
                    <i className="fas fa-trash me-1"></i>
                    Delete Account
                  </button>
                  <button type="button" className="btn btn-outline-warning btn-sm">
                    <i className="fas fa-ban me-1"></i>
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.history.back()}
              >
                <i className="fas fa-arrow-left me-1"></i>
                Back
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-muted small">
          <i className="fas fa-info-circle me-1"></i>
          Changes will be applied immediately after saving.
        </div>
      </div>
    </div>
  );
};

export default Settings;