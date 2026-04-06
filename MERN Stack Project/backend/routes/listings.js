const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Listing = require('../models/Listing');
const { verifyToken } = require('../middleware/auth');

// multer — saves uploads to backend/listing-images/
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
  cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// get all active listings, supports ?category= and ?search=
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const listings = await Listing.find(filter)
      .populate('seller', 'username firstName lastName')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// must come before /:id to avoid route conflict
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'username firstName lastName');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.create({ ...req.body, seller: req.user.id });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own listings.' });
    }
    // images managed separately via image routes
    const { images, ...updateFields } = req.body;
    const updated = await Listing.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own listings.' });
    }
    // delete image files from disk
    for (const filename of listing.images) {
      const filePath = path.join(__dirname, '..', 'listing-images', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// upload images for a listing (max 5 total)
router.post('/:id/images', verifyToken, (req, res) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: 'Listing not found.' });
      if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        for (const f of req.files) fs.unlinkSync(f.path);
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (listing.images.length + req.files.length > 5) {
        for (const f of req.files) fs.unlinkSync(f.path);
        return res.status(400).json({ message: `Max 5 images. You have ${listing.images.length} already.` });
      }
      listing.images.push(...req.files.map(f => f.filename));
      await listing.save();
      res.json({ images: listing.images });
    } catch (e) {
      res.status(500).json({ message: 'Server error.', error: e.message });
    }
  });
});

// delete one image from a listing
router.delete('/:id/images/:filename', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const { filename } = req.params;
    if (!listing.images.includes(filename)) return res.status(404).json({ message: 'Image not found.' });
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
