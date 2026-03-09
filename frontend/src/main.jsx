import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard        from './pages/Dashboard';
import Proposals        from './pages/Proposals';
import Voting           from './pages/Voting';
import Users            from './pages/Users';
import Bounties         from './pages/Bounties';
import ZKAudit          from './pages/ZKAudit';
import Justice          from './pages/Justice';
import Consent          from './pages/Consent';
import SovereignIdentity from './pages/SovereignIdentity';
import NotFound         from './pages/NotFound';
import '/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index           element={<Dashboard />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="voting"    element={<Voting />} />
          <Route path="users"     element={<Users />} />
          <Route path="bounties"  element={<Bounties />} />
          <Route path="zk-audit"  element={<ZKAudit />} />
          <Route path="justice"   element={<Justice />} />
          <Route path="consent"   element={<Consent />} />
          <Route path="identity"  element={<SovereignIdentity />} />
          <Route path="*"         element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
