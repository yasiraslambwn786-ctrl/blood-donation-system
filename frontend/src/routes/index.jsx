// src/routes/AppRoutes.jsx میں یہ شامل کریں
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Import all routes
import ReceiverRoutes from './ReceiverRoutes';
import DonorRoutes from './DonorRoutes';
import StaffRoutes from './StaffRoutes';
import AdminRoutes from './AdminRoutes';
import AccepterRoutes from './AccepterRoutes'; // ✅ یہ import کریں

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import EmergencyRequest from '../pages/EmergencyRequest';

// Auth Pages
import LoginDonor from '../pages/auth/LoginDonor';
import LoginStaff from '../pages/auth/LoginStaff';
import LoginAdmin from '../pages/auth/LoginAdmin';
import LoginReceiver from '../pages/receiver/LoginReceiver';
import LoginAccepter from '../pages/accepter/LoginAccepter'; // ✅
import RegisterDonor from '../pages/auth/RegisterDonor';
import RegisterStaff from '../pages/staff/RegisterStaff';
import RegisterReceiver from '../pages/receiver/RegisterReceiver';
import RegisterAccepter from '../pages/accepter/RegisterAccepter'; // ✅

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      
      <Route path="/about" element={
        <MainLayout>
          <About />
        </MainLayout>
      } />
      
      <Route path="/contact" element={
        <MainLayout>
          <Contact />
        </MainLayout>
      } />
      
      <Route path="/emergency-request" element={
        <MainLayout>
          <EmergencyRequest />
        </MainLayout>
      } />
      
      {/* Authentication Routes */}
      <Route path="/login-donor" element={<LoginDonor />} />
      <Route path="/login-staff" element={<LoginStaff />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/login-receiver" element={<LoginReceiver />} />
      <Route path="/login-accepter" element={<LoginAccepter />} /> {/* ✅ */}
      
      <Route path="/register-donor" element={<RegisterDonor />} />
      <Route path="/register-staff" element={<RegisterStaff />} />
      <Route path="/register-receiver" element={<RegisterReceiver />} />
      <Route path="/register-accepter" element={<RegisterAccepter />} /> {/* ✅ */}
      
      {/* Protected Routes */}
      <Route path="/receiver/*" element={
        <ProtectedRoute allowedRole="receiver">
          <ReceiverRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="/staff/*" element={
        <ProtectedRoute allowedRole="staff">
          <StaffRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="/donor/*" element={
        <ProtectedRoute allowedRole="donor">
          <DonorRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole="admin">
          <AdminRoutes />
        </ProtectedRoute>
      } />
      
      {/* ✅ Accepter Protected Routes */}
      <Route path="/accepter/*" element={
        <ProtectedRoute allowedRole="accepter">
          <AccepterRoutes />
        </ProtectedRoute>
      } />
      
      {/* 404 Page */}
      <Route path="*" element={
        <MainLayout>
          <div className="text-center py-5">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
};

export default AppRoutes;