const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true },
  condition:   { type: String, required: true, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
  location:    { type: String, default: 'UCF Main Campus' },
  status:      { type: String, enum: ['active', 'sold', 'removed'], default: 'active' },
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images:      { type: [String], default: [] },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
