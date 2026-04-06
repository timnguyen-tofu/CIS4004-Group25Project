const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  password:  { type: String, required: true }, // bcrypt hash, never plain text
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  firstName: { type: String, trim: true },
  lastName:  { type: String, trim: true },
  role:      { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
