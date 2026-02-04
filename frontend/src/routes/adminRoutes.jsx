// routes/adminRoutes.jsx - CORRECTED VERSION
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProfile from '../pages/admin/AdminProfile';
import ManageUsers from '../pages/admin/ManageUsers'; // ✅ Add this import

// ✅ FIXED ProtectedRoute FOR ADMIN
const AdminProtectedRoute = ({ children }) => {
  const { role, isAuthenticated } = useSelector((state) => state.auth);
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('AdminProtectedRoute check:', {
    role,
    isAuthenticated,
    adminToken,
    path: window.location.pathname
  });
  
  // Check if user is admin
  const isAdmin = role === 'admin' || adminToken;
  
  if (!isAdmin) {
    console.log('❌ Not admin, redirecting to /login-admin');
    return <Navigate to="/login-admin" replace />;
  }
  
  console.log('✅ Admin access granted');
  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
          <Route path="manage-users" element={<ManageUsers />} /> {/* ✅ Add this line */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;