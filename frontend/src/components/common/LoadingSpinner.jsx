// src/components/common/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'md',
  type = 'border', // 'border' or 'grow'
  color = 'primary',
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizes = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    light: 'text-light',
    dark: 'text-dark',
    white: 'text-white'
  };

  const spinnerClass = type === 'grow' ? 'spinner-grow' : 'spinner-border';
  const sizeClass = sizes[size] || '';
  const colorClass = colors[color] || 'text-primary';

  const spinnerElement = (
    <div className={`${spinnerClass} ${sizeClass} ${colorClass}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75 z-50">
        {spinnerElement}
        {message && (
          <p className="mt-3 text-white fw-medium">{message}</p>
        )}
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-75 z-40">
        {spinnerElement}
        {message && (
          <p className="mt-3 text-dark fw-medium">{message}</p>
        )}
      </div>
    );
  }

  // Regular inline loading
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center ${className}`}>
      {spinnerElement}
      {message && (
        <p className="mt-2 text-muted small">{message}</p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['border', 'grow']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white']),
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;