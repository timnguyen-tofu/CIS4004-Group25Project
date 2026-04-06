const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');

// get all conversations with unread count per partner
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

    messages.forEach(msg => {
      const other = msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
      const key = other._id.toString();
      if (!seen[key]) {
        seen[key] = true;
        conversations.push({ user: other, lastMessage: msg, listing: msg.listing, unreadCount: 0 });
      }
    });

    // count unread messages per conversation partner
    const mongoose = require('mongoose');
    const unreadAgg = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(req.user.id), read: { $ne: true } } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);

    const unreadMap = {};
    unreadAgg.forEach(r => { unreadMap[r._id.toString()] = r.count; });
    conversations.forEach(c => { c.unreadCount = unreadMap[c.user._id.toString()] || 0; });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// get message thread between current user and another user
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

// send a message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiver, content, listing } = req.body;
    if (!receiver || !content) return res.status(400).json({ message: 'Receiver and content are required.' });
    const message = await Message.create({
      sender: req.user.id, receiver, content, listing: listing || null, read: false
    });
    await message.populate('sender', 'username');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
