import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiKey,
  FiMenu,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Real-time updates via Socket.IO
    let socket;
    if (user?._id) {
      socket = io('http://localhost:5003', { transports: ['websocket'] });
      socket.on('connect', () => {
        socket.emit('join', String(user._id));
      });

      socket.on('notification', (payload) => {
        // Prepend the new notification to the dropdown list
        setNotifications((prev) => [
          { ...payload, _id: payload._id || Math.random().toString(36).slice(2), isRead: false, createdAt: new Date().toISOString() },
          ...prev
        ].slice(0, 5));
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user?._id]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?limit=5');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Notification fetch failed:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'reminder': return '⏰';
      default: return 'ℹ️';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white-600 rounded-full flex items-center justify-center mr-3">
              {/* <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg> */}
              {
                <img src="/logo.png" alt="icon" className="h-10 w-10" />
              }
            </div>
            <span className="text-xl font-bold text-gray-900">SafaSajha</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              >
                <FiBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md border z-50">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-gray-500">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notif._id)}
                        >
                          <div className="flex items-start">
                            <span className="mr-3 text-lg">{getIcon(notif.type)}</span>
                            <div>
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-sm text-gray-600">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <Link
                      to="/notifications"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
              >
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-md border z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="mr-3" /> Profile
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiKey className="mr-3" /> Change Password
                    </Link>
                    {/* <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiSettings className="mr-3" /> Settings
                    </Link> */}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-3" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <div className="text-sm font-medium text-gray-700">Welcome, {user?.name}</div>
          <Link to="/profile" className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Profile</Link>
          <Link to="/change-password" className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">Change Password</Link>
          <Link to="/notifications" className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
            Notifications ({unreadCount})
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
