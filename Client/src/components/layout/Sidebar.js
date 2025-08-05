import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome, FiFileText, FiPlus, FiUsers,
  FiBarChart, FiUser, FiBell
} from 'react-icons/fi';
import axios from 'axios';

const Sidebar = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        if (user.role === 'admin') {
          const { data } = await axios.get('/api/admin/dashboard', config);
          setStats({
            totalUsers: data.totalUsers,
            activeReports: data.reports.pending + data.reports.assigned + data.reports.inProgress,
            completedToday: data.reports.completed // Optional: refine by today
          });
        } else {
          const { data } = await axios.get('/api/waste/stats', config);
          setStats({
            totalReports: data.total,
            pending: data.pending,
            completed: data.completed
          });
        }
      } catch (error) {
        console.error('Sidebar stats fetch error:', error);
      }
    };

    fetchStats();
  }, [user, token]);

  const userMenuItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Report Issue', path: '/report', icon: FiPlus },
    { name: 'My Reports', path: '/reports', icon: FiFileText },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Profile', path: '/profile', icon: FiUser }
  ];

  const adminMenuItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Reports', path: '/admin/reports', icon: FiFileText },
    { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Profile', path: '/profile', icon: FiUser }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
          {/* <div className="h-8 w-8 bg-white-600 rounded-full flex items-center justify-center mr-3">
            {/* <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg> */}
          {/* <img src="/admin.png" alt="icon" className="h-15 w-15" /> */}
          {/* if this is admin pannel then use that icon */}
          {/* <i className="bi bi-person-fill-gear text-black fs-2"></i> */}

          {/* if this is user pannel then use that icon */}
          {/* <i className="bi bi-person-fill text-black fs-2"></i> */}

          {/* </div>
          <span className="text-lg font-semibold text-gray-900">
            {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
          </span>
        </div> */}
          <div className="flex items-center mb-8">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              {user?.role === 'admin' ? (
                <i className="bi bi-person-fill-gear text-black fs-2"></i>
              ) : (
                <i className="bi bi-person-fill text-black fs-2"></i>
              )}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
            </span>
          </div>


        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive(path)
                ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {name}
            </Link>
          ))}
        </nav>



        {/* Quick Stats */}
        {user?.role === 'user' && stats && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Reports:</span>
                <span className="font-medium">{stats.totalReports}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{stats.completed}</span>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'admin' && stats && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">System Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Reports:</span>
                <span className="font-medium text-blue-600">{stats.activeReports}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed Today:</span>
                <span className="font-medium text-green-600">{stats.completedToday}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
