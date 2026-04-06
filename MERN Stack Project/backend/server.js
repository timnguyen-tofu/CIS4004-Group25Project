const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/listing-images', express.static(path.join(__dirname, 'listing-images')));

const authRoutes     = require('./routes/auth');
const listingRoutes  = require('./routes/listings');
const eventRoutes    = require('./routes/events');
const messageRoutes  = require('./routes/messages');
const userRoutes     = require('./routes/users');
const categoryRoutes = require('./routes/categories');

app.use('/api/auth',       authRoutes);
app.use('/api/listings',   listingRoutes);
app.use('/api/events',     eventRoutes);
app.use('/api/messages',   messageRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => res.json({ message: 'Knight Market API is running!' }));

const seed = require('./seed');
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seed();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection failed:', err.message));
