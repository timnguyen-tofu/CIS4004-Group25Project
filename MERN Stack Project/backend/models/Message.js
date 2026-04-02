// ── Entity 4: Message ────────────────────────────────────────
// A chat message between two users, optionally about a listing.
// Enables the buyer-seller messaging feature.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Who sent this message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who this message was sent to
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: which listing this conversation is about
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false   // true once the receiver has opened the conversation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
