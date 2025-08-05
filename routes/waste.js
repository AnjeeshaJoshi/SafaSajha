const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const WasteReport = require('../models/WasteReport');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/waste/report
// @desc    Create a new waste report
// @access  Private
router.post('/report', [
  auth,
  body('type', 'Waste type is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('location.address', 'Address is required').not().isEmpty(),
  body('quantity', 'Quantity is required').not().isEmpty(),
  body('urgency', 'Urgency level is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      type,
      description,
      location,
      quantity,
      urgency,
      scheduledDate,
      notes
    } = req.body;

    const newReport = new WasteReport({
      user: req.user.id,
      type,
      description,
      location,
      quantity,
      urgency,
      scheduledDate: scheduledDate || null,
      notes: notes || ''
    });

    const report = await newReport.save();

    // Emit real-time notification to admins
    if (global.io) {
      global.io.emit('newWasteReport', {
        report,
        user: req.user
      });
    }

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/waste/reports
// @desc    Get user's waste reports
// @access  Private
router.get('/reports', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = { user: req.user.id };

    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await WasteReport.find(query)
      .sort({ createdAt: -1 })
      .populate('user', ['name', 'email']);

    res.json({ reports });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/waste/reports/:id
// @desc    Get specific waste report
// @access  Private
router.get('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate('user', ['name', 'email']);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Check if user owns the report or is admin
    if (report.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/waste/reports/:id
// @desc    Update waste report
// @access  Private
router.put('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Check if user owns the report or is admin
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedReport = await WasteReport.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('user', ['name', 'email']);

    res.json(updatedReport);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/waste/reports/:id
// @desc    Cancel waste report
// @access  Private
router.delete('/reports/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Check if user owns the report or is admin
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Only allow cancellation if status is pending
    if (report.status !== 'pending') {
      return res.status(400).json({ msg: 'Can only cancel pending reports' });
    }

    await report.remove();
    res.json({ msg: 'Report cancelled' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/waste/reports/:id/feedback
// @desc    Submit feedback for completed report
// @access  Private
router.post('/reports/:id/feedback', [
  auth,
  body('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
  body('comment', 'Comment is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Only allow feedback for completed reports
    if (report.status !== 'completed') {
      return res.status(400).json({ msg: 'Can only submit feedback for completed reports' });
    }

    report.feedback = {
      rating: req.body.rating,
      comment: req.body.comment,
      submittedAt: Date.now()
    };

    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Admin Routes

// @route   GET /api/waste/admin/reports
// @desc    Get all waste reports (admin only)
// @access  Private/Admin
router.get('/admin/reports', adminAuth, async (req, res) => {
  try {
    const { status, type, urgency } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (urgency) query.urgency = urgency;

    const reports = await WasteReport.find(query)
      .sort({ createdAt: -1 })
      .populate('user', ['name', 'email']);

    res.json({ reports });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/waste/admin/reports/:id/assign
// @desc    Assign report to staff (admin only)
// @access  Private/Admin
router.put('/admin/reports/:id/assign', [
  adminAuth,
  body('assignedTo', 'Staff assignment is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    report.status = 'assigned';
    report.assignedTo = req.body.assignedTo;
    report.assignedAt = Date.now();

    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 