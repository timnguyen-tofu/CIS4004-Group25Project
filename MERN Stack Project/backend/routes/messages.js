// ── Messages Routes ───────────────────────────────────────────
// GET   /api/messages/conversations     - All conversations + unread counts
// GET   /api/messages/unread-count      - Total unread count (for badge)
// GET   /api/messages/:userId           - Messages with a specific user
// POST  /api/messages                   - Send a new message
// PATCH /api/messages/:userId/read      - Mark conversation as read

const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');

// ── GET all conversations with per-conversation unread count ──
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender',   'username firstName lastName')
      .populate('receiver', 'username firstName lastName')
      .populate('listing',  'title price category')
      .sort({ createdAt: -1 });

    const seen = {};
    const conversations = [];

    messages.forEach((msg) => {
      const other =
        msg.sender._id.toString() === req.user.id
          ? msg.receiver
          : msg.sender;

      const key = other._id.toString();
      if (!seen[key]) {
        seen[key] = true;
        conversations.push({
          user:        other,
          lastMessage: msg,
          listing:     msg.listing,
          unreadCount: 0   // filled below
        });
      }
    });

    // Count unread per conversation partner
    // Use { $ne: true } so messages created before the 'read' field existed are treated as unread
    const mongoose = require('mongoose');
    const unreadAgg = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(req.user.id), read: { $ne: true } } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);
    const unreadMap = {};
    unreadAgg.forEach(r => { unreadMap[r._id.toString()] = r.count; });

    conversations.forEach(c => {
      c.unreadCount = unreadMap[c.user._id.toString()] || 0;
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET messages between me and another user ──────────────────
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id,       receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .populate('sender',  'username')
      .populate('listing', 'title price category')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST send a new message ───────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiver, content, listing } = req.body;
    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required.' });
    }

    const message = new Message({
      sender:   req.user.id,
      receiver: receiver,
      content:  content,
      listing:  listing || null,
      read:     false
    });

    await message.save();
    await message.populate('sender', 'username');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
