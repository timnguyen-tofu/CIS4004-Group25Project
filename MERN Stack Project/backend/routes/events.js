const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// get all published events, supports ?category=
router.get('/', async (req, res) => {
  try {
    const filter = { status: 'published' };
    if (req.query.category) filter.category = req.query.category;
    const events = await Event.find(filter).populate('organizer', 'username').sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// must be before /:id to avoid route conflict
router.get('/user/rsvps', verifyToken, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user.id }).populate('event');
    res.json(rsvps.map(r => r.event).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// admin only
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// admin only
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Event not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// admin only — also deletes all RSVPs for this event
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await RSVP.deleteMany({ event: req.params.id });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.post('/:id/rsvp', verifyToken, async (req, res) => {
  try {
    if (await RSVP.findOne({ user: req.user.id, event: req.params.id })) {
      return res.status(400).json({ message: "You've already RSVP'd." });
    }
    await RSVP.create({ user: req.user.id, event: req.params.id });
    res.status(201).json({ message: 'RSVP successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.delete('/:id/rsvp', verifyToken, async (req, res) => {
  try {
    await RSVP.findOneAndDelete({ user: req.user.id, event: req.params.id });
    res.json({ message: 'RSVP cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/:id/rsvpcount', async (req, res) => {
  try {
    const count = await RSVP.countDocuments({ event: req.params.id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/:id/rsvps', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.id }).populate('user', 'username firstName lastName');
    res.json(rsvps.map(r => r.user).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
