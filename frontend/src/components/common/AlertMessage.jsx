// src/components/common/AlertMessage.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AlertMessage = ({ 
  type = 'info', 
  message, 
  onClose, 
  dismissible = true,
  icon = true,
  className = '',
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  const alertClasses = {
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
    primary: 'alert-primary',
    secondary: 'alert-secondary',
    light: 'alert-light',
    dark: 'alert-dark'
  };

  const icons = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    primary: 'fas fa-bell',
    secondary: 'fas fa-comment-alt',
    light: 'fas fa-lightbulb',
    dark: 'fas fa-moon'
  };

  // Auto close functionality
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, autoCloseDelay]);

  // Handle close button click
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`alert ${alertClasses[type] || 'alert-info'} ${dismissible ? 'alert-dismissible fade show' : ''} ${className} d-flex align-items-center`} 
      role="alert"
    >
      {icon && (
        <i className={`${icons[type] || 'fas fa-info-circle'} me-2 fs-5`}></i>
      )}
      
      <div className="flex-grow-1">
        {typeof message === 'string' ? (
          <span className="fw-medium">{message}</span>
        ) : (
          <div>{message}</div>
        )}
      </div>
      
      {dismissible && onClose && (
        <button 
          type="button" 
          className="btn-close ms-2" 
          onClick={handleClose}
          aria-label="Close"
          data-bs-dismiss="alert"
        ></button>
      )}
    </div>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(['success', 'danger', 'warning', 'info', 'primary', 'secondary', 'light', 'dark']),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onClose: PropTypes.func,
  dismissible: PropTypes.bool,
  icon: PropTypes.bool,
  className: PropTypes.string,
  autoClose: PropTypes.bool,
  autoCloseDelay: PropTypes.number
};

export default AlertMessage;