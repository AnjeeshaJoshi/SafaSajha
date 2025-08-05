const mongoose = require('mongoose');

const wasteReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'recyclable', 'hazardous', 'organic', 'electronic'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  quantity: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    default: 1
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
wasteReportSchema.index({ user: 1, status: 1 });
wasteReportSchema.index({ scheduledDate: 1 });
wasteReportSchema.index({ status: 1, urgency: 1 });

module.exports = mongoose.model('WasteReport', wasteReportSchema); 