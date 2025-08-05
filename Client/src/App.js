import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import WasteReport from './components/waste/WasteReport';
import WasteReports from './components/waste/WasteReports';
import Profile from './components/user/Profile';
import Notifications from './components/notifications/Notifications';
import AdminUsers from './components/admin/AdminUsers';
import AdminAnalytics from './components/admin/AdminAnalytics';
import LoadingSpinner from './components/common/LoadingSpinner';
import ChangePassword from './components/password/change-password';
import UserFeedback from './components/Feedback/UserFeedback';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              {user.role === 'admin' ? (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/reports" element={<WasteReports />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  {/* <Route path="/feedback" element={ <PrivateRoute> <UserFeedback /> </PrivateRoute> } /> */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/report" element={<WasteReport />} />
                  <Route path="/reports" element={<WasteReports />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App; 