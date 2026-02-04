// FILE: src/routes/DonorRoutes.jsx - FIXED VERSION
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DonorLayout from '../layouts/DonorLayout';

// Donor Pages
import HomeDonor from '../pages/donor/HomeDonor';
import ProfileDonor from '../pages/donor/ProfileDonor';
import Appointments from '../pages/donor/Appointments';
import AboutUs from '../pages/donor/AboutUs';
import ContactUs from '../pages/donor/ContactUs';
import DonationHistory from '../pages/donor/DonationHistory';
import FindDonors from '../pages/donor/FindDonors';
import EditProfileDonor from '../pages/donor/EditProfileDonor';

const DonorRoutes = () => {
  return (
    <Routes>
      {/* ✅ CHANGE: Path should be "/" since AppRoutes already has "/donor/*" */}
      <Route path="/" element={
        <ProtectedRoute allowedRole="donor">
          <DonorLayout />
        </ProtectedRoute>
      }>
        {/* ✅ Index route shows HomeDonor on /donor */}
        <Route index element={<HomeDonor />} />
        
        {/* ✅ These will be relative to /donor */}
        <Route path="home-donor" element={<HomeDonor />} />
        <Route path="profile-donor" element={<ProfileDonor />} />
        <Route path="edit-profile-donor" element={<EditProfileDonor />} />
        <Route path="appointments-donor" element={<Appointments />} />
        <Route path="donation-history" element={<DonationHistory />} />
        <Route path="find-donors" element={<FindDonors />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="contact-us" element={<ContactUs />} />
      </Route>
    </Routes>
  );
};

export default DonorRoutes;