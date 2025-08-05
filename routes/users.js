const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Phone number is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, address, profileImage } = req.body;

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        phone,
        address,
        profileImage
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notifications, wasteSchedule } = req.body;

    const updateData = {};
    if (notifications) updateData.preferences = { notifications };
    if (wasteSchedule) {
      updateData.preferences = {
        ...updateData.preferences,
        wasteSchedule
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const WasteReport = require('../models/WasteReport');
    
    // Get total reports by user
    const totalReports = await WasteReport.countDocuments({ user: req.user.id });
    
    // Get reports by status
    const pendingReports = await WasteReport.countDocuments({ 
      user: req.user.id, 
      status: 'pending' 
    });
    const completedReports = await WasteReport.countDocuments({ 
      user: req.user.id, 
      status: 'completed' 
    });
    
    // Get reports by type
    const reportsByType = await WasteReport.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get average rating from feedback
    const avgRating = await WasteReport.aggregate([
      {
        $match: { 
          user: req.user._id,
          'feedback.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    res.json({
      totalReports,
      pendingReports,
      completedReports,
      reportsByType,
      avgRating: avgRating.length > 0 ? avgRating[0].avgRating.toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 