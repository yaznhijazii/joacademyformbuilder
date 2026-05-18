import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import BuildForm from './pages/BuildForm';
import FormView from './pages/FormView';
import Login from './pages/Login';

// ProtectedRoute component to check admin authentication session
function ProtectedRoute({ children }) {
  const session = localStorage.getItem('jo_admin_session');
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes for Admin Dashboard & Form Builder */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/build" element={<ProtectedRoute><BuildForm /></ProtectedRoute>} />
          <Route path="/build/:id" element={<ProtectedRoute><BuildForm /></ProtectedRoute>} />

          {/* Public Form Submission View */}
          <Route path="/f/:slug" element={<FormView />} />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
