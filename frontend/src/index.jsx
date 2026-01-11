import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import GovernmentDashboard from './components/GovernmentDashboard';
import ContractorPerformanceDashboard from './components/ContractorPerformanceDashboard';
import './index.css';

// Protected route for admin
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route 
        path="/admin/dashboard/government" 
        element={
          <ProtectedAdminRoute>
            <GovernmentDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route path="/contractor-dashboard" element={<ContractorPerformanceDashboard />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </Router>
);

