import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    avgRating: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/waste/reports?limit=5')
      ]);

      setStats(statsResponse.data);
      setRecentReports(reportsResponse.data.reports);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Assigned':
        return 'text-blue-600 bg-blue-100';
      case 'In-progress':
        return 'text-orange-600 bg-orange-100';
      case 'ompleted':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="h-4 w-4" />;
      case 'completed':
        return <FiCheckCircle className="h-4 w-4" />;
      default:
        return <FiAlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-green-100">
          Manage your waste reports and stay updated with your collection schedule.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/report"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <FiPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Issue</h3>
              <p className="text-sm text-gray-600">Submit a new waste report</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Reports</h3>
              <p className="text-sm text-gray-600">View all your reports</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reports</span>
              <span className="font-semibold">{stats.totalReports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingReports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{stats.completedReports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Rating</span>
              <span className="font-semibold text-blue-600">{stats.avgRating}/5</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Types</h3>
          <div className="space-y-3">
            {stats.reportsByType?.map((type) => (
              <div key={type._id} className="flex justify-between">
                <span className="text-gray-600 capitalize">{type._id}</span>
                <span className="font-semibold">{type.count}</span>
              </div>
            )) || (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Separate recyclables from general waste</p>
            </div>
            <div className="flex items-start">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Schedule pickups in advance for better service</p>
            </div>
            <div className="flex items-start">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Report hazardous waste separately</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <Link
              to="/reports"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports yet</p>
              <Link
                to="/report"
                className="mt-2 inline-block text-green-600 hover:text-green-700 font-medium"
              >
                Create your first report
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {report.type} Waste
                      </h4>
                      <p className="text-sm text-gray-600">
                        {report.description.substring(0, 50)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 