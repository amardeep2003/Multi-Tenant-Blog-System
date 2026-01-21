import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ManageTenants from './pages/ManageTenants';
import ManageUsers from './pages/ManageUsers';
import ManagePosts from './pages/ManagePosts';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </ProtectedRoute>
      } />
      
      <Route path="/tenants" element={
        <ProtectedRoute adminOnly><ManageTenants /></ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
      } />
      
      <Route path="/posts" element={
        <ProtectedRoute><ManagePosts /></ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;