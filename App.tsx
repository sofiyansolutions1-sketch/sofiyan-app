import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { InfluencerPanel } from './pages/InfluencerPanel';

import { CITY_DATA } from './constants';

function AppContent() {
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Meta Pixel: Track PageView on SPA client-side route changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Base snippet in index.html already fired the initial PageView
    }
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [location.pathname, location.search]);

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

  return (
    <Layout>
        <Routes>
          <Route path="/" element={<CustomerPanel />} />
          <Route path="/rate-list" element={<RateList />} />
          <Route path="/blogs" element={<BlogPanel />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/partner" element={<PartnerPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/influencer" element={<InfluencerPanel />} />
          <Route path="/influencers" element={<InfluencerPanel />} />
          <Route path="/influencer-portal.html" element={<InfluencerPanel />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/:cityUrl" element={<CustomerPanel />} />
          <Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />
          <Route path="/:cityUrl/:serviceUrl/:subServiceUrl" element={<SubServicePage />} />
          <Route path="*" element={<CustomerPanel />} />
        </Routes>
      </Layout>
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
