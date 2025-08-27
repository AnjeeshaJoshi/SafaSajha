const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isRead, type, category } = req.query;
    // Coerce pagination params to numbers; support limit=0 to fetch all
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    
    const filter = { user: req.user.id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    if (category) filter.category = category;

    let query = Notification.find(filter).sort({ createdAt: -1 });
    if (limit !== 0) {
      query = query.limit(limit).skip((page - 1) * limit);
    }
    const notifications = await query;

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({
      notifications,
      totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      currentPage: limit === 0 ? 1 : page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
 
// Delete a notification
// @route   DELETE /api/notifications/:id
// @desc    Delete a notification for the current user
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});