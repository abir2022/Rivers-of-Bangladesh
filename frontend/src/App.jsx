import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ExplorerPage from './pages/ExplorerPage.jsx';
import RiverDetailPage from './pages/RiverDetailPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import ForumPage from './pages/ForumPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

// Protected Route for authenticated users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Protected Route for Admin users only
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  return user && isAdmin ? children : <Navigate to="/" replace />;
};

// Layout component to handle Navbar and Footer selectively
const MainLayout = () => {
  const location = useLocation();
  const isExplorer = location.pathname.startsWith('/explorer');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Public blog view, comments handled internally inside page */}
          <Route path="/blog" element={<BlogPage />} />
          
          {/* Private Routes */}
          <Route path="/explorer" element={
            <PrivateRoute>
              <ExplorerPage />
            </PrivateRoute>
          } />
          
          <Route path="/river/:id" element={
            <PrivateRoute>
              <RiverDetailPage />
            </PrivateRoute>
          } />
          
          <Route path="/forum" element={
            <PrivateRoute>
              <ForumPage />
            </PrivateRoute>
          } />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* Exclude full footer on fullscreen Map Explorer and Admin Dashboard for clean UX */}
      {!isExplorer && !isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
