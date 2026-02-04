// routes/publicRoutes.jsx - CORRECTED VERSION
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Home & Main Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import EmergencyRequest from '../pages/EmergencyRequest';

// Login Pages
import LoginDonor from '../pages/donor/LoginDonor';
import LoginStaff from '../pages/staff/LoginStaff';
import LoginAdmin from '../pages/admin/LoginAdmin';
import LoginReceiver from '../pages/receiver/LoginReceiver';
import LoginAccepter from '../pages/accepter/LoginAccepter';

// Registration Pages
import RegisterDonor from '../pages/donor/RegisterDonor';
import RegisterStaff from '../pages/staff/RegisterStaff';
import RegisterReceiver from '../pages/receiver/RegisterReceiver';

// Compatibility Routes
import AboutUs from '../pages/donor/AboutUs';
import ContactUs from '../pages/donor/ContactUs';

const PublicRoutes = () => {
  return (
    <Routes>
      {/* Home Page */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      
      {/* ✅ FIXED: Add /register route using RegisterReceiver */}
      <Route path="/register" element={
        <MainLayout>
          <RegisterReceiver />
        </MainLayout>
      } />
      
      {/* Main Navigation Pages */}
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
      
      {/* Donor Authentication */}
      <Route path="/login-donor" element={
        <MainLayout>
          <LoginDonor />
        </MainLayout>
      } />
      
      <Route path="/register-donor" element={
        <MainLayout>
          <RegisterDonor />
        </MainLayout>
      } />
      
      {/* Staff Authentication */}
      <Route path="/login-staff" element={
        <MainLayout>
          <LoginStaff />
        </MainLayout>
      } />
      
      <Route path="/register-staff" element={
        <MainLayout>
          <RegisterStaff />
        </MainLayout>
      } />
      
      {/* Admin Authentication */}
      <Route path="/login-admin" element={
        <MainLayout>
          <LoginAdmin />
        </MainLayout>
      } />
      
      {/* Receiver Authentication */}
      <Route path="/login-receiver" element={
        <MainLayout>
          <LoginReceiver />
        </MainLayout>
      } />
      
      <Route path="/register-receiver" element={
        <MainLayout>
          <RegisterReceiver />
        </MainLayout>
      } />
      
      {/* Accepter Authentication */}
      <Route path="/login-accepter" element={
        <MainLayout>
          <LoginAccepter />
        </MainLayout>
      } />
      
      {/* Compatibility Routes (Old URLs) */}
      <Route path="/about-us" element={
        <MainLayout>
          <AboutUs />
        </MainLayout>
      } />
      
      <Route path="/contact-us" element={
        <MainLayout>
          <ContactUs />
        </MainLayout>
      } />
    </Routes>

    
  );
};

export default PublicRoutes;