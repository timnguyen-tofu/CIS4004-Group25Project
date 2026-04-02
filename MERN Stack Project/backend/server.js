// ============================================================
// Knight Market - Backend Server
// Express.js + MongoDB (Mongoose)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Serve uploaded listing images as static files
app.use('/listing-images', express.static(path.join(__dirname, 'listing-images')));

// ── Import Routes ────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const listingRoutes  = require('./routes/listings');
const eventRoutes    = require('./routes/events');
const messageRoutes  = require('./routes/messages');
const userRoutes     = require('./routes/users');

// ── Use Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users',    userRoutes);

// ── Root route (health check) ────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Knight Market API is running!' });
});

// ── Connect to MongoDB and start server ──────────────────────
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
