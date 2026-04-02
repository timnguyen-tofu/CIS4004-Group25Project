// ── Entity 3: Event ──────────────────────────────────────────
// A campus event posted by an admin.
// Students can RSVP to events (see RSVP.js for the many-to-many).

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,   // e.g. "10:00 AM - 3:00 PM"
    default: ''
  },
  location: {
    type: String,
    default: 'UCF Main Campus'
  },
  category: {
    type: String,
    enum: ['Academic', 'Social', 'Sports', 'Arts', 'Career', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published'
  },
  // Reference to the admin User who created this event
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
