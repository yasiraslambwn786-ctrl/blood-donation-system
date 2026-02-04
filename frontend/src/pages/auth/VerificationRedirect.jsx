// src/components/auth/VerificationRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VerificationRedirect = () => {
  const navigate = useNavigate();
  const { receiver } = useSelector((state) => state.receiver);

  useEffect(() => {
    if (!receiver) {
      navigate('/login-receiver');
      return;
    }

    // Check verification status and redirect accordingly
    if (!receiver.mobile_verified) {
      navigate('/verify-mobile');
    } else if (!receiver.email_verified) {
      navigate('/verify-email');
    } else {
      navigate('/receiver/dashboard');
    }
  }, [receiver, navigate]);

  return (
    <div className="text-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Checking verification status...</p>
    </div>
  );
};

export default VerificationRedirect;