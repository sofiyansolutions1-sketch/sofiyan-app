import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SEOManager } from './components/SEOManager';
import { Layout } from './components/Layout';
import { CustomerPanel } from './pages/CustomerPanel';
import { PartnerPanel } from './pages/PartnerPanel';
import { AdminPanel } from './pages/AdminPanel';
import { BlogPanel } from './pages/BlogPanel';
import { BlogPost } from './pages/BlogPost';
import RateList from './pages/RateList';
import { TrackBooking } from './pages/TrackBooking';
import { SubServicePage } from './pages/SubServicePage';

import { RoleSelectionModal } from './components/RoleSelectionModal';
import { CITY_DATA } from './constants';

function AppContent() {
  const [showRoleModal, setShowRoleModal] = useState(() => {
    const hasSelectedRole = sessionStorage.getItem('sofiyan_user_role');
    return !hasSelectedRole;
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Request permission on load as per user request
    if (navigator.geolocation && !sessionStorage.getItem('location_prompted')) {
      sessionStorage.setItem('location_prompted', 'true');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sessionStorage.setItem('userLocation', `${pos.coords.latitude},${pos.coords.longitude}`);
        },
        (err) => console.log('Location permission denied or timeout', err),
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleRoleSelect = (role: 'customer' | 'technician') => {
    sessionStorage.setItem('sofiyan_user_role', role);
    setShowRoleModal(false);
    if (role === 'technician') {
      navigate('/partner');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {showRoleModal && <RoleSelectionModal onSelect={handleRoleSelect} />}
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerPanel />} />
          <Route path="/rate-list" element={<RateList />} />
          <Route path="/blogs" element={<BlogPanel />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/partner" element={<PartnerPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/:cityUrl" element={<CustomerPanel />} />
          <Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />
          <Route path="/:cityUrl/:serviceUrl/:subServiceUrl" element={<SubServicePage />} />
          <Route path="*" element={<CustomerPanel />} />
        </Routes>
      </Layout>
    </>
  );
}

function App() {
  return (
    <Router>
      <SEOManager />
      <AppContent />
    </Router>
  );
}

export default App;
