import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthHelper from '../../utils/authHelper';

const ProtectedRoute = ({ children, allowedRole }) => {
  console.log(`🛡️ ProtectedRoute: Checking access for ${allowedRole}`);
  
  // ✅ Use AuthHelper for consistent authentication check
  const isAuth = AuthHelper.isAuthenticated(allowedRole);
  
  console.log('📊 ProtectedRoute Result:', {
    allowedRole,
    isAuthenticated: isAuth,
    currentPath: window.location.pathname,
    authState: AuthHelper.getAuthState()
  });
  
  // If not authenticated, redirect to login
  if (!isAuth) {
    const loginPaths = {
      donor: '/login-donor',
      staff: '/login-staff',
      admin: '/login-admin',
      receiver: '/login-receiver',
      accepter: '/login-accepter'
    };
    
    const loginPath = loginPaths[allowedRole] || '/login';
    console.log(`🚫 Access denied for ${allowedRole}, redirecting to ${loginPath}`);
    
    return <Navigate to={loginPath} replace />;
  }
  
  // If authenticated, render children
  console.log(`✅ Access granted for ${allowedRole}`);
  return children;
};

export default ProtectedRoute;