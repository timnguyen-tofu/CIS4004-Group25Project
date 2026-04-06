// ── Events Routes ─────────────────────────────────────────────
// GET    /api/events              - Get all published events
// GET    /api/events/user/rsvps   - Get events the user has RSVP'd to
// GET    /api/events/:id          - Get one event
// POST   /api/events              - Create event (admin only)
// PUT    /api/events/:id          - Update event (admin only)
// DELETE /api/events/:id          - Delete event (admin only)
// POST   /api/events/:id/rsvp     - RSVP to an event (auth required)
// DELETE /api/events/:id/rsvp     - Cancel RSVP (auth required)
// GET    /api/events/:id/rsvpcount- Get RSVP count for an event

const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');
const RSVP    = require('../models/RSVP');
const User    = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ── GET all published events ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = { status: 'published' };
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .populate('organizer', 'username')
      .sort({ date: 1 });  // Soonest first

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET events the current user has RSVP'd to ─────────────────
// Must come before /:id to avoid conflict
router.get('/user/rsvps', verifyToken, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id }).populate('event');
    const events = rsvps.map(r => r.event).filter(Boolean);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET one event by ID ───────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST create a new event (admin only) ──────────────────────
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── PUT update an event (admin only) ──────────────────────────
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── DELETE an event (admin only) ──────────────────────────────
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    // Also clean up all RSVPs for this event
    await RSVP.deleteMany({ event: req.params.id });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST RSVP to an event (Many-to-Many: User ↔ Event) ────────
router.post('/:id/rsvp', verifyToken, async (req, res) => {
  try {
    const existing = await RSVP.findOne({ user: req.user.id, event: req.params.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event.' });
    }
    const rsvp = new RSVP({ user: req.user.id, event: req.params.id });
    await rsvp.save();
    res.status(201).json({ message: 'RSVP successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── DELETE cancel an RSVP ─────────────────────────────────────
router.delete('/:id/rsvp', verifyToken, async (req, res) => {
  try {
    await RSVP.findOneAndDelete({ user: req.user.id, event: req.params.id });
    res.json({ message: 'RSVP cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET RSVP count for an event ───────────────────────────────
router.get('/:id/rsvpcount', async (req, res) => {
  try {
    const count = await RSVP.countDocuments({ event: req.params.id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET list of users who RSVPed to an event ──────────────────
router.get('/:id/rsvps', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.id })
      .populate('user', 'username firstName lastName');
    const attendees = rsvps.map(r => r.user).filter(Boolean);
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
