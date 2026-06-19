import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerPanel } from './pages/CustomerPanel';
import { PartnerPanel } from './pages/PartnerPanel';
import { AdminPanel } from './pages/AdminPanel';
import { BlogPanel } from './pages/BlogPanel';
import { BlogPost } from './pages/BlogPost';
import RateList from './pages/RateList';
import { RoleSelectionModal } from './components/RoleSelectionModal';

function AppContent() {
  const [showRoleModal, setShowRoleModal] = useState(() => {
    const hasSelectedRole = sessionStorage.getItem('sofiyan_user_role');
    return !hasSelectedRole;
  });
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'customer' | 'technician') => {
    sessionStorage.setItem('sofiyan_user_role', role);
    setShowRoleModal(false);
    if (role === 'technician') {
      navigate('/partner?mode=signup');
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
          <Route path="/:cityParam" element={<CustomerPanel />} />
          <Route path="/:cityParam/:categoryParam" element={<CustomerPanel />} />
          <Route path="*" element={<CustomerPanel />} />
        </Routes>
      </Layout>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
