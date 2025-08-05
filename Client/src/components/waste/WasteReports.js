import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const WasteReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  // const fetchReports = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get('/api/admin/dashboard');
  //     const recentReports = response.data.recentReports || [];
  //     setReports(recentReports);
  //   } catch (error) {
  //     console.error('Error fetching dashboard data:', error);
  //     toast.error('Failed to load waste reports');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let response;

      if (user?.role === 'admin') {
        // Fetch from admin dashboard or reports
        response = await axios.get('/api/admin/dashboard'); // or /api/admin/dashboard if you use that
        setReports(response.data.recentReports || []);
      } else {
        // Fetch user's own reports
        response = await axios.get('/api/waste/reports');
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load waste reports');
    } finally {
      setLoading(false);
    }
  };


  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status ? report.status === filters.status : true;
    const matchesType = filters.type ? report.type === filters.type : true;
    const search = filters.search.toLowerCase();
    const matchesSearch = !filters.search
      ? true
      : report.description?.toLowerCase().includes(search) ||
      report.type?.toLowerCase().includes(search) ||
      report.location?.address?.toLowerCase().includes(search);

    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusStyles = (status) => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return `${base} ${colors[status] || colors.default}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'completed':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Reports</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin'
              ? 'Manage all waste collection reports'
              : 'View your submitted reports'}
          </p>
        </div>
        {user?.role === 'user' && (
          <Link to="/report" className="btn-primary">
            <FiFileText className="w-4 h-4 mr-2" />
            New Report
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="form-label">Type</label>
            <select
              className="form-input"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="recyclable">Recyclable</option>
              <option value="hazardous">Hazardous</option>
              <option value="organic">Organic</option>
              <option value="electronic">Electronic</option>
            </select>
          </div>

          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                className="form-input pl-3"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', search: '' })}
              className="btn-secondary w-full"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading or Report List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent" />
        </div>
      ) : (

        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Reports ({filteredReports.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
                {user?.role === 'user' && (
                  <Link
                    to="/report"
                    className="mt-2 inline-block text-green-600 hover:text-green-700 font-medium"
                  >
                    Create your first report
                  </Link>
                )}
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <div className={`p-2 rounded-full ${getStatusStyles(report.status)}`}>
                        {getStatusIcon(report.status)}
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-semibold capitalize">
                          {report.type} Waste
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {report.location?.address || 'No address'} •{' '}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={getStatusStyles(report.status)}>{report.status}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.quantity} • {report.urgency}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteReports;
