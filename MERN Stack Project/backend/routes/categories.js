const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// admin only
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Category name is required.' });
    if (await Category.findOne({ name: name.trim() })) return res.status(400).json({ message: 'That category already exists.' });
    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// admin only
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
