// ── Entity 5: RSVP ───────────────────────────────────────────
// This model represents the MANY-TO-MANY relationship
// between Users and Events.
//
// - One User can RSVP to MANY Events
// - One Event can have MANY Users RSVP'd
//
// The compound unique index prevents a user from RSVPing twice.

const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: a user can only RSVP to the same event once
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
