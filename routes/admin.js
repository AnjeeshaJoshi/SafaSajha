const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const WasteReport = require('../models/WasteReport');
const Notification = require('../models/Notification');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics with latest 5 reports
// @access  Private/Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });

    const pendingReports = await WasteReport.countDocuments({ status: 'pending' });
    const assignedReports = await WasteReport.countDocuments({ status: 'assigned' });
    const inProgressReports = await WasteReport.countDocuments({ status: 'in-progress' });
    const completedReports = await WasteReport.countDocuments({ status: 'completed' });

    const reportsByType = await WasteReport.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const reportsByUrgency = await WasteReport.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    const recentReports = await WasteReport.find()
      .sort({ createdAt: -1 })
      .limit(5)               // Limit to 5 reports for dashboard
      .populate('user', 'name email');

    const currentYear = new Date().getFullYear();
    const monthlyStats = await WasteReport.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      reports: {
        pending: pendingReports,
        assigned: assignedReports,
        inProgress: inProgressReports,
        completed: completedReports,
        total: pendingReports + assignedReports + inProgressReports + completedReports
      },
      reportsByType,
      reportsByUrgency,
      recentReports,
      monthlyStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all waste reports (admin only)
// @access  Private/Admin
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reports = await WasteReport.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details (admin only)
// @access  Private/Admin
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reports = await WasteReport.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, reports });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, role, isActive, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Deactivate user (admin only)
// @access  Private/Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/notifications/broadcast
// @desc    Send broadcast notification to all users (admin only)
// @access  Private/Admin
router.post('/notifications/broadcast', [
  adminAuth,
  check('title', 'Title is required').notEmpty(),
  check('message', 'Message is required').notEmpty(),
  check('type', 'Type is required').isIn(['info', 'success', 'warning', 'error', 'reminder'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, message, type, category = 'general' } = req.body;

    const users = await User.find({ isActive: true, role: 'user' });

    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type,
      category
    }));

    await Notification.insertMany(notifications);

    res.json({
      message: `Broadcast notification sent to ${users.length} users`,
      count: users.length
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data (admin only)
// @access  Private/Admin
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reportsCreated = await WasteReport.countDocuments({ createdAt: { $gte: startDate } });
    const reportsCompleted = await WasteReport.countDocuments({ completedDate: { $gte: startDate } });

    const completionTimes = await WasteReport.aggregate([
      { $match: { completedDate: { $gte: startDate }, createdAt: { $exists: true } } },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$completedDate', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgCompletionTime: { $avg: '$completionTime' }
        }
      }
    ]);

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const reportsByStatus = await WasteReport.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      period: `${days} days`,
      reportsCreated,
      reportsCompleted,
      completionRate: reportsCreated > 0 ? ((reportsCompleted / reportsCreated) * 100).toFixed(2) : 0,
      avgCompletionTime: completionTimes.length > 0 ? completionTimes[0].avgCompletionTime.toFixed(2) : 0,
      userRegistrations,
      reportsByStatus
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
