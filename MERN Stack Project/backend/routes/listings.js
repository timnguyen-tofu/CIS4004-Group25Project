// ── Listings Routes ──────────────────────────────────────────
// GET    /api/listings              - Get all active listings
// GET    /api/listings/mine         - Get the logged-in user's listings
// GET    /api/listings/:id          - Get one listing by ID
// POST   /api/listings              - Create a new listing (auth required)
// PUT    /api/listings/:id          - Update a listing (owner or admin only)
// DELETE /api/listings/:id          - Delete a listing (owner or admin only)
// POST   /api/listings/:id/images   - Upload images (max 5 total, owner or admin)
// DELETE /api/listings/:id/images/:filename - Delete one image (owner or admin)

const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const Listing = require('../models/Listing');
const { verifyToken } = require('../middleware/auth');

// ── Multer config — saves files to backend/listing-images/ ────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'listing-images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `listing_${req.params.id}_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB per file
});

// ── GET all active listings (with optional filters) ───────────
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (search)   filter.title = { $regex: search, $options: 'i' };

    const listings = await Listing.find(filter)
      .populate('seller', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET current user's listings ───────────────────────────────
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── GET one listing by ID ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'username firstName lastName');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST create a new listing ─────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const listing = new Listing({ ...req.body, seller: req.user.id });
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── PUT update a listing ──────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own listings.' });
    }

    // Don't allow overwriting images via PUT — use the dedicated image routes
    const { images, ...updateFields } = req.body;

    const updated = await Listing.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── DELETE a listing ──────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own listings.' });
    }

    // Delete all associated image files from disk
    for (const filename of listing.images) {
      const filePath = path.join(__dirname, '..', 'listing-images', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ── POST upload images for a listing ─────────────────────────
router.post('/:id/images', verifyToken, (req, res, next) => {
  // Need listing id for multer filename, so check ownership first inline
  upload.array('images', 5)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: 'Listing not found.' });

      if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        // Clean up uploaded files
        for (const f of req.files) fs.unlinkSync(f.path);
        return res.status(403).json({ message: 'Not authorized.' });
      }

      const currentCount = listing.images.length;
      const incoming     = req.files.length;

      if (currentCount + incoming > 5) {
        for (const f of req.files) fs.unlinkSync(f.path);
        return res.status(400).json({ message: `Max 5 images per listing. You have ${currentCount} already.` });
      }

      const newFilenames = req.files.map(f => f.filename);
      listing.images.push(...newFilenames);
      await listing.save();

      res.json({ images: listing.images });
    } catch (e) {
      res.status(500).json({ message: 'Server error.', error: e.message });
    }
  });
});

// ── DELETE a single image from a listing ─────────────────────
router.delete('/:id/images/:filename', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { filename } = req.params;
    if (!listing.images.includes(filename)) {
      return res.status(404).json({ message: 'Image not found on this listing.' });
    }

    // Remove from disk
    const filePath = path.join(__dirname, '..', 'listing-images', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    listing.images = listing.images.filter(img => img !== filename);
    await listing.save();

    res.json({ images: listing.images });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
