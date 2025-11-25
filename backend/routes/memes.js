const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// GET all memes (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const memes = await Meme.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Meme.countDocuments();

    res.json({
      memes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMemes: total
    });
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// GET single meme by ID
router.get('/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ error: 'Failed to fetch meme' });
  }
});

// POST new meme
router.post('/', async (req, res) => {
  try {
    const { name, imageData, template, captions } = req.body;

    if (!name || !imageData || !template) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meme = new Meme({
      name,
      imageData,
      template,
      captions: captions || []
    });

    await meme.save();
    res.status(201).json(meme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

// DELETE meme by ID
router.delete('/:id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

module.exports = router;
