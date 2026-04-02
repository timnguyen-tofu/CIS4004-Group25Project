// ── Entity 1: User ───────────────────────────────────────────
// Stores student accounts and admin accounts.
// Role determines what the user can see and do in the app.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,   // No duplicate usernames allowed
    trim: true
  },
  password: {
    type: String,
    required: true  // Stored as a bcrypt hash, never plain text
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],  // Only two roles are allowed
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
