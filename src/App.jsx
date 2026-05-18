import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import BuildForm from './pages/BuildForm';
import FormView from './pages/FormView';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// ProtectedRoute component: renders <NotFound /> if admin is not authenticated
// This hides the dashboard and form builder completely, making it look like a 404
function ProtectedRoute({ children }) {
  const session = localStorage.getItem('jo_admin_session');
  if (!session) {
    return <NotFound />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Secret Admin Login Route (Obscured URL to hide it from students) */}
          <Route path="/portal-login" element={<Login />} />

          {/* Protected Routes for Admin Dashboard & Form Builder */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/build" element={<ProtectedRoute><BuildForm /></ProtectedRoute>} />
          <Route path="/build/:id" element={<ProtectedRoute><BuildForm /></ProtectedRoute>} />

          {/* Public Form Submission View */}
          <Route path="/f/:slug" element={<FormView />} />

          {/* Catch-all Route: displays a neutral 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
