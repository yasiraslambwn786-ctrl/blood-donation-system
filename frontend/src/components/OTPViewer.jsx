// src/components/OTPViewer.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { database } from '../config/firebase';

// ✅ CORRECT FIREBASE IMPORTS
import { ref, onValue } from 'firebase/database';

const OTPViewer = () => {
  const [otps, setOtps] = useState({});

  useEffect(() => {
    // Reference to OTPs in Firebase
    const otpsRef = ref(database, 'otps');
    
    // Listen for real-time updates
    const unsubscribe = onValue(otpsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📱 Real-time OTP update:', data);
      setOtps(data || {});
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-sms me-2"></i>
            Live OTP Monitor
          </h4>
        </div>
        <div className="card-body">
          {Object.keys(otps).length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No Active OTPs</h5>
              <p className="text-muted">Waiting for OTP requests...</p>
            </div>
          ) : (
            <div className="row">
              {Object.entries(otps).map(([mobile, data]) => {
                const timeLeft = data.expires_at - Math.floor(Date.now() / 1000);
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                const isExpiring = timeLeft < 120;

                return (
                  <div key={mobile} className="col-md-6 col-lg-4 mb-3">
                    <div className={`card ${isExpiring ? 'border-danger' : 'border-success'}`}>
                      <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">
                            <i className="fas fa-mobile-alt me-2"></i>
                            {mobile}
                          </span>
                          <span className={`badge ${isExpiring ? 'bg-danger' : 'bg-success'}`}>
                            {minutes}:{seconds.toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      <div className="card-body text-center">
                        <div className="display-4 fw-bold text-primary mb-3">
                          {data.otp}
                        </div>
                        <div className="text-muted small">
                          <div>Generated: {formatTime(data.created_at)}</div>
                          <div>Expires: {formatTime(data.expires_at)}</div>
                          <div>Project: {data.project || 'blooddonationmanagmentsystem'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="card-footer text-muted text-center">
          <small>Auto-refreshes in real-time | Total: {Object.keys(otps).length} OTPs</small>
        </div>
      </div>
    </div>
  );
};

export default OTPViewer;