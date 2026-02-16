import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerPanel } from './pages/CustomerPanel';
import { PartnerPanel } from './pages/PartnerPanel';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerPanel />} />
          <Route path="/partner" element={<PartnerPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
