const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  createdAt: { type: Date, default: Date.now }
});

// prevent duplicate RSVPs from the same user
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
