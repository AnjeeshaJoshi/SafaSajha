import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const WasteReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: {
      address: user?.address?.street || '',
      coordinates: { lat: null, lng: null }
    },
    quantity: '',
    urgency: 'medium',
    scheduledDate: '',
    notes: ''
  });

  const wasteTypes = [
    { value: 'general', label: 'General Waste', description: 'Household waste, non-recyclable items' },
    { value: 'recyclable', label: 'Recyclable', description: 'Paper, plastic, glass, metal' },
    { value: 'hazardous', label: 'Hazardous Waste', description: 'Chemicals, batteries, electronics' },
    { value: 'organic', label: 'Organic Waste', description: 'Food waste, garden waste, compostable' },
    { value: 'electronic', label: 'Electronic Waste', description: 'Computers, phones, appliances' }
  ];

  const quantities = [
    { value: 'small', label: 'Small (1-2 bags)', description: 'Less than 50kg' },
    { value: 'medium', label: 'Medium (3-5 bags)', description: '50-100kg' },
    { value: 'large', label: 'Large (6+ bags)', description: 'More than 100kg' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Can wait 1-2 weeks' },
    { value: 'medium', label: 'Medium', description: 'Can wait 3-5 days' },
    { value: 'high', label: 'High', description: 'Needs attention within 24-48 hours' },
    { value: 'emergency', label: 'Emergency', description: 'Immediate attention required' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.type || !formData.description || !formData.location.address || !formData.quantity || !formData.scheduledDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await axios.post('/api/waste/report', formData);
      toast.success('Waste report submitted successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      const message = error.response?.data?.message || 'Failed to submit report';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Report Waste Issue</h1>
          <p className="text-gray-600 mt-2">
            Submit a waste collection request with detailed information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Waste Type */}
          <div>
            <label className="form-label">Waste Type *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wasteTypes.map((type) => (
                <div
                  key={type.value}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                    formData.type === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              rows={4}
              className="form-input"
              placeholder="Describe the waste issue in detail..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="form-label">Collection Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               
              </div>
              <input
                name="location.address"
                type="text"
                className="form-input pl-10"
                placeholder="Enter the collection address"
                value={formData.location.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Quantity and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Quantity *</label>
              <div className="space-y-3">
                {quantities.map((quantity) => (
                  <div
                    key={quantity.value}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                      formData.quantity === quantity.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, quantity: quantity.value }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="quantity"
                        value={quantity.value}
                        checked={formData.quantity === quantity.value}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{quantity.label}</h3>
                        <p className="text-sm text-gray-600">{quantity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Urgency Level</label>
              <div className="space-y-3">
                {urgencyLevels.map((urgency) => (
                  <div
                    key={urgency.value}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                      formData.urgency === urgency.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: urgency.value }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="urgency"
                        value={urgency.value}
                        checked={formData.urgency === urgency.value}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{urgency.label}</h3>
                        <p className="text-sm text-gray-600">{urgency.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="form-label">Preferred Collection Date *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                name="scheduledDate"
                type="date"
                className="form-input pl-10"
                min={getCurrentDate()}
                value={formData.scheduledDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="form-input"
              placeholder="Any additional information or special instructions..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Important Information</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>• Collection will be scheduled based on your preferred date</li>
                  <li>• You will receive notifications about the status of your request</li>
                  <li>• For hazardous waste, special handling procedures may apply</li>
                  <li>• Please ensure waste is properly contained and accessible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteReport; 