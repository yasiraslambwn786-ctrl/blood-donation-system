import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AccepterLayout from '../layouts/AccepterLayout';

// Accepter Pages
import AccepterDashboard from '../pages/accepter/AccepterDashboard';
import AccepterProfile from '../pages/accepter/AccepterProfile';
import ProfileAccepter from '../pages/accepter/ProfileAccepter';
import VerificationHistory from '../pages/accepter/VerificationHistory';
import VerifyDonations from '../pages/accepter/VerifyDonations';
import IssueBlood from '../pages/accepter/IssueBlood';
import IssuanceHistory from '../pages/accepter/IssuanceHistory';
import HandoverBlood from '../pages/accepter/HandoverBlood';
import Inventory from '../pages/accepter/Inventory';
import BloodInventory from '../pages/accepter/BloodInventory';
import DonationRecords from '../pages/accepter/DonationRecords';
import DonationRecord from '../pages/accepter/DonationRecord';
import Reports from '../pages/accepter/Reports';
// Settings and Notifications فائلز بنانے کے بعد ان کو شامل کریں
import Settings from '../pages/accepter/Settings';
import Notifications from '../pages/accepter/Notifications';

const AccepterRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute allowedRole="accepter">
          <AccepterLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AccepterDashboard />} />
        <Route path="dashboard" element={<AccepterDashboard />} />
        <Route path="profile" element={<AccepterProfile />} />
        <Route path="profile-accepter" element={<ProfileAccepter />} />
        <Route path="verification-history" element={<VerificationHistory />} />
        <Route path="verify-donations" element={<VerifyDonations />} />
        <Route path="issue-blood" element={<IssueBlood />} />
        <Route path="issuance-history" element={<IssuanceHistory />} />
        <Route path="handover-blood" element={<HandoverBlood />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="blood-inventory" element={<BloodInventory />} />
        <Route path="donation-records" element={<DonationRecords />} />
        <Route path="donation-record" element={<DonationRecord />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        
        <Route path="*" element={
          <div className="text-center py-5">
            <h3>404 - Accepter Page Not Found</h3>
            <p>The page you're looking for doesn't exist in accepter section.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
};

export default AccepterRoutes;