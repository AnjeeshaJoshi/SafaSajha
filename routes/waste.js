const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const WasteReport = require('../models/WasteReport');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// Status constants for better maintainability
const STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Validation middleware
const validateReport = [
  body('type').notEmpty().withMessage('Waste type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('quantity').notEmpty().withMessage('Quantity is required'),
  body('urgency').notEmpty().withMessage('Urgency level is required')
];

const validateStatus = [
  body('status').isIn(Object.values(STATUS)).withMessage('Invalid status value')
];

// Helper function to handle errors
const handleError = (res, err, defaultMessage = 'Server Error') => {
  console.error(err.message);
  if (err.kind === 'ObjectId') {
    return res.status(404).json({ msg: 'Report not found' });
  }
  res.status(500).json({ msg: defaultMessage });
};

// Create a new waste report
router.post('/report', [auth, ...validateReport], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const report = new WasteReport({
      user: req.user.id,
      ...req.body,
      status: STATUS.PENDING, // Ensure new reports start as pending
      scheduledDate: req.body.scheduledDate || null,
      notes: req.body.notes || ''
    });

    await report.save();

    // Create notification for all admins about new report
    try {
      const adminUsers = await User.find({ role: 'admin', isActive: true }).select('_id');
      const adminNotifications = adminUsers.map((admin) => ({
        user: admin._id,
        title: 'New Waste Report Submitted',
        message: `${req.user.name || 'A user'} submitted a new ${report.type} waste report`,
        type: 'info',
        category: 'report',
        metadata: { wasteReportId: report._id }
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
        if (global.io) {
          adminUsers.forEach((admin) => {
            global.io.to(String(admin._id)).emit('notification', {
              title: 'New Waste Report Submitted',
              message: `${req.user.name || 'A user'} submitted a new ${report.type} waste report`,
              type: 'info',
              category: 'report',
              metadata: { wasteReportId: report._id }
            });
          });
        }
      }
    } catch (notifyErr) {
      console.error('Failed to notify admins about new report:', notifyErr);
    }

    // Emit socket event if available
    if (global.io) {
      global.io.emit('newWasteReport', {
        report,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      });
    }

    res.status(201).json(report);
  } catch (err) {
    handleError(res, err);
  }
});

// Get user's waste reports
router.get('/reports', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await WasteReport.find(query)
      .sort({ createdAt: -1 })
      .populate('user', ['name', 'email']);

    res.json({ reports });
  } catch (err) {
    handleError(res, err);
  }
});

// Update status of a report (admin only)
router.put('/reports/:id/status', [adminAuth, ...validateStatus], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), req });

  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    const { status } = req.body;

    // Validate status transition
    if (status === STATUS.COMPLETED &&
      ![STATUS.ASSIGNED, STATUS.IN_PROGRESS].includes(report.status)) {
      return res.status(400).json({
        msg: `Cannot mark as completed from ${report.status} status`
      });
    }

    report.status = status;
    if (status === STATUS.COMPLETED) {
      report.completedDate = new Date();
    }
    await report.save();

    // Notify user about status change
    try {
      await Notification.create({
        user: report.user,
        title: 'Waste Report Status Updated',
        message: `Your waste report status changed to ${status}`,
        type: 'info',
        category: 'report',
        metadata: { wasteReportId: report._id }
      });
      if (global.io) {
        global.io.to(String(report.user)).emit('notification', {
          title: 'Waste Report Status Updated',
          message: `Your waste report status changed to ${status}`,
          type: 'info',
          category: 'report',
          metadata: { wasteReportId: report._id }
        });
      }
    } catch (notifyErr) {
      console.error('Failed to notify user about status change:', notifyErr);
    }

    res.json(report);
  } catch (err) {
    handleError(res, err);
  }
});

// Get specific waste report
router.get('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate('user', ['name', 'email']);

    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Authorization check
    if (report.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(report);
  } catch (err) {
    handleError(res, err);
  }
});

// Update waste report
router.put('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Authorization check
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const updatedReport = await WasteReport.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', ['name', 'email']);

    res.json(updatedReport);
  } catch (err) {
    handleError(res, err);
  }
});

// Delete waste report
router.delete('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Authorization check
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Business rule: Only pending reports can be deleted
    if (report.status !== STATUS.PENDING) {
      return res.status(400).json({
        msg: 'Only pending reports can be deleted'
      });
    }

    await report.deleteOne();
    res.json({ msg: 'Report deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
});


// Admin Routes

// Get all waste reports (admin only)
router.get('/admin/reports', adminAuth, async (req, res) => {
  try {
    const { status, type, urgency } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (urgency) query.urgency = urgency;

    const reports = await WasteReport.find(query)
      .sort({ createdAt: -1 })
      .populate('user', ['name', 'email'])
      .populate('assignedTo', ['name', 'email']);

    res.json({ reports });
  } catch (err) {
    handleError(res, err);
  }
});

// Assign report to staff (admin only)
router.put('/admin/reports/:id/assign', [
  adminAuth,
  body('assignedTo', 'Staff assignment is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    report.status = STATUS.ASSIGNED;
    report.assignedTo = req.body.assignedTo;
    report.assignedAt = Date.now();

    await report.save();

    // Notify user about assignment
    try {
      await Notification.create({
        user: report.user,
        title: 'Waste Report Assigned',
        message: 'Your waste report has been assigned to a staff member',
        type: 'success',
        category: 'report',
        metadata: { wasteReportId: report._id }
      });
      if (global.io) {
        global.io.to(String(report.user)).emit('notification', {
          title: 'Waste Report Assigned',
          message: 'Your waste report has been assigned to a staff member',
          type: 'success',
          category: 'report',
          metadata: { wasteReportId: report._id }
        });
      }
    } catch (notifyErr) {
      console.error('Failed to notify user about assignment:', notifyErr);
    }
    res.json(report);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;