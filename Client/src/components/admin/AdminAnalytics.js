import React, { useState, useEffect } from 'react';
import { FiBarChart, FiTrendingUp, FiTrendingDown, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    period: '',
    reportsCreated: 0,
    reportsCompleted: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    userRegistrations: [],
    reportsByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/admin/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive system analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="form-input w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reports Created</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics.reportsCreated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reports Completed</h3>
              <p className="text-2xl font-bold text-green-600">{analytics.reportsCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <FiBarChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
              <p className="text-2xl font-bold text-yellow-600">{analytics.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <FiTrendingDown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Avg Completion Time</h3>
              <p className="text-2xl font-bold text-purple-600">{analytics.avgCompletionTime} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reports by Status</h3>
          </div>
          <div className="p-6">
            {analytics.reportsByStatus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.reportsByStatus.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{status._id}</span>
                    <span className="font-semibold text-gray-900">{status.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Registrations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Registrations</h3>
          </div>
          <div className="p-6">
            {analytics.userRegistrations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.userRegistrations.slice(-5).map((registration) => (
                  <div key={registration._id} className="flex items-center justify-between">
                    <span className="text-gray-600">{registration._id}</span>
                    <span className="font-semibold text-gray-900">{registration.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.reportsCreated}</div>
              <div className="text-sm text-gray-600">Total Reports Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.reportsCompleted}</div>
              <div className="text-sm text-gray-600">Reports Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{analytics.completionRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Insights</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>System processed {analytics.reportsCreated} reports in the last {analytics.period} days</p>
          </div>
          <div className="flex items-start">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Average completion time is {analytics.avgCompletionTime} days</p>
          </div>
          <div className="flex items-start">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Overall system efficiency is {analytics.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 