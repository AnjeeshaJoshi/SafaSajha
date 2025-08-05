import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const WASTE_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'recyclable', label: 'Recyclable' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'organic', label: 'Organic' },
  { value: 'electronic', label: 'Electronic' },
];

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

  const fetchReports = async () => {
    setLoading(true);
    try {
      let response;

      if (user?.role === 'admin') {
        response = await axios.get('/api/admin/dashboard');
        setReports(response.data.recentReports || []);
      } else {
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

  const handleStatusChange = async (reportId, newStatus) => {
    if (!reportId || !newStatus) return;

    try {
      const res = await axios.put(`/api/waste/reports/${reportId}/status`, {
        status: newStatus
      });

      if (res.status === 200) {
        toast.success('Status updated successfully');
        setReports(prev =>
          prev.map(r => r._id === reportId ? { ...r, status: newStatus } : r)
        );
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await axios.delete(`/api/waste/reports/${reportId}`);

      // Check for both possible success responses from your backend
      if (response.data.msg === 'Report cancelled' || response.data.msg === 'Report deleted successfully') {
        toast.success(response.data.msg);
        setReports(prev => prev.filter(r => r._id !== reportId));
      } else {
        throw new Error(response.data.msg || 'Failed to delete report');
      }
    } catch (err) {
      console.error('Error deleting report:', err);

      // Show specific error message from backend if available
      const errorMessage = err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete report';

      // Check if this is the "can only cancel pending reports" error
      if (errorMessage.includes('Can only cancel pending reports')) {
        toast.error('Only pending reports can be deleted');
      } else {
        toast.error(errorMessage);
      }
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
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {WASTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
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
                      {user?.role === 'admin' ? (
                        <select
                          className={`${getStatusStyles(report.status)} capitalize`}
                          value={report.status}
                          onChange={(e) => handleStatusChange(report._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={getStatusStyles(report.status)}>{report.status}</span>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {report.quantity} • {report.urgency}
                      </p>
                    </div>
                  </div>

                  {/* Stylish Edit/Delete buttons */}
                  {user?.role === 'user' && report.status === 'pending' && (
                    <div className="flex justify-end mt-4 space-x-3">
                      <Link
                        to={`/edit-report/${report._id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 mr-1.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  )}
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