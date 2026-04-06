const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// must be before /:id to avoid route conflict
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: 'user' });
    const totalListings = await Listing.countDocuments({ status: 'active' });
    const totalEvents   = await Event.countDocuments({ status: 'published' });
    const totalAdmins   = await User.countDocuments({ role: 'admin' });
    res.json({ totalUsers, totalListings, totalEvents, totalAdmins });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// don't allow password changes through this route
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// delete user and all their data
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Listing.deleteMany({ seller: req.params.id });
    await RSVP.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
