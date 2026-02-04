// src/routes/staffRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import StaffLayout from '../layouts/StaffLayout';

// Import ALL staff pages
import AboutTeams from '../pages/staff/AboutTeams';
import AcceptRequests from '../pages/staff/AcceptRequests';
import ContactTeam from '../pages/staff/ContactTeam';
import ProfileStaff from '../pages/staff/ProfileStaff';
import RequestDonor from '../pages/staff/RequestDonor';
import RequestDonorCreate from '../pages/staff/RequestDonorCreate';
import SentRequests from '../pages/staff/SentRequests';
import BloodInventory from '../pages/staff/BloodInventory';
import ManageDonors from '../pages/staff/ManageDonors';
import Reports from '../pages/staff/Reports';
import DashboardStaff from '../pages/staff/DashboardStaff'; // ✅ Import the new component

const StaffRoutes = () => {
  return (
    <Routes>
      {/* ✅ Main staff route with nested routes */}
      <Route path="/" element={
        <ProtectedRoute allowedRole="staff">
          <StaffLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard - index route */}
        <Route index element={<DashboardStaff />} />
        <Route path="dashboard" element={<DashboardStaff />} />
        
        {/* Other staff routes */}
        <Route path="about-team" element={<AboutTeams />} />
        <Route path="accept-request" element={<AcceptRequests />} />
        <Route path="contact-team" element={<ContactTeam />} />
        <Route path="profile" element={<ProfileStaff />} />
        <Route path="request-donor" element={<RequestDonor />} />
        <Route path="request-donor/create" element={<RequestDonorCreate />} />
        <Route path="sent-requests" element={<SentRequests />} />
        <Route path="blood-inventory" element={<BloodInventory />} />
        <Route path="manage-donors" element={<ManageDonors />} />
        <Route path="reports" element={<Reports />} />
        
        {/* Add more routes as needed */}
        <Route path="blood-requests" element={<div>Blood Requests Page</div>} />
        <Route path="donor-management" element={<div>Donor Management Page</div>} />
        <Route path="inventory" element={<div>Inventory Page</div>} />
        <Route path="appointments" element={<div>Appointments Page</div>} />
        <Route path="create-request" element={<div>Create Request Page</div>} />
        <Route path="emergency" element={<div>Emergency Cases Page</div>} />
        <Route path="donor-search" element={<div>Donor Search Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="notifications" element={<div>Notifications Page</div>} />
        <Route path="appointments/today" element={<div>Today's Appointments Page</div>} />
        <Route path="inventory/alerts" element={<div>Inventory Alerts Page</div>} />
        <Route path="analytics" element={<div>Analytics Page</div>} />
      </Route>
    </Routes>
  );
};

export default StaffRoutes;