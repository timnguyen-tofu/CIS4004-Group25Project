// ── Users Routes (Admin Only) ─────────────────────────────────
// GET    /api/users            - Get all users
// GET    /api/users/stats      - Get dashboard stats
// GET    /api/users/:id        - Get one user
// PUT    /api/users/:id        - Update a user (role, status)
// DELETE /api/users/:id        - Delete a user and their listings

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Listing = require('../models/Listing');
const Event   = require('../models/Event');
const RSVP    = require('../models/RSVP');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ── GET admin dashboard stats ─────────────────────────────────
// Must come before /:id to avoid being treated as an ID
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

// ── GET all users ─────────────────────────────────────────────
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Never return passwords — use .select('-password')
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET one user by ID ────────────────────────────────────────
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── PUT update a user (e.g. change role) ─────────────────────
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Don't allow password changes through this route
    const { password, ...updateData } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── DELETE a user and all their data ──────────────────────────
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Clean up all listings by this user
    await Listing.deleteMany({ seller: req.params.id });
    // Clean up all RSVPs by this user
    await RSVP.deleteMany({ user: req.params.id });

    res.json({ message: 'User and their data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
