import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerPanel } from './pages/CustomerPanel';
import { PartnerPanel } from './pages/PartnerPanel';
import { AdminPanel } from './pages/AdminPanel';
import { BlogPanel } from './pages/BlogPanel';
import { BlogPost } from './pages/BlogPost';
import RateList from './pages/RateList';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerPanel />} />
          <Route path="/rate-list" element={<RateList />} />
          <Route path="/blogs" element={<BlogPanel />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/partner" element={<PartnerPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<CustomerPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
